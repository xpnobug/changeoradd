/**
 * 数据清理工具函数
 * Data sanitization utility functions
 */

/**
 * 将值转换为数字，如果无效则返回 undefined
 * Convert value to number, return undefined if invalid
 *
 * @param value - 要转换的值
 * @returns 数字或 undefined
 */
export function toNumberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}

/**
 * maxTokensField 的有效值
 * Valid values for maxTokensField
 */
const VALID_MAX_TOKENS_FIELDS = ["max_completion_tokens", "max_tokens"] as const;

/**
 * 清理 compat 配置
 * Sanitize compat config - validate enum fields and remove empty values
 *
 * @param compat - compat 配置对象
 * @returns 清理后的配置或 undefined
 */
export function sanitizeCompat(
  compat: Record<string, unknown>
): Record<string, unknown> | undefined {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(compat)) {
    // 跳过空字符串和 undefined
    if (value === "" || value === undefined || value === null) continue;

    // 特殊处理 maxTokensField - 必须是有效的枚举值
    if (key === "maxTokensField") {
      if (
        typeof value === "string" &&
        VALID_MAX_TOKENS_FIELDS.includes(value as typeof VALID_MAX_TOKENS_FIELDS[number])
      ) {
        result[key] = value;
      }
      // 无效值直接跳过，不添加到结果中
      continue;
    }

    result[key] = value;
  }

  // 如果结果为空对象，返回 undefined
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * 清理模型成本配置
 * Sanitize model cost config
 *
 * @param cost - 成本配置对象
 * @returns 清理后的成本配置或 undefined
 */
export function sanitizeCost(
  cost: Record<string, unknown> | undefined
): { input: number; output: number; cacheRead?: number; cacheWrite?: number } | undefined {
  if (!cost) return undefined;

  const input = toNumberOrUndefined(cost.input);
  const output = toNumberOrUndefined(cost.output);

  // 如果 input 和 output 都无效，返回 undefined
  if (input === undefined && output === undefined) return undefined;

  return {
    input: input ?? 0,
    output: output ?? 0,
    cacheRead: toNumberOrUndefined(cost.cacheRead),
    cacheWrite: toNumberOrUndefined(cost.cacheWrite),
  };
}

/**
 * 清理空对象 - 如果对象所有值都是空的，返回 undefined
 * Sanitize empty object - return undefined if all values are empty
 *
 * @param obj - 要检查的对象
 * @returns 原对象或 undefined
 */
export function sanitizeEmptyObject<T extends Record<string, unknown>>(
  obj: T
): T | undefined {
  const hasValue = Object.values(obj).some(
    (v) => v !== undefined && v !== null && v !== ""
  );
  return hasValue ? obj : undefined;
}

/**
 * 清理字符串数组 - 移除空字符串
 * Sanitize string array - remove empty strings
 *
 * @param arr - 字符串数组
 * @returns 清理后的数组或 undefined
 */
export function sanitizeStringArray(arr: unknown[] | undefined): string[] | undefined {
  if (!arr || !Array.isArray(arr)) return undefined;
  const filtered = arr.filter((v) => typeof v === "string" && v.trim() !== "") as string[];
  return filtered.length > 0 ? filtered : undefined;
}
