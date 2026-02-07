/**
 * 通道字段配置
 * Channel field configurations
 *
 * 提取公共字段定义，减少 CHANNEL_METADATA 中的重复配置
 * Extract common field definitions to reduce duplication in CHANNEL_METADATA
 */
import type { ChannelConfigField } from "./channel-config";

// ============================================
// 策略选项定义
// Policy option definitions
// ============================================

/**
 * DM 策略选项
 */
export const DM_POLICY_OPTIONS = [
  { value: "pairing", label: "配对模式" },
  { value: "allowlist", label: "白名单" },
  { value: "open", label: "开放" },
  { value: "disabled", label: "禁用" },
] as const;

/**
 * 群组策略选项
 */
export const GROUP_POLICY_OPTIONS = [
  { value: "open", label: "开放" },
  { value: "allowlist", label: "白名单" },
  { value: "disabled", label: "禁用" },
] as const;

/**
 * 流式模式选项
 */
export const STREAM_MODE_OPTIONS = [
  { value: "off", label: "关闭" },
  { value: "partial", label: "部分" },
  { value: "block", label: "块" },
] as const;

/**
 * 表情回应级别选项
 */
export const REACTION_LEVEL_OPTIONS = [
  { value: "off", label: "关闭" },
  { value: "ack", label: "确认" },
  { value: "minimal", label: "最小" },
  { value: "extensive", label: "详细" },
] as const;

/**
 * 自动加入选项
 */
export const AUTO_JOIN_OPTIONS = [
  { value: "always", label: "总是" },
  { value: "allowlist", label: "白名单" },
  { value: "off", label: "关闭" },
] as const;

/**
 * 输入指示器选项
 */
export const TYPING_INDICATOR_OPTIONS = [
  { value: "none", label: "无" },
  { value: "message", label: "消息" },
  { value: "reaction", label: "表情" },
] as const;

/**
 * 回复样式选项
 */
export const REPLY_STYLE_OPTIONS = [
  { value: "thread", label: "线程回复" },
  { value: "top-level", label: "顶层回复" },
] as const;

/**
 * 自聊模式选项
 */
export const SELF_CHAT_MODE_OPTIONS = [
  { value: "off", label: "关闭" },
  { value: "forward", label: "转发" },
  { value: "local", label: "本地" },
] as const;

/**
 * iMessage 服务类型选项
 */
export const IMESSAGE_SERVICE_OPTIONS = [
  { value: "imessage", label: "iMessage" },
  { value: "sms", label: "SMS" },
  { value: "auto", label: "自动" },
] as const;

/**
 * Slack 连接模式选项
 */
export const SLACK_MODE_OPTIONS = [
  { value: "socket", label: "Socket Mode" },
  { value: "http", label: "HTTP Mode" },
] as const;

/**
 * 飞书域名选项
 */
export const FEISHU_DOMAIN_OPTIONS = [
  { value: "feishu", label: "飞书 (feishu.cn)" },
  { value: "lark", label: "Lark (larksuite.com)" },
] as const;

/**
 * 飞书连接模式选项
 */
export const FEISHU_CONNECTION_MODE_OPTIONS = [
  { value: "websocket", label: "WebSocket (推荐)" },
  { value: "webhook", label: "Webhook" },
] as const;

/**
 * 飞书渲染模式选项
 */
export const FEISHU_RENDER_MODE_OPTIONS = [
  { value: "auto", label: "自动检测" },
  { value: "raw", label: "纯文本" },
  { value: "card", label: "卡片消息" },
] as const;

/**
 * 飞书分块模式选项
 */
export const FEISHU_CHUNK_MODE_OPTIONS = [
  { value: "length", label: "按长度" },
  { value: "newline", label: "按换行" },
] as const;

/**
 * 飞书 Markdown 模式选项
 */
export const FEISHU_MARKDOWN_MODE_OPTIONS = [
  { value: "native", label: "原生" },
  { value: "escape", label: "转义" },
  { value: "strip", label: "去除" },
] as const;

/**
 * 飞书表格模式选项
 */
export const FEISHU_TABLE_MODE_OPTIONS = [
  { value: "native", label: "原生" },
  { value: "ascii", label: "ASCII" },
  { value: "simple", label: "简单" },
] as const;

/**
 * 飞书心跳可见性选项
 */
export const FEISHU_HEARTBEAT_VISIBILITY_OPTIONS = [
  { value: "visible", label: "可见" },
  { value: "hidden", label: "隐藏" },
] as const;

// ============================================
// 公共字段定义
// Common field definitions
// ============================================

/**
 * 启用字段
 */
export const FIELD_ENABLED: ChannelConfigField = {
  key: "enabled",
  label: "启用",
  type: "toggle",
  section: "basic",
};

/**
 * DM 策略字段
 */
export const FIELD_DM_POLICY: ChannelConfigField = {
  key: "dmPolicy",
  label: "DM 策略",
  type: "select",
  options: [...DM_POLICY_OPTIONS],
  section: "access",
};

/**
 * 群组策略字段
 */
export const FIELD_GROUP_POLICY: ChannelConfigField = {
  key: "groupPolicy",
  label: "群组策略",
  type: "select",
  options: [...GROUP_POLICY_OPTIONS],
  section: "access",
};

/**
 * DM 白名单字段
 */
export const FIELD_ALLOW_FROM: ChannelConfigField = {
  key: "allowFrom",
  label: "DM 白名单",
  type: "array",
  section: "access",
};

/**
 * 群组白名单字段
 */
export const FIELD_GROUP_ALLOW_FROM: ChannelConfigField = {
  key: "groupAllowFrom",
  label: "群组白名单",
  type: "array",
  section: "access",
};

/**
 * 需要 @提及字段
 */
export const FIELD_REQUIRE_MENTION: ChannelConfigField = {
  key: "requireMention",
  label: "需要 @提及",
  type: "toggle",
  section: "access",
};

/**
 * 允许机器人消息字段
 */
export const FIELD_ALLOW_BOTS: ChannelConfigField = {
  key: "allowBots",
  label: "允许机器人消息",
  type: "toggle",
  section: "access",
};

/**
 * 文本块限制字段
 */
export const FIELD_TEXT_CHUNK_LIMIT: ChannelConfigField = {
  key: "textChunkLimit",
  label: "文本块限制",
  type: "number",
  placeholder: "4000",
  section: "messaging",
};

/**
 * 最大媒体大小字段
 */
export const FIELD_MEDIA_MAX_MB: ChannelConfigField = {
  key: "mediaMaxMb",
  label: "最大媒体大小 (MB)",
  type: "number",
  placeholder: "25",
  section: "messaging",
};

/**
 * 群组历史记录限制字段
 */
export const FIELD_HISTORY_LIMIT: ChannelConfigField = {
  key: "historyLimit",
  label: "群组历史记录限制",
  type: "number",
  placeholder: "50",
  section: "history",
};

/**
 * DM 历史记录限制字段
 */
export const FIELD_DM_HISTORY_LIMIT: ChannelConfigField = {
  key: "dmHistoryLimit",
  label: "DM 历史记录限制",
  type: "number",
  placeholder: "50",
  section: "history",
};

/**
 * 发送已读回执字段
 */
export const FIELD_SEND_READ_RECEIPTS: ChannelConfigField = {
  key: "sendReadReceipts",
  label: "发送已读回执",
  type: "toggle",
  section: "messaging",
};

// ============================================
// 字段组合
// Field combinations
// ============================================

/**
 * 基本访问控制字段组
 */
export const COMMON_ACCESS_FIELDS: ChannelConfigField[] = [
  FIELD_DM_POLICY,
  FIELD_GROUP_POLICY,
];

/**
 * 完整访问控制字段组（含白名单）
 */
export const FULL_ACCESS_FIELDS: ChannelConfigField[] = [
  FIELD_DM_POLICY,
  FIELD_ALLOW_FROM,
  FIELD_GROUP_POLICY,
  FIELD_GROUP_ALLOW_FROM,
];

/**
 * 历史记录字段组
 */
export const HISTORY_FIELDS: ChannelConfigField[] = [
  FIELD_HISTORY_LIMIT,
  FIELD_DM_HISTORY_LIMIT,
];

/**
 * 基本消息设置字段组
 */
export const BASIC_MESSAGING_FIELDS: ChannelConfigField[] = [
  FIELD_TEXT_CHUNK_LIMIT,
  FIELD_MEDIA_MAX_MB,
];

// ============================================
// 配置区块定义
// Config section definitions
// ============================================

/**
 * 配置区块元数据
 */
export const CONFIG_SECTIONS = [
  { id: "basic", label: "基本设置" },
  { id: "auth", label: "认证配置" },
  { id: "api", label: "API 配置" },
  { id: "webhook", label: "Webhook 配置" },
  { id: "daemon", label: "守护进程" },
  { id: "cli", label: "CLI 配置" },
  { id: "polling", label: "轮询配置" },
  { id: "access", label: "访问控制" },
  { id: "messaging", label: "消息设置" },
  { id: "streaming", label: "流式消息" },
  { id: "history", label: "历史记录" },
  { id: "tools", label: "工具配置" },
  { id: "advanced", label: "高级设置" },
] as const;

export type ConfigSectionId = (typeof CONFIG_SECTIONS)[number]["id"];

// ============================================
// 工具函数
// Utility functions
// ============================================

/**
 * 创建带自定义标签的字段副本
 */
export function withLabel(field: ChannelConfigField, label: string): ChannelConfigField {
  return { ...field, label };
}

/**
 * 创建带自定义占位符的字段副本
 */
export function withPlaceholder(field: ChannelConfigField, placeholder: string): ChannelConfigField {
  return { ...field, placeholder };
}

/**
 * 创建带自定义描述的字段副本
 */
export function withDescription(field: ChannelConfigField, description: string): ChannelConfigField {
  return { ...field, description };
}

/**
 * 创建必填字段副本
 */
export function asRequired(field: ChannelConfigField): ChannelConfigField {
  return { ...field, required: true };
}

/**
 * 创建带自定义 section 的字段副本
 */
export function inSection(field: ChannelConfigField, section: string): ChannelConfigField {
  return { ...field, section };
}

/**
 * 批量设置字段的 section
 */
export function fieldsInSection(fields: ChannelConfigField[], section: string): ChannelConfigField[] {
  return fields.map((f) => inSection(f, section));
}
