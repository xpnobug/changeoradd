/**
 * 删除确认弹窗组件
 * Delete confirmation modal component
 */
import { html, nothing } from "lit";
import type { SkillsContentProps } from "../../types/skills-config";

/**
 * 渲染删除确认弹窗
 * Render delete confirmation modal
 */
export function renderDeleteModal(props: SkillsContentProps) {
  const { deleteState } = props;

  return html`
    <div class="skills-modal-overlay" @click=${props.onDeleteClose}>
      <div class="skills-modal skills-delete-modal" @click=${(e: Event) => e.stopPropagation()}>
        <!-- 弹窗头部 -->
        <div class="skills-modal__header skills-modal__header--danger">
          <div class="skills-modal__title">
            <span class="skills-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </span>
            删除技能
          </div>
          <button class="skills-modal__close" @click=${props.onDeleteClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="skills-modal__body">
          ${deleteState.error ? html`<div class="skills-delete__error">${deleteState.error}</div>` : nothing}

          <div class="skills-delete__warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>此操作不可撤销</span>
          </div>

          <p class="skills-delete__message">确定要删除技能 <strong>${deleteState.skillName}</strong> 吗？</p>
          <p class="skills-delete__info">技能目录及其所有文件将被永久删除。</p>
        </div>

        <!-- 底部按钮 -->
        <div class="skills-modal__footer">
          <button class="mc-btn" @click=${props.onDeleteClose}>取消</button>
          <button class="mc-btn mc-btn--danger" ?disabled=${deleteState.deleting} @click=${props.onDeleteConfirm}>
            ${deleteState.deleting ? "删除中..." : "确认删除"}
          </button>
        </div>
      </div>
    </div>
  `;
}
