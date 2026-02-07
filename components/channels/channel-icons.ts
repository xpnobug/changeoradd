/**
 * 通道图标工具
 */
import {
  channelIcons,
  messageIcon,
  settingsIcon,
  checkIcon,
  xIcon,
  externalLinkIcon,
} from "../icons";

// 图标映射
export const icons = {
  channel: messageIcon,
  ...channelIcons,
  settings: settingsIcon,
  check: checkIcon,
  x: xIcon,
  externalLink: externalLinkIcon,
};

/**
 * 获取通道图标
 */
export function getChannelIcon(iconName: string) {
  return icons[iconName as keyof typeof icons] ?? icons.channel;
}
