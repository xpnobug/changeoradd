/**
 * 配置验证器
 */
import type { ValidationResult, ValidationError, ValidationWarning, ValidationRule, ValidationContext } from "./types.js";
import * as rules from "./rules.js";

/** 获取嵌套路径的值 */
function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((o, k) => (o as Record<string, unknown>)?.[k], obj);
}

/** 运行单个规则 */
function runRule<T>(
  rule: ValidationRule<T>,
  value: T,
  path: string,
  context?: ValidationContext
): ValidationError | ValidationWarning | null {
  if (rule.validate(value, context)) return null;
  
  const message = typeof rule.message === "function" ? rule.message(value) : rule.message;
  const base = { path, code: rule.code, message };
  
  return rule.severity === "error" 
    ? { ...base, value } as ValidationError
    : { ...base } as ValidationWarning;
}

/** Agent 字段验证规则 */
const AGENT_RULES: Record<string, ValidationRule[]> = {
  id: [rules.required("Agent ID"), rules.validId("Agent ID")],
  model: [rules.required("模型")],
  displayName: [rules.maxLength("显示名称", 50)],
  systemPrompt: [rules.maxLengthWarn("系统提示词", 32000)],
};

/** Channel 字段验证规则 */
const CHANNEL_RULES: Record<string, ValidationRule[]> = {
  type: [rules.required("通道类型")],
};

/** 验证对象 */
function validateObject(
  data: Record<string, unknown>,
  fieldRules: Record<string, ValidationRule[]>,
  basePath: string,
  context?: ValidationContext
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const [field, ruleList] of Object.entries(fieldRules)) {
    const value = data[field];
    const path = basePath ? `${basePath}.${field}` : field;

    for (const rule of ruleList) {
      const result = runRule(rule, value, path, context);
      if (result) {
        if ("value" in result) errors.push(result as ValidationError);
        else warnings.push(result as ValidationWarning);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/** 配置验证器 */
export class ConfigValidator {
  /** 验证 Agent 配置 */
  validateAgent(config: Record<string, unknown>, existingIds: string[] = []): ValidationResult {
    const result = validateObject(config, AGENT_RULES, "");
    
    // 唯一性检查
    if (config.id && existingIds.includes(config.id as string)) {
      result.errors.push({
        path: "id",
        code: "DUPLICATE_VALUE",
        message: "Agent ID 已存在",
        value: config.id,
      });
      result.valid = false;
    }
    
    return result;
  }

  /** 验证 Channel 配置 */
  validateChannel(config: Record<string, unknown>): ValidationResult {
    return validateObject(config, CHANNEL_RULES, "");
  }

  /** 验证完整配置 */
  validateFullConfig(config: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 验证 agents
    const agents = (config.agents as Record<string, unknown>[] | undefined) ?? [];
    const agentIds: string[] = [];
    
    agents.forEach((agent, i) => {
      const result = this.validateAgent(agent, agentIds);
      errors.push(...result.errors.map(e => ({ ...e, path: `agents.${i}.${e.path}` })));
      warnings.push(...result.warnings.map(w => ({ ...w, path: `agents.${i}.${w.path}` })));
      if (agent.id) agentIds.push(agent.id as string);
    });

    // 验证 channels
    const channels = (config.channels as Record<string, unknown>[] | undefined) ?? [];
    channels.forEach((channel, i) => {
      const result = this.validateChannel(channel);
      errors.push(...result.errors.map(e => ({ ...e, path: `channels.${i}.${e.path}` })));
      warnings.push(...result.warnings.map(w => ({ ...w, path: `channels.${i}.${w.path}` })));
    });

    return { valid: errors.length === 0, errors, warnings };
  }
}

export const validator = new ConfigValidator();
