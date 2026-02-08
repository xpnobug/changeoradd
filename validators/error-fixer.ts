/**
 * 错误修复建议
 */
import type { ValidationError, ValidationContext, FixSuggestion } from "./types.js";

type FixGenerator = (error: ValidationError, context?: ValidationContext) => FixSuggestion;

/** 修复建议映射 */
const FIX_MAP: Record<string, FixGenerator> = {
  REQUIRED_FIELD: (error) => ({
    errorCode: error.code,
    description: `请填写 ${error.path}`,
    manualSteps: [`在配置中添加 ${error.path} 字段`],
  }),

  INVALID_FORMAT: (error) => ({
    errorCode: error.code,
    description: `${error.path} 格式不正确`,
    manualSteps: [error.message],
  }),

  INVALID_ID_FORMAT: (error) => ({
    errorCode: error.code,
    description: "ID 格式不正确",
    manualSteps: [
      "ID 只能包含小写字母、数字和连字符",
      "必须以小写字母开头",
      `示例: my-agent-1`,
    ],
  }),

  DUPLICATE_VALUE: (error) => ({
    errorCode: error.code,
    description: `${error.path} 值重复`,
    manualSteps: [`将 "${error.value}" 改为其他唯一值`],
  }),

  MAX_LENGTH_EXCEEDED: (error) => ({
    errorCode: error.code,
    description: error.message,
    manualSteps: ["缩短内容长度"],
  }),

  MODEL_NOT_FOUND: (error) => ({
    errorCode: error.code,
    description: `模型 ${error.value} 不存在或未配置`,
    manualSteps: [
      "1. 检查模型名称是否正确",
      "2. 确认已配置对应的 Provider",
      "3. 验证 API Key 是否有效",
    ],
    docLink: "https://docs.openclaw.ai/providers",
  }),

  CHANNEL_AUTH_FAILED: () => ({
    errorCode: "CHANNEL_AUTH_FAILED",
    description: "通道认证失败",
    manualSteps: [
      "1. 检查 Token/API Key 是否正确",
      "2. 确认凭据未过期",
      "3. 检查网络连接",
    ],
  }),

  INVALID_URL: (error) => ({
    errorCode: error.code,
    description: `${error.path} 不是有效的 URL`,
    manualSteps: ["URL 应以 http:// 或 https:// 开头"],
  }),
};

/** 默认修复建议 */
const defaultFix: FixGenerator = (error) => ({
  errorCode: error.code,
  description: error.message,
  manualSteps: ["请检查配置并修正错误"],
});

/** 错误修复器 */
export class ErrorFixer {
  /** 获取单个错误的修复建议 */
  getSuggestion(error: ValidationError, context?: ValidationContext): FixSuggestion {
    const generator = FIX_MAP[error.code] ?? defaultFix;
    return generator(error, context);
  }

  /** 批量获取修复建议 */
  getSuggestions(errors: ValidationError[], context?: ValidationContext): FixSuggestion[] {
    return errors.map(e => this.getSuggestion(e, context));
  }
}

export const fixer = new ErrorFixer();
