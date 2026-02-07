/**
 * 权限管理辅助函数
 * Permissions management utility functions
 */
import type { ExecSecurity, ExecAsk, ExecApprovalsFile } from "./types";

/**
 * 规范化安全模式值
 */
export function normalizeSecurity(value?: string): ExecSecurity {
  if (value === "allowlist" || value === "full" || value === "deny") return value;
  return "deny";
}

/**
 * 规范化确认模式值
 */
export function normalizeAsk(value?: string): ExecAsk {
  if (value === "always" || value === "off" || value === "on-miss") return value;
  return "on-miss";
}

/**
 * 解析默认配置
 */
export function resolveDefaults(form: ExecApprovalsFile | null): {
  security: ExecSecurity;
  ask: ExecAsk;
  askFallback: ExecSecurity;
  autoAllowSkills: boolean;
} {
  const defaults = form?.defaults ?? {};
  return {
    security: normalizeSecurity(defaults.security),
    ask: normalizeAsk(defaults.ask),
    askFallback: normalizeSecurity(defaults.askFallback ?? "deny"),
    autoAllowSkills: Boolean(defaults.autoAllowSkills ?? false),
  };
}

/**
 * 格式化时间为相对时间
 */
export function formatAgo(ts: number | null | undefined): string {
  if (!ts) return "从未";
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  return `${Math.floor(diff / 86400000)} 天前`;
}
