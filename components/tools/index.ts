/**
 * 工具权限共享组件
 * Shared tools permissions components
 *
 * 统一导出入口
 */

// 类型导出
export type {
  ToolProfileId,
  ToolPolicyConfig,
  ToolGroupDef,
  StandaloneToolDef,
  ToolProfileOption,
  ToolsListProps,
  ProfileSectionProps,
} from "./types";

// 常量导出
export {
  TOOL_DESCRIPTIONS,
  TOOL_GROUPS,
  STANDALONE_TOOLS,
  TOOL_PROFILES,
  getTotalToolsCount,
  isToolDenied,
  isGroupDenied,
} from "./constants";

// 组件导出
export { renderToolsList } from "./tools-list";
export { renderProfileSection } from "./profile-section";
