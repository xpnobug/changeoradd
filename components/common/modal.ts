/**
 * 通用弹窗组件
 * 提供统一的 Modal 渲染
 */
import { html, nothing, type TemplateResult } from "lit";

// ============================================
// 类型定义
// ============================================

export type ModalSize = "small" | "medium" | "large" | "full";

export type ModalProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  closable?: boolean;
  onClose?: () => void;
  footer?: TemplateResult;
  className?: string;
};

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string | TemplateResult;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// ============================================
// 图标
// ============================================

const closeIcon = html`
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
`;

// ============================================
// 渲染函数
// ============================================

/**
 * 渲染通用弹窗
 */
export function renderModal(
  props: ModalProps,
  content: TemplateResult,
): TemplateResult {
  if (!props.open) return html``;

  const size = props.size ?? "medium";
  const closable = props.closable !== false;

  return html`
    <div class="modal-overlay" @click=${(e: Event) => {
      if (e.target === e.currentTarget && closable && props.onClose) {
        props.onClose();
      }
    }}>
      <div class="modal modal--${size} ${props.className ?? ""}">
        ${props.title || closable
          ? html`
              <div class="modal__header">
                <div class="modal__title-group">
                  ${props.title ? html`<h3 class="modal__title">${props.title}</h3>` : nothing}
                  ${props.subtitle ? html`<p class="modal__subtitle">${props.subtitle}</p>` : nothing}
                </div>
                ${closable && props.onClose
                  ? html`
                      <button class="modal__close" @click=${props.onClose}>
                        ${closeIcon}
                      </button>
                    `
                  : nothing}
              </div>
            `
          : nothing}
        <div class="modal__body">
          ${content}
        </div>
        ${props.footer
          ? html`<div class="modal__footer">${props.footer}</div>`
          : nothing}
      </div>
    </div>
  `;
}

/**
 * 渲染确认弹窗
 */
export function renderConfirmModal(props: ConfirmModalProps): TemplateResult {
  if (!props.open) return html``;

  const confirmLabel = props.confirmLabel ?? "确认";
  const cancelLabel = props.cancelLabel ?? "取消";
  const confirmVariant = props.confirmVariant ?? "primary";

  return renderModal(
    {
      open: props.open,
      title: props.title,
      size: "small",
      closable: !props.loading,
      onClose: props.onCancel,
      footer: html`
        <div class="modal__actions">
          <button
            class="btn btn--secondary"
            ?disabled=${props.loading}
            @click=${props.onCancel}
          >
            ${cancelLabel}
          </button>
          <button
            class="btn btn--${confirmVariant}"
            ?disabled=${props.loading}
            @click=${props.onConfirm}
          >
            ${props.loading ? "处理中..." : confirmLabel}
          </button>
        </div>
      `,
    },
    html`<p class="modal__message">${props.message}</p>`,
  );
}

/**
 * 渲染删除确认弹窗
 */
export function renderDeleteConfirmModal(props: {
  open: boolean;
  itemName: string;
  itemType?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}): TemplateResult {
  const itemType = props.itemType ?? "项目";

  return renderConfirmModal({
    open: props.open,
    title: `删除${itemType}`,
    message: html`确定要删除 <strong>${props.itemName}</strong> 吗？此操作无法撤销。`,
    confirmLabel: "删除",
    cancelLabel: "取消",
    confirmVariant: "danger",
    loading: props.loading,
    onConfirm: props.onConfirm,
    onCancel: props.onCancel,
  });
}

/**
 * 渲染表单弹窗
 */
export function renderFormModal(
  props: {
    open: boolean;
    title: string;
    subtitle?: string;
    size?: ModalSize;
    submitLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    disabled?: boolean;
    onSubmit: () => void;
    onCancel: () => void;
  },
  content: TemplateResult,
): TemplateResult {
  const submitLabel = props.submitLabel ?? "保存";
  const cancelLabel = props.cancelLabel ?? "取消";

  return renderModal(
    {
      open: props.open,
      title: props.title,
      subtitle: props.subtitle,
      size: props.size ?? "medium",
      closable: !props.loading,
      onClose: props.onCancel,
      footer: html`
        <div class="modal__actions">
          <button
            class="btn btn--secondary"
            ?disabled=${props.loading}
            @click=${props.onCancel}
          >
            ${cancelLabel}
          </button>
          <button
            class="btn btn--primary"
            ?disabled=${props.loading || props.disabled}
            @click=${props.onSubmit}
          >
            ${props.loading ? "保存中..." : submitLabel}
          </button>
        </div>
      `,
    },
    content,
  );
}
