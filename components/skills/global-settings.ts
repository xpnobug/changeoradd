/**
 * 技能全局设置组件
 * Skills global settings component
 */
import { html } from "lit";
import type { SkillsContentProps } from "../../types/skills-config";

/**
 * 渲染全局设置
 */
export function renderGlobalSettings(props: SkillsContentProps) {
  const extraDirs = props.config?.load?.extraDirs ?? [];
  const extraDirsText = extraDirs.join("\n");

  return html`
    <div class="skills-section skills-global-settings">
      <div class="skills-section__header">
        <h4 class="skills-section__title">全局设置</h4>
      </div>
      <div class="skills-settings-content">
        <!-- 紧凑网格布局：左侧四个设置项，右侧额外目录 -->
        <div class="skills-settings-grid-compact">
          <!-- 左侧：四个设置项 2x2 网格 -->
          <div class="skills-settings-left">
            <!-- 内置技能模式 -->
            <div class="skills-setting-item-compact">
              <span class="skills-setting-item-compact__label">内置技能模式</span>
              <div class="skills-radio-group-compact">
                <label class="skills-radio-compact">
                  <input
                    type="radio"
                    name="allowlist-mode"
                    value="all"
                    .checked=${props.allowlistMode === "all"}
                    @change=${() => props.onAllowlistModeChange("all")}
                  />
                  <span class="skills-radio-compact__text">全部</span>
                </label>
                <label class="skills-radio-compact">
                  <input
                    type="radio"
                    name="allowlist-mode"
                    value="whitelist"
                    .checked=${props.allowlistMode === "whitelist"}
                    @change=${() => props.onAllowlistModeChange("whitelist")}
                  />
                  <span class="skills-radio-compact__text">白名单</span>
                </label>
              </div>
            </div>

            <!-- 安装偏好 -->
            <div class="skills-setting-item-compact">
              <span class="skills-setting-item-compact__label">安装偏好</span>
              <select
                class="skills-select-compact"
                .value=${props.config?.install?.preferBrew ? "true" : "false"}
                @change=${(e: Event) => {
                  const value = (e.target as HTMLSelectElement).value === "true";
                  props.onGlobalSettingChange("preferBrew", value);
                }}
              >
                <option value="true">Homebrew</option>
                <option value="false">默认</option>
              </select>
            </div>

            <!-- Node 包管理器 -->
            <div class="skills-setting-item-compact">
              <span class="skills-setting-item-compact__label">Node 包管理器</span>
              <select
                class="skills-select-compact"
                .value=${props.config?.install?.nodeManager ?? "npm"}
                @change=${(e: Event) => {
                  const value = (e.target as HTMLSelectElement).value;
                  props.onGlobalSettingChange("nodeManager", value);
                }}
              >
                <option value="npm">npm</option>
                <option value="pnpm">pnpm</option>
                <option value="yarn">yarn</option>
                <option value="bun">bun</option>
              </select>
            </div>

            <!-- 文件监视 -->
            <div class="skills-setting-item-compact">
              <span class="skills-setting-item-compact__label">文件监视</span>
              <label class="skills-checkbox-compact">
                <input
                  type="checkbox"
                  .checked=${props.config?.load?.watch ?? false}
                  @change=${(e: Event) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    props.onGlobalSettingChange("watch", checked);
                  }}
                />
                <span class="skills-checkbox-compact__text">启用</span>
              </label>
            </div>
          </div>

          <!-- 右侧：额外技能目录 -->
          <div class="skills-settings-right">
            <div class="skills-extra-dirs-compact">
              <span class="skills-extra-dirs-compact__label">额外技能目录</span>
              <textarea
                class="skills-extra-dirs-compact__textarea"
                placeholder="/path/to/skills"
                rows="2"
                .value=${extraDirsText}
                @change=${(e: Event) => {
                  const text = (e.target as HTMLTextAreaElement).value;
                  const dirs = text
                    .split("\n")
                    .map((d) => d.trim())
                    .filter((d) => d.length > 0);
                  props.onExtraDirsChange(dirs);
                }}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
