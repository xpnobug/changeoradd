/**
 * 工具档案选择组件
 * Tools profile selection component
 */
import { html } from "lit";
import type { ProfileSectionProps, ToolProfileId } from "./types";
import { TOOL_PROFILES } from "./constants";

/**
 * 渲染档案选择区块
 */
export function renderProfileSection(props: ProfileSectionProps) {
  const { profileValue, isGlobal, globalProfile, saving, onProfileChange } = props;

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    if (isGlobal) {
      // 全局配置：空值表示未设置
      onProfileChange(value ? (value as ToolProfileId) : undefined);
    } else if (value === "__default__") {
      // Agent 配置：__default__ 表示使用全局设置
      onProfileChange(undefined);
    } else {
      onProfileChange(value ? (value as ToolProfileId) : undefined);
    }
  };

  return html`
    <div class="permissions-section">
      <div class="permissions-section__header">
        <div>
          <h4 class="permissions-section__title">配置档案</h4>
          <p class="permissions-section__desc">
            ${isGlobal
              ? "选择预设的工具配置档案，或留空使用默认配置。"
              : globalProfile
                ? `全局档案: ${globalProfile}`
                : "全局未设置档案，使用系统默认"}
          </p>
        </div>
      </div>
      <div class="permissions-policy-grid">
        <div class="permissions-policy-item">
          <div class="permissions-policy-item__header">
            <span class="permissions-policy-item__title">工具档案</span>
            <span class="permissions-policy-item__desc">
              选择预设的工具权限集合
            </span>
          </div>
          <select class="permissions-select" ?disabled=${saving} @change=${handleChange}>
            ${isGlobal
              ? html`<option value="" ?selected=${!profileValue}>
                  未设置（使用系统默认）
                </option>`
              : html`<option value="__default__" ?selected=${profileValue === "__default__" || !profileValue}>
                  使用全局设置${globalProfile ? ` (${globalProfile})` : ""}
                </option>`}
            ${TOOL_PROFILES.map(
              (profile) =>
                html`<option value=${profile.value} ?selected=${profileValue === profile.value}>
                  ${profile.label} - ${profile.description}
                </option>`,
            )}
          </select>
        </div>
      </div>
    </div>
  `;
}
