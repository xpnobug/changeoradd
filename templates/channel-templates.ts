/**
 * 通道预设模板
 */
import type { ChannelTemplate } from "./types.js";

/** 通道模板列表 */
export const CHANNEL_TEMPLATES: ChannelTemplate[] = [
  {
    id: "telegram-personal",
    channelType: "telegram",
    name: "Telegram 个人助手",
    description: "私聊模式，仅自己可用",
    useCase: "个人使用",
    config: {
      rateLimit: { messagesPerMinute: 30 },
    },
  },
  {
    id: "telegram-group",
    channelType: "telegram",
    name: "Telegram 群组机器人",
    description: "群聊模式，@提及触发",
    useCase: "团队协作",
    config: {
      groupMode: true,
      triggerOnMention: true,
      rateLimit: { messagesPerMinute: 10 },
    },
  },
  {
    id: "discord-server",
    channelType: "discord",
    name: "Discord 服务器机器人",
    description: "多频道支持，斜杠命令",
    useCase: "社区服务",
    config: {
      slashCommands: true,
    },
  },
  {
    id: "discord-dm",
    channelType: "discord",
    name: "Discord 私聊机器人",
    description: "私信模式，一对一对话",
    useCase: "个人使用",
    config: {
      dmOnly: true,
    },
  },
  {
    id: "wechat-service",
    channelType: "wechat",
    name: "微信客服",
    description: "微信公众号/企业微信",
    useCase: "客户服务",
    config: {
      autoReply: true,
      welcomeMessage: "您好，有什么可以帮您？",
    },
  },
  {
    id: "slack-workspace",
    channelType: "slack",
    name: "Slack 工作区机器人",
    description: "频道和私信支持",
    useCase: "团队协作",
    config: {
      respondInThread: true,
    },
  },
  {
    id: "signal-private",
    channelType: "signal",
    name: "Signal 私密助手",
    description: "端到端加密通信",
    useCase: "隐私优先",
    config: {
      disappearingMessages: false,
    },
  },
];

/** 根据通道类型获取模板 */
export function getChannelTemplates(channelType: string): ChannelTemplate[] {
  return CHANNEL_TEMPLATES.filter(t => t.channelType === channelType);
}

/** 根据 ID 获取模板 */
export function getChannelTemplateById(id: string): ChannelTemplate | undefined {
  return CHANNEL_TEMPLATES.find(t => t.id === id);
}

/** 获取所有支持的通道类型 */
export function getSupportedChannelTypes(): string[] {
  return [...new Set(CHANNEL_TEMPLATES.map(t => t.channelType))];
}
