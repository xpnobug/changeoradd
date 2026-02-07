/**
 * 通用状态组件
 * 提供加载、错误、空状态的统一渲染
 */
import { html, nothing, type TemplateResult } from "lit";

// ============================================
// 图标定义
// ============================================

const icons = {
  loading: html`
    <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
    </svg>
  `,
  error: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  `,
  empty: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="9" x2="15" y2="15"></line>
      <line x1="15" y1="9" x2="9" y2="15"></line>
    </svg>
  `,
  info: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `,
  success: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `,
  warning: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  `,
};

// ============================================
// 加载状态
// ============================================

export type LoadingStateProps = {
  message?: string;
  size?: "small" | "medium" | "large";
  className?: string;
};

/**
 * 渲染加载状态
 */
export function renderLoadingState(props?: LoadingStateProps): TemplateResult {
  const message = props?.message ?? "加载中...";
  const size = props?.size ?? "medium";

  return html`
    <div class="state-container state-container--loading state-container--${size} ${props?.className ?? ""}">
      <div class="state-icon state-icon--loading">${icons.loading}</div>
      <div class="state-message">${message}</div>
    </div>
  `;
}

// ============================================
// 错误状态
// ============================================

export type ErrorStateProps = {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

/**
 * 渲染错误状态
 */
export function renderErrorState(props?: ErrorStateProps): TemplateResult {
  const title = props?.title ?? "出错了";
  const message = props?.message ?? (props?.error instanceof Error ? props.error.message : props?.error) ?? "发生未知错误";

  return html`
    <div class="state-container state-container--error ${props?.className ?? ""}">
      <div class="state-icon state-icon--error">${icons.error}</div>
      <div class="state-title">${title}</div>
      <div class="state-message">${message}</div>
      ${props?.onRetry
        ? html`
            <button class="state-action" @click=${props.onRetry}>
              ${props.retryLabel ?? "重试"}
            </button>
          `
        : nothing}
    </div>
  `;
}

// ============================================
// 空状态
// ============================================

export type EmptyStateProps = {
  icon?: TemplateResult;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

/**
 * 渲染空状态
 */
export function renderEmptyState(props?: EmptyStateProps): TemplateResult {
  const title = props?.title ?? "暂无数据";
  const message = props?.message;

  return html`
    <div class="state-container state-container--empty ${props?.className ?? ""}">
      <div class="state-icon state-icon--empty">${props?.icon ?? icons.empty}</div>
      <div class="state-title">${title}</div>
      ${message ? html`<div class="state-message">${message}</div>` : nothing}
      ${props?.action
        ? html`
            <button class="state-action" @click=${props.action.onClick}>
              ${props.action.label}
            </button>
          `
        : nothing}
    </div>
  `;
}

// ============================================
// 信息提示
// ============================================

export type InfoStateProps = {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
};

/**
 * 渲染信息提示
 */
export function renderInfoState(props: InfoStateProps): TemplateResult {
  const type = props.type ?? "info";
  const iconMap = {
    info: icons.info,
    success: icons.success,
    warning: icons.warning,
    error: icons.error,
  };

  return html`
    <div class="state-banner state-banner--${type} ${props.className ?? ""}">
      <div class="state-banner__icon">${iconMap[type]}</div>
      <div class="state-banner__content">
        ${props.title ? html`<div class="state-banner__title">${props.title}</div>` : nothing}
        <div class="state-banner__message">${props.message}</div>
      </div>
      ${props.action
        ? html`
            <button class="state-banner__action" @click=${props.action.onClick}>
              ${props.action.label}
            </button>
          `
        : nothing}
      ${props.dismissible && props.onDismiss
        ? html`
            <button class="state-banner__dismiss" @click=${props.onDismiss}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          `
        : nothing}
    </div>
  `;
}

// ============================================
// 连接状态
// ============================================

export type ConnectionStateProps = {
  connected: boolean;
  connecting?: boolean;
  onReconnect?: () => void;
  className?: string;
};

/**
 * 渲染连接状态
 */
export function renderConnectionState(props: ConnectionStateProps): TemplateResult {
  if (props.connected) {
    return html``;
  }

  if (props.connecting) {
    return html`
      <div class="state-banner state-banner--warning ${props.className ?? ""}">
        <div class="state-banner__icon">${icons.loading}</div>
        <div class="state-banner__content">
          <div class="state-banner__message">正在连接...</div>
        </div>
      </div>
    `;
  }

  return html`
    <div class="state-banner state-banner--error ${props.className ?? ""}">
      <div class="state-banner__icon">${icons.error}</div>
      <div class="state-banner__content">
        <div class="state-banner__message">连接已断开</div>
      </div>
      ${props.onReconnect
        ? html`
            <button class="state-banner__action" @click=${props.onReconnect}>
              重新连接
            </button>
          `
        : nothing}
    </div>
  `;
}
