/**
 * 工具权限共享类型定义
 * Shared types for tools permissions
 */
import type { TemplateResult } from "lit";

/**
 * 工具配置档案 ID
 */
export type ToolProfileId = "minimal" | "coding" | "messaging" | "full";

/**
 * 工具策略配置
 */
export type ToolPolicyConfig = {
  profile?: ToolProfileId;
  allow?: string[];
  alsoAllow?: string[];
  deny?: string[];
};

/**
 * 工具分组定义
 */
export type ToolGroupDef = {
  label: string;
  desc: string;
  tools: string[];
};

/**
 * 独立工具定义
 */
export type StandaloneToolDef = {
  id: string;
  label: string;
};

/**
 * 工具档案选项
 */
export type ToolProfileOption = {
  value: ToolProfileId;
  label: string;
  description: string;
};

/**
 * 工具列表渲染 Props（通用）
 */
export type ToolsListProps = {
  /** 当前配置的 deny 列表 */
  denyList: string[];
  /** 是否正在保存 */
  saving: boolean;
  /** 是否展开 */
  expanded: boolean;
  /** 切换展开状态 */
  onToggleExpanded: () => void;
  /** 添加 deny 规则 */
  onAddDeny: (entry: string) => void;
  /** 移除 deny 规则 */
  onRemoveDeny: (entry: string) => void;
};

/**
 * 档案选择渲染 Props（通用）
 */
export type ProfileSectionProps = {
  /** 当前档案值 */
  profileValue: ToolProfileId | "__default__" | undefined;
  /** 是否为全局配置 */
  isGlobal: boolean;
  /** 全局档案值（用于显示继承信息） */
  globalProfile?: ToolProfileId;
  /** 是否正在保存 */
  saving: boolean;
  /** 档案变更回调 */
  onProfileChange: (value: ToolProfileId | undefined) => void;
};
