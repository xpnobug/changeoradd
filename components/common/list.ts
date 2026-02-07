/**
 * 通用列表组件
 */
import { html, nothing, type TemplateResult } from "lit";
import { renderEmptyState } from "./state";

// ============================================
// 类型定义
// ============================================

export type ListItemProps<T> = {
  item: T;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export type ListProps<T> = {
  items: T[];
  renderItem: (props: ListItemProps<T>, index: number) => TemplateResult;
  keyFn?: (item: T, index: number) => string;
  selectedKey?: string;
  onSelect?: (item: T, index: number) => void;
  emptyState?: {
    title?: string;
    message?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  className?: string;
};

// ============================================
// 渲染函数
// ============================================

/**
 * 渲染列表
 */
export function renderList<T>(props: ListProps<T>): TemplateResult {
  if (props.items.length === 0) {
    return renderEmptyState({
      title: props.emptyState?.title ?? "暂无数据",
      message: props.emptyState?.message,
      action: props.emptyState?.action,
    });
  }

  return html`
    <div class="list ${props.className ?? ""}">
      ${props.items.map((item, index) => {
        const key = props.keyFn?.(item, index) ?? String(index);
        const selected = props.selectedKey === key;

        return props.renderItem(
          {
            item,
            selected,
            onClick: () => props.onSelect?.(item, index),
          },
          index,
        );
      })}
    </div>
  `;
}

/**
 * 渲染简单列表项
 */
export function renderSimpleListItem(props: {
  label: string;
  description?: string;
  icon?: TemplateResult;
  badge?: string | TemplateResult;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  actions?: TemplateResult;
  className?: string;
}): TemplateResult {
  return html`
    <div
      class="list-item ${props.selected ? "list-item--selected" : ""} ${props.disabled ? "list-item--disabled" : ""} ${props.className ?? ""}"
      @click=${props.disabled ? nothing : props.onClick}
    >
      ${props.icon ? html`<div class="list-item__icon">${props.icon}</div>` : nothing}
      <div class="list-item__content">
        <div class="list-item__label">${props.label}</div>
        ${props.description ? html`<div class="list-item__desc">${props.description}</div>` : nothing}
      </div>
      ${props.badge
        ? html`<div class="list-item__badge">${props.badge}</div>`
        : nothing}
      ${props.actions
        ? html`<div class="list-item__actions">${props.actions}</div>`
        : nothing}
    </div>
  `;
}

/**
 * 渲染可选列表项
 */
export function renderSelectableListItem(props: {
  label: string;
  description?: string;
  icon?: TemplateResult;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}): TemplateResult {
  const checkIcon = html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  return html`
    <button
      class="list-item list-item--selectable ${props.selected ? "list-item--selected" : ""} ${props.disabled ? "list-item--disabled" : ""} ${props.className ?? ""}"
      ?disabled=${props.disabled}
      @click=${props.onClick}
    >
      ${props.icon ? html`<div class="list-item__icon">${props.icon}</div>` : nothing}
      <div class="list-item__content">
        <div class="list-item__label">${props.label}</div>
        ${props.description ? html`<div class="list-item__desc">${props.description}</div>` : nothing}
      </div>
      <div class="list-item__check ${props.selected ? "list-item__check--visible" : ""}">
        ${checkIcon}
      </div>
    </button>
  `;
}

/**
 * 渲染分组列表
 */
export function renderGroupedList<T>(props: {
  groups: Array<{
    key: string;
    label: string;
    items: T[];
    collapsed?: boolean;
  }>;
  renderItem: (props: ListItemProps<T>, index: number) => TemplateResult;
  onToggleGroup?: (groupKey: string) => void;
  className?: string;
}): TemplateResult {
  const chevronIcon = html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  return html`
    <div class="list list--grouped ${props.className ?? ""}">
      ${props.groups.map((group) => html`
        <div class="list-group ${group.collapsed ? "list-group--collapsed" : ""}">
          <button
            class="list-group__header"
            @click=${() => props.onToggleGroup?.(group.key)}
          >
            <span class="list-group__label">${group.label}</span>
            <span class="list-group__count">${group.items.length}</span>
            <span class="list-group__chevron">${chevronIcon}</span>
          </button>
          ${!group.collapsed
            ? html`
                <div class="list-group__items">
                  ${group.items.map((item, index) =>
                    props.renderItem({ item }, index),
                  )}
                </div>
              `
            : nothing}
        </div>
      `)}
    </div>
  `;
}
