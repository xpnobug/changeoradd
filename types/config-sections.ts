/**
 * 配置区块类型定义
 * Config section type definitions
 */

export type ConfigSection = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

/**
 * 配置区块 ID
 * workspace - 工作区文件管理（SOUL.md, IDENTITY.md 等）
 * skills - 技能配置管理
 */
export type ConfigSectionId = "providers" | "agent" | "gateway" | "channels" | "permissions" | "workspace" | "skills";
