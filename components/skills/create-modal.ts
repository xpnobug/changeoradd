/**
 * 创建技能弹窗组件
 * Create skill modal component
 */
import { html, nothing } from "lit";
import type { SkillsContentProps } from "../../types/skills-config";

/**
 * 渲染创建技能弹窗
 * Render create skill modal
 */
export function renderCreateModal(props: SkillsContentProps) {
  const { createState } = props;

  return html`
    <div class="skills-modal-overlay" @click=${props.onCreateClose}>
      <div class="skills-modal skills-create-modal" @click=${(e: Event) => e.stopPropagation()}>
        <!-- 弹窗头部 -->
        <div class="skills-modal__header">
          <div class="skills-modal__title">
            <span class="skills-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </span>
            新建技能
          </div>
          <button class="skills-modal__close" @click=${props.onCreateClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="skills-modal__body">
          ${createState.error ? html`<div class="skills-create__error">${createState.error}</div>` : nothing}

          <div class="skills-create__field">
            <label class="skills-create__label">技能名称</label>
            <input
              type="text"
              class="skills-create__input ${createState.nameError ? "error" : ""}"
              placeholder="my-skill"
              .value=${createState.name}
              @input=${(e: Event) => props.onCreateNameChange((e.target as HTMLInputElement).value)}
            />
            ${createState.nameError
              ? html`<div class="skills-create__field-error">${createState.nameError}</div>`
              : html`<div class="skills-create__hint">仅允许小写字母、数字和连字符</div>`}
          </div>

          <div class="skills-create__field">
            <label class="skills-create__label">创建位置</label>
            <div class="skills-create__radio-group">
              <label class="skills-create__radio">
                <input
                  type="radio"
                  name="create-source"
                  value="workspace"
                  .checked=${createState.source === "workspace"}
                  @change=${() => props.onCreateSourceChange("workspace")}
                />
                <span class="skills-create__radio-mark"></span>
                <span class="skills-create__radio-text">
                  <strong>工作区技能</strong>
                  <small>仅当前项目可用</small>
                </span>
              </label>
              <label class="skills-create__radio">
                <input
                  type="radio"
                  name="create-source"
                  value="managed"
                  .checked=${createState.source === "managed"}
                  @change=${() => props.onCreateSourceChange("managed")}
                />
                <span class="skills-create__radio-mark"></span>
                <span class="skills-create__radio-text">
                  <strong>本地技能</strong>
                  <small>所有项目可用</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="skills-modal__footer">
          <button class="mc-btn" @click=${props.onCreateClose}>取消</button>
          <button
            class="mc-btn primary"
            ?disabled=${createState.creating || !!createState.nameError || !createState.name.trim()}
            @click=${props.onCreateConfirm}
          >
            ${createState.creating ? "创建中..." : "创建技能"}
          </button>
        </div>
      </div>
    </div>
  `;
}
