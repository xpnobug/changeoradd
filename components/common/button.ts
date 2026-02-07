/**
 * 通用按钮组件
 */
import { html, nothing, type TemplateResult } from "lit";

// ============================================
// 类型定义
// ============================================

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";
export type ButtonSize = "small" | "medium" | "large";

export type ButtonProps = {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: TemplateResult;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

// ============================================
// 图标
// ============================================

const loadingIcon = html`
  <svg class="btn__loading-icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
  </svg>
`;

// ============================================
// 渲染函数
// ============================================

/**
 * 渲染按钮
 */
export function renderButton(props: ButtonProps): TemplateResult {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "medium";
  const iconPosition = props.iconPosition ?? "left";
  const isDisabled = props.disabled || props.loading;

  return html`
    <button
      class="btn btn--${variant} btn--${size} ${props.className ?? ""}"
      ?disabled=${isDisabled}
      @click=${props.onClick}
    >
      ${props.loading
        ? loadingIcon
        : props.icon && iconPosition === "left"
          ? html`<span class="btn__icon">${props.icon}</span>`
          : nothing}
      <span class="btn__label">${props.loading ? "处理中..." : props.label}</span>
      ${!props.loading && props.icon && iconPosition === "right"
        ? html`<span class="btn__icon">${props.icon}</span>`
        : nothing}
    </button>
  `;
}

/**
 * 渲染图标按钮
 */
export function renderIconButton(props: {
  icon: TemplateResult;
  onClick: () => void;
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
}): TemplateResult {
  const variant = props.variant ?? "ghost";
  const size = props.size ?? "medium";

  return html`
    <button
      class="btn-icon btn-icon--${variant} btn-icon--${size} ${props.className ?? ""}"
      title=${props.title ?? nothing}
      ?disabled=${props.disabled}
      @click=${props.onClick}
    >
      ${props.icon}
    </button>
  `;
}

/**
 * 渲染按钮组
 */
export function renderButtonGroup(
  buttons: Array<ButtonProps | null | undefined>,
  options?: {
    align?: "left" | "center" | "right";
    gap?: "small" | "medium" | "large";
    className?: string;
  },
): TemplateResult {
  const align = options?.align ?? "left";
  const gap = options?.gap ?? "medium";
  const validButtons = buttons.filter((b): b is ButtonProps => b != null);

  if (validButtons.length === 0) return html``;

  return html`
    <div class="btn-group btn-group--${align} btn-group--gap-${gap} ${options?.className ?? ""}">
      ${validButtons.map((btn) => renderButton(btn))}
    </div>
  `;
}
