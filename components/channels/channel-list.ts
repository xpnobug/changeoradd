/**
 * 通道列表组件
 */
import { html } from "lit";
import type { ChannelsConfigData } from "../../types/channel-config";
import { CHANNEL_METADATA } from "./channel-metadata";
import { getChannelIcon, icons } from "./channel-icons";

export type ChannelListProps = {
  channelsConfig: ChannelsConfigData;
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
};

/**
 * 渲染通道列表
 */
export function renderChannelList(props: ChannelListProps) {
  return html`
    <div class="channel-list">
      ${CHANNEL_METADATA.map((channel) => {
        const config = props.channelsConfig[channel.id] as Record<string, unknown> | undefined;
        const enabled = config?.enabled !== false;
        const isSelected = props.selectedChannel === channel.id;

        return html`
          <button
            class="channel-list__item ${isSelected ? "channel-list__item--active" : ""} ${enabled ? "" : "channel-list__item--disabled"}"
            @click=${() => props.onChannelSelect(channel.id)}
          >
            <span class="channel-list__icon ${enabled ? "channel-list__icon--enabled" : ""}">${getChannelIcon(channel.icon)}</span>
            <span class="channel-list__content">
              <span class="channel-list__label">${channel.label}</span>
              <span class="channel-list__status">${enabled ? "已启用" : "已禁用"}</span>
            </span>
            <span class="channel-list__indicator">
              ${enabled ? icons.check : icons.x}
            </span>
          </button>
        `;
      })}
    </div>
  `;
}
