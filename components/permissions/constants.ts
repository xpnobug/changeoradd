/**
 * 权限管理常量定义
 * Permissions management constants
 *
 * 工具相关常量从 ../tools/constants.ts 重新导出
 */
import type { ExecSecurity, ExecAsk } from "./types";

// ─── 作用域常量 ─────────────────────────────────────────────────────────────

export const EXEC_APPROVALS_DEFAULT_SCOPE = "__defaults__";
export const TOOLS_DEFAULT_SCOPE = "__global__";

// ─── 安全选项 ───────────────────────────────────────────────────────────────

export const SECURITY_OPTIONS: Array<{ value: ExecSecurity; label: string; description: string }> = [
  { value: "deny", label: "拒绝", description: "拒绝所有命令执行" },
  { value: "allowlist", label: "允许列表", description: "仅允许白名单中的命令" },
  { value: "full", label: "完全允许", description: "允许所有命令执行" },
];

export const ASK_OPTIONS: Array<{ value: ExecAsk; label: string; description: string }> = [
  { value: "off", label: "关闭", description: "不提示用户确认" },
  { value: "on-miss", label: "未匹配时", description: "命令不在白名单时提示" },
  { value: "always", label: "总是", description: "每次执行都提示确认" },
];

// ─── 工具相关常量（从共享模块重新导出）─────────────────────────────────────

export {
  TOOL_DESCRIPTIONS,
  TOOL_GROUPS,
  STANDALONE_TOOLS,
  TOOL_PROFILES,
  getTotalToolsCount,
  isToolDenied,
  isGroupDenied,
} from "../tools/constants.js";
