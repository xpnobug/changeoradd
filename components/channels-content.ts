/**
 * 通道配置内容组件
 * 右侧面板 - 消息通道详细配置
 */
import { html } from "lit";
import type { ChannelsConfigData } from "../types/channel-config";
import { icons, renderChannelList, renderChannelDetail } from "./channels";

// 重新导出元数据供外部使用
export { CHANNEL_METADATA } from "./channels";

export type ChannelsContentProps = {
  channelsConfig: ChannelsConfigData;
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
  onChannelConfigUpdate: (channelId: string, field: string, value: unknown) => void;
  onNavigateToChannels: () => void;
};

/**
 * 渲染通道配置内容
 */
export function renderChannelsContent(props: ChannelsContentProps) {
  return html`
    <div class="config-content config-content--channels">
      <div class="config-content__header">
        <div class="config-content__icon">${icons.channel}</div>
        <div class="config-content__titles">
          <h2 class="config-content__title">通道配置</h2>
          <p class="config-content__desc">配置消息通道（Telegram、Discord、WhatsApp 等）</p>
        </div>
        <button class="mc-btn" @click=${props.onNavigateToChannels}>
          ${icons.externalLink}
          <span>通道管理</span>
        </button>
      </div>

      <div class="channels-layout">
        <div class="channels-layout__sidebar">
          ${renderChannelList({
            channelsConfig: props.channelsConfig,
            selectedChannel: props.selectedChannel,
            onChannelSelect: props.onChannelSelect,
          })}
        </div>
        <div class="channels-layout__content">
          ${renderChannelDetail({
            channelsConfig: props.channelsConfig,
            selectedChannel: props.selectedChannel,
            onChannelConfigUpdate: props.onChannelConfigUpdate,
          })}
        </div>
      </div>
    </div>
  `;
}
