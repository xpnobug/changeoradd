/**
 * 模板类型定义
 */

/** Agent 模板 */
export type AgentTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "assistant" | "coding" | "writing" | "analysis" | "custom";
  config: Record<string, unknown>;
  tags?: string[];
  popularity?: number;
};

/** 通道模板 */
export type ChannelTemplate = {
  id: string;
  channelType: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
  useCase: string;
};

/** 模板分类 */
export type TemplateCategory = {
  id: string;
  label: string;
  icon: string;
};
