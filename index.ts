/**
 * ui-zh-CN 模块统一导出入口
 * Unified export entry for ui-zh-CN module
 *
 * 外部文件应该从此文件导入，而不是直接导入内部模块
 * External files should import from this file instead of internal modules
 *
 * 使用方式 / Usage:
 *   import { OpenClawConfigElement } from "../ui-zh-CN";
 *   import type { ProviderConfig, ... } from "../ui-zh-CN";
 *   import { loadModelConfig, ... } from "../ui-zh-CN";
 */

// ============================================
// Web Component 主入口 / Main Web Component Entry
// ============================================

// 导入 Web Component（副作用导入，注册自定义元素）
import "./openclaw-config-element";

// 导出 Web Component 类（可选，用于类型检查）
export { OpenClawConfigElement } from "./openclaw-config-element";

// ============================================
// 类型导出 / Type Exports
// ============================================

// 从 controllers/model-config 导出类型
export type {
  ProviderConfig,
  AgentDefaults,
  GatewayConfig,
  PermissionsTabId,
  ToolsConfig,
  AgentWithTools,
  SessionsListResult as AgentSessionsListResult,
  AgentIdentityEntry,
  WorkspaceFileInfo,
} from "./controllers/model-config";

// 从 components/providers-content 导出类型
export type { ProviderFormState } from "./components/providers-content";

// 从 types/skills-config 导出类型
export type {
  SkillsConfig,
  SkillSourceFilter,
  SkillStatusFilter,
  SkillMessage as SkillConfigMessage,
  SkillEditState,
  SkillEditorState,
  SkillCreateState,
  SkillDeleteState,
} from "./types/skills-config";

// ============================================
// 函数导出 / Function Exports
// ============================================

// 从 controllers/model-config 导出函数
export {
  loadModelConfig,
  loadAgentSessions,
} from "./controllers/model-config";
