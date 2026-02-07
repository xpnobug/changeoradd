/**
 * 通道配置详情组件
 */
import { html, nothing } from "lit";
import type { ChannelConfigField, ChannelsConfigData } from "../../types/channel-config";
import { CONFIG_SECTIONS } from "../../types/channel-fields";
import { CHANNEL_METADATA } from "./channel-metadata";
import { getChannelIcon, icons } from "./channel-icons";
import { renderConfigField, resolveNestedValue } from "./channel-field-renderer";

export type ChannelDetailProps = {
  channelsConfig: ChannelsConfigData;
  selectedChannel: string | null;
  onChannelConfigUpdate: (channelId: string, field: string, value: unknown) => void;
};

/**
 * 渲染通道配置详情
 */
export function renderChannelDetail(props: ChannelDetailProps) {
  if (!props.selectedChannel) {
    return html`
      <div class="channel-detail__empty">
        <div class="channel-detail__empty-icon">${icons.channel}</div>
        <div class="channel-detail__empty-text">选择一个通道查看配置</div>
      </div>
    `;
  }

  const channel = CHANNEL_METADATA.find((c) => c.id === props.selectedChannel);
  if (!channel) return nothing;

  const config = (props.channelsConfig[channel.id] ?? {}) as Record<string, unknown>;

  // 按 section 分组字段
  const fieldsBySection = new Map<string, ChannelConfigField[]>();
  for (const field of channel.configFields) {
    const section = field.section ?? "basic";
    if (!fieldsBySection.has(section)) {
      fieldsBySection.set(section, []);
    }
    fieldsBySection.get(section)!.push(field);
  }

  return html`
    <div class="channel-detail">
      <div class="channel-detail__header">
        <div class="channel-detail__icon">${getChannelIcon(channel.icon)}</div>
        <div class="channel-detail__titles">
          <h3 class="channel-detail__title">${channel.label}</h3>
          <p class="channel-detail__desc">${channel.description}</p>
        </div>
        ${channel.docsUrl
          ? html`
              <a
                class="channel-detail__docs"
                href=${channel.docsUrl}
                target="_blank"
                rel="noreferrer"
                title="查看文档"
              >
                ${icons.externalLink}
              </a>
            `
          : nothing}
      </div>

      <div class="channel-detail__body">
        ${CONFIG_SECTIONS.filter((section: { id: string; label: string }) =>
          fieldsBySection.has(section.id),
        ).map(
          (section: { id: string; label: string }) => html`
            <div class="channel-detail__section">
              <h4 class="channel-detail__section-title">${section.label}</h4>
              <div class="channel-detail__fields">
                ${fieldsBySection
                  .get(section.id)!
                  .map((field) =>
                    renderConfigField(
                      channel,
                      field,
                      resolveNestedValue(config, field.key),
                      props.onChannelConfigUpdate,
                    ),
                  )}
              </div>
            </div>
          `,
        )}
      </div>
    </div>
  `;
}
