/**
 * 通道配置类型定义
 */

// DM 访问策略
export type DmPolicy = "pairing" | "allowlist" | "open" | "disabled";

// 群组访问策略
export type GroupPolicy = "open" | "disabled" | "allowlist";

// 通道基础配置
export type BaseChannelConfig = {
  enabled?: boolean;
  name?: string;
  dmPolicy?: DmPolicy;
  allowFrom?: Array<string | number>;
  groupPolicy?: GroupPolicy;
  groupAllowFrom?: Array<string | number>;
  textChunkLimit?: number;
  historyLimit?: number;
  dmHistoryLimit?: number;
  mediaMaxMb?: number;
};

// Telegram 配置
export type TelegramChannelConfig = BaseChannelConfig & {
  botToken?: string;
  tokenFile?: string;
  streamMode?: "off" | "partial" | "block";
  chunkMode?: "length" | "newline";
  reactionNotifications?: "off" | "own" | "all" | "allowlist";
};

// Discord 配置
export type DiscordChannelConfig = BaseChannelConfig & {
  token?: string;
  intents?: {
    presence?: boolean;
    guildMembers?: boolean;
  };
  reactionNotifications?: "off" | "own" | "all" | "allowlist";
};

// Slack 配置
export type SlackChannelConfig = BaseChannelConfig & {
  mode?: "socket" | "http";
  botToken?: string;
  appToken?: string;
  userToken?: string;
  requireMention?: boolean;
  slashCommand?: string;
};

// WhatsApp 配置
export type WhatsAppChannelConfig = BaseChannelConfig & {
  authDir?: string;
  sendReadReceipts?: boolean;
  selfChatMode?: "off" | "forward" | "local";
  debounceMs?: number;
  ackReaction?: string;
};

// Signal 配置
export type SignalChannelConfig = BaseChannelConfig & {
  account?: string;
  httpUrl?: string;
  httpHost?: string;
  httpPort?: number;
  cliPath?: string;
  autoStart?: boolean;
  sendReadReceipts?: boolean;
};

// Google Chat 配置
export type GoogleChatChannelConfig = BaseChannelConfig & {
  serviceAccount?: string | object;
  serviceAccountFile?: string;
  webhookPath?: string;
  webhookUrl?: string;
  typingIndicator?: "none" | "message" | "reaction";
};

// iMessage 配置
export type IMessageChannelConfig = BaseChannelConfig & {
  cliPath?: string;
  dbPath?: string;
  remoteHost?: string;
  service?: "imessage" | "sms" | "auto";
  region?: string;
  includeAttachments?: boolean;
};

// MS Teams 配置
export type MSTeamsChannelConfig = BaseChannelConfig & {
  appId?: string;
  appPassword?: string;
  tenantId?: string;
  webhook?: {
    port?: number;
    path?: string;
  };
  replyStyle?: "thread" | "top-level";
};

// WeChat 配置
export type WeChatPollingConfig = {
  pollingIntervalMs?: number;
  pollContactIds?: string[];
  pollAllContacts?: boolean;
  maxPollContacts?: number;
};

export type WeChatChannelConfig = BaseChannelConfig & {
  name?: string;
  baseUrl?: string;
  apiToken?: string;
  tokenFile?: string;
  robotId?: number;
  defaultAccount?: string;
  requireMention?: boolean;
  commandAllowFrom?: string[];  // 指令/工具调用白名单
  safetyPrefix?: string;        // 访客安全前缀
  polling?: WeChatPollingConfig;
  accounts?: Record<string, WeChatChannelConfig>;
};

// Matrix 配置
export type MatrixChannelConfig = BaseChannelConfig & {
  homeserver?: string;
  userId?: string;
  accessToken?: string;
  password?: string;
  encryption?: boolean;
  autoJoin?: "always" | "allowlist" | "off";
};

// Mattermost 配置
export type MattermostChannelConfig = BaseChannelConfig & {
  baseUrl?: string;
  botToken?: string;
  requireMention?: boolean;
};

// Nostr 配置
export type NostrChannelConfig = BaseChannelConfig & {
  privateKey?: string;
};

// LINE 配置
export type LineChannelConfig = BaseChannelConfig & {
  channelAccessToken?: string;
  channelSecret?: string;
};

// Twitch 配置
export type TwitchChannelConfig = BaseChannelConfig & {
  username?: string;
  accessToken?: string;
  clientId?: string;
  channel?: string;
  requireMention?: boolean;
};

// BlueBubbles 配置
export type BlueBubblesChannelConfig = BaseChannelConfig & {
  serverUrl?: string;
  password?: string;
  webhookPath?: string;
  sendReadReceipts?: boolean;
};

// Zalo 配置
export type ZaloChannelConfig = BaseChannelConfig & {
  botToken?: string;
  tokenFile?: string;
  webhookUrl?: string;
  webhookSecret?: string;
};

// Nextcloud Talk 配置
export type NextcloudTalkChannelConfig = BaseChannelConfig & {
  baseUrl?: string;
  botSecret?: string;
  apiUser?: string;
  apiPassword?: string;
};

// Tlon (Urbit) 配置
export type TlonChannelConfig = BaseChannelConfig & {
  ship?: string;
  url?: string;
  code?: string;
  autoDiscoverChannels?: boolean;
};

// 通道元数据
export type ChannelMeta = {
  id: string;
  label: string;
  icon: string;
  description: string;
  docsUrl?: string;
  configFields: ChannelConfigField[];
};

// 配置字段定义
export type ChannelConfigField = {
  key: string;
  label: string;
  type: "text" | "password" | "number" | "select" | "toggle" | "array" | "textarea";
  placeholder?: string;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  section?: string;
};

// 所有通道配置
export type ChannelsConfigData = {
  defaults?: {
    groupPolicy?: GroupPolicy;
  };
  // 内置通道
  telegram?: TelegramChannelConfig;
  discord?: DiscordChannelConfig;
  slack?: SlackChannelConfig;
  whatsapp?: WhatsAppChannelConfig;
  signal?: SignalChannelConfig;
  googlechat?: GoogleChatChannelConfig;
  imessage?: IMessageChannelConfig;
  msteams?: MSTeamsChannelConfig;
  // 扩展通道
  wechat?: WeChatChannelConfig;
  matrix?: MatrixChannelConfig;
  mattermost?: MattermostChannelConfig;
  nostr?: NostrChannelConfig;
  line?: LineChannelConfig;
  twitch?: TwitchChannelConfig;
  bluebubbles?: BlueBubblesChannelConfig;
  zalo?: ZaloChannelConfig;
  "nextcloud-talk"?: NextcloudTalkChannelConfig;
  tlon?: TlonChannelConfig;
  [key: string]: unknown;
};
