/**
 * 内置验证规则
 */
import type { ValidationRule } from "./types.js";

/** 必填字段 */
export const required = (field: string): ValidationRule => ({
  code: "REQUIRED_FIELD",
  message: `${field} 是必填项`,
  validate: (v) => v !== undefined && v !== null && v !== "",
  severity: "error",
});

/** 格式校验 */
export const pattern = (field: string, regex: RegExp, hint: string): ValidationRule<string> => ({
  code: "INVALID_FORMAT",
  message: `${field} 格式不正确，${hint}`,
  validate: (v) => !v || regex.test(v),
  severity: "error",
});

/** 唯一性校验 */
export const uniqueIn = (field: string, existing: unknown[]): ValidationRule => ({
  code: "DUPLICATE_VALUE",
  message: `${field} 已存在`,
  validate: (v) => !existing.includes(v),
  severity: "error",
});

/** 长度限制 */
export const maxLength = (field: string, max: number): ValidationRule<string> => ({
  code: "MAX_LENGTH_EXCEEDED",
  message: `${field} 超过 ${max} 字符`,
  validate: (v) => !v || v.length <= max,
  severity: "error",
});

/** 长度警告 */
export const maxLengthWarn = (field: string, max: number): ValidationRule<string> => ({
  code: "LENGTH_WARNING",
  message: `${field} 超过 ${max} 字符，可能影响性能`,
  validate: (v) => !v || v.length <= max,
  severity: "warning",
});

/** 废弃字段 */
export const deprecated = (field: string, alternative: string): ValidationRule => ({
  code: "DEPRECATED_FIELD",
  message: `${field} 已废弃，请使用 ${alternative}`,
  validate: () => true,
  severity: "warning",
});

/** 数值范围 */
export const range = (field: string, min: number, max: number): ValidationRule<number> => ({
  code: "OUT_OF_RANGE",
  message: `${field} 应在 ${min} - ${max} 之间`,
  validate: (v) => v === undefined || (v >= min && v <= max),
  severity: "error",
});

/** ID 格式 (小写字母、数字、连字符) */
export const validId = (field: string): ValidationRule<string> => ({
  code: "INVALID_ID_FORMAT",
  message: `${field} 只能包含小写字母、数字和连字符，且以字母开头`,
  validate: (v) => !v || /^[a-z][a-z0-9-]*$/.test(v),
  severity: "error",
});

/** URL 格式 */
export const validUrl = (field: string): ValidationRule<string> => ({
  code: "INVALID_URL",
  message: `${field} 不是有效的 URL`,
  validate: (v) => {
    if (!v) return true;
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  },
  severity: "error",
});
