/**
 * 模型配置控制器 - 统一导出入口
 * Model config controller - Unified export entry
 *
 * 此文件作为模块的统一入口，重新导出所有拆分后的子模块
 * This file serves as the unified entry point, re-exporting all split submodules
 */

// ============================================
// 核心状态类型和初始化函数
// Core state types and initialization functions
// ============================================
export {
  // 类型导出
  type ModelConfigState,
  type SessionRow,
  type SessionsListResult,
  type ToolProfileId,
  type ToolPolicyConfig,
  type ToolsConfig,
  type AgentToolsConfig,
  type AgentWithTools,
  type PermissionsTabId,
  type AgentIdentityConfig,
  type AgentIdentityEntry,
  // 权限相关类型
  type ExecApprovalsSnapshot,
  type ExecApprovalsFile,
  type ExecApprovalsAllowlistEntry,
  type AgentOption,
  // 工作区文件类型
  type WorkspaceFileInfo,
  // 初始化函数
  createInitialModelConfigState,
  getDefaultCronState,
} from "./state";

// ============================================
// 配置加载和保存
// Config loading and saving
// ============================================
export {
  loadModelConfig,
  saveModelConfig,
  applyModelConfig,
  hasModelConfigChanges,
} from "./config-loader";

// ============================================
// 供应商管理
// Provider management
// ============================================
export {
  toggleProviderExpanded,
  addProvider,
  showAddProviderModal,
  updateAddProviderForm,
  confirmAddProvider,
  removeProvider,
  renameProvider,
  updateProviderField,
  addModel,
  removeModel,
  updateModelField,
  getAvailableModels,
} from "./providers";

// ============================================
// Agent 管理
// Agent management
// ============================================
export {
  updateAgentDefaults,
  updateGatewayConfig,
  updateAgentModel,
  updateAgentModelFallbacks,
  selectAgentForIdentity,
  updateAgentIdentity,
  setDefaultAgent,
  extractAgentsList,
  duplicateAgent,
  exportAgent,
  deleteAgent,
} from "./agents";

// ============================================
// 会话管理
// Session management
// ============================================
export { loadAgentSessions, patchSessionModel, createSession, deleteSession } from "./sessions";

// ============================================
// 工作区文件管理
// Workspace file management
// ============================================
export {
  loadWorkspaceFiles,
  selectWorkspaceFile,
  saveWorkspaceFile,
  createWorkspaceFile,
  updateWorkspaceEditorContent,
  setWorkspaceEditorMode,
  hasWorkspaceChanges,
  resetWorkspaceFile,
  switchWorkspaceAgent,
} from "./workspace";

// ============================================
// 权限管理
// Permissions management
// ============================================
export {
  type ExecApprovalsTarget,
  type ExecApprovalsTargetNode,
  resolveExecApprovalsNodes,
  getPermissionsAgents,
  loadPermissions,
  addPermissionsAgent,
  removePermissionsAgent,
  savePermissions,
  selectPermissionsAgent,
  setPermissionsActiveTab,
  updatePermissionsFormValue,
  removePermissionsFormValue,
  addPermissionsAllowlistEntry,
  removePermissionsAllowlistEntry,
} from "./permissions";

// ============================================
// 工具权限配置
// Tools permission config
// ============================================
export {
  hasToolsConfigChanges,
  getToolsAgents,
  selectToolsAgent,
  toggleToolsExpanded,
  updateGlobalToolsConfig,
  updateAgentToolsConfig,
  addGlobalToolsDenyEntry,
  removeGlobalToolsDenyEntry,
  addAgentToolsDenyEntry,
  removeAgentToolsDenyEntry,
  extractToolsConfig,
  extractAgentToolsConfigs,
} from "./tools-config";

// ============================================
// 定时任务管理
// Cron job management
// ============================================
export {
  loadCronData,
  addCronJob,
  toggleCronJob,
  runCronJob,
  removeCronJob,
  loadCronRuns,
  updateCronForm,
  expandCronJob,
  setCronDeleteConfirm,
  updateCronChannels,
} from "./cron";
