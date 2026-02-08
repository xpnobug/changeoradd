/**
 * 配置校验类型定义
 */

/** 验证结果 */
export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
};

/** 验证错误 */
export type ValidationError = {
  path: string;
  code: string;
  message: string;
  value?: unknown;
};

/** 验证警告 */
export type ValidationWarning = {
  path: string;
  code: string;
  message: string;
  suggestion?: string;
};

/** 验证上下文 */
export type ValidationContext = {
  fullConfig: Record<string, unknown>;
  path: string;
};

/** 验证规则 */
export type ValidationRule<T = unknown> = {
  code: string;
  message: string | ((value: T) => string);
  validate: (value: T, context?: ValidationContext) => boolean;
  severity: "error" | "warning";
};

/** 修复建议 */
export type FixSuggestion = {
  errorCode: string;
  description: string;
  autoFix?: () => Record<string, unknown>;
  manualSteps?: string[];
  docLink?: string;
};
