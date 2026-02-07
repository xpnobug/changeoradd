/**
 * 权限管理内容组件
 * 管理命令执行权限和访问控制
 *
 * ⚠️ 此文件已重构，实际实现已拆分到 ./permissions/ 目录
 * 保留此文件以保持向后兼容
 */

// 从新模块重新导出所有内容
export {
  // 主组件
  renderPermissionsContent,
  // 子组件
  renderExecPermissionsContent,
  renderExecTargetSection,
  renderToolsPermissionsSection,
  // 类型
  type PermissionsContentProps,
  type ExecSecurity,
  type ExecAsk,
  type ExecApprovalsDefaults,
  type ExecApprovalsAllowlistEntry,
  type ExecApprovalsAgent,
  type ExecApprovalsFile,
  type ExecApprovalsSnapshot,
  type AgentOption,
  // 常量
  EXEC_APPROVALS_DEFAULT_SCOPE,
  TOOLS_DEFAULT_SCOPE,
  SECURITY_OPTIONS,
  ASK_OPTIONS,
  TOOL_DESCRIPTIONS,
  TOOL_GROUPS,
  STANDALONE_TOOLS,
  TOOL_PROFILES,
  // 工具函数
  normalizeSecurity,
  normalizeAsk,
  resolveDefaults,
  formatAgo,
} from "./permissions";
