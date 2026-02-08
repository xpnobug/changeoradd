/**
 * Agent 侧边栏组件
 * Agent sidebar component
 *
 * 左侧导航：Agent 列表 + 全局配置入口
 * Left navigation: Agent list + global config entry
 */
import { html, nothing } from "lit";
import type { AgentsListResult, AgentIdentityResult } from "../../../ui/types";
import { LABELS } from "../../types/agents-config";

// ─────────────────────────────────────────────────────────────────────────────
// SVG 图标 / SVG Icons
// ─────────────────────────────────────────────────────────────────────────────

const icons = {
  // 刷新图标 / Refresh icon
  refresh: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  `,
  // 添加图标 / Add icon
  add: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  `,
  // 供应商图标 / Provider icon
  provider: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path
        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      ></path>
    </svg>
  `,
  // Gateway 图标 / Gateway icon
  gateway: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      ></path>
    </svg>
  `,
  // 通道图标 / Channel icon
  channel: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `,
  // Agent 设置图标 / Agent settings icon
  agent: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path
        d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"
      ></path>
      <circle cx="8" cy="14" r="1"></circle>
      <circle cx="16" cy="14" r="1"></circle>
    </svg>
  `,
  // 更多操作图标 / More actions icon
  more: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="12" cy="5" r="1"></circle>
      <circle cx="12" cy="19" r="1"></circle>
    </svg>
  `,
  // 复制图标 / Copy icon
  copy: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  `,
  // 导出图标 / Export icon
  download: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `,
  // 删除图标 / Delete icon
  trash: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `,
  // 折叠箭头 / Chevron icon
  chevron: html`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  `,
};

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type AgentStatus = "online" | "offline" | "error" | "idle";

export type AgentGroup = {
  id: string;
  label: string;
  agentIds: string[];
};

export type AgentSidebarProps = {
  agents: AgentsListResult["agents"];
  defaultId: string | null;
  selectedId: string | null;
  activeGlobalPanel?: string | null;
  loading: boolean;
  error: string | null;
  agentIdentityById: Record<string, AgentIdentityResult>;
  agentStatusById?: Record<string, AgentStatus>;
  hasChanges?: boolean;
  connected?: boolean;
  searchQuery?: string;
  openMenuId?: string | null;
  menuPosition?: { top: number; right: number };
  groups?: AgentGroup[];
  collapsedGroups?: Set<string>;
  showWizard?: boolean;
  onSelectAgent: (agentId: string) => void;
  onRefresh: () => void;
  onGlobalConfigClick?: (section: string) => void;
  onSetDefault?: (agentId: string) => void;
  onSearchChange?: (query: string) => void;
  onToggleMenu?: (agentId: string | null, top?: number, right?: number) => void;
  onDuplicate?: (agentId: string) => void;
  onExport?: (agentId: string) => void;
  onDelete?: (agentId: string) => void;
  onToggleGroup?: (groupId: string) => void;
  onCreateAgent?: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// 辅助函数 / Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 解析 Agent emoji
 * Resolve agent emoji
 */
function resolveAgentEmoji(
  agent: { identity?: { emoji?: string; avatar?: string } },
  agentIdentity?: AgentIdentityResult | null,
): string {
  const candidates = [
    agentIdentity?.emoji?.trim(),
    agent.identity?.emoji?.trim(),
    agentIdentity?.avatar?.trim(),
    agent.identity?.avatar?.trim(),
  ];

  for (const candidate of candidates) {
    if (candidate && isLikelyEmoji(candidate)) {
      return candidate;
    }
  }
  return "";
}

/**
 * 判断是否为 emoji
 * Check if string is likely an emoji
 */
function isLikelyEmoji(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 16) return false;

  let hasNonAscii = false;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed.charCodeAt(i) > 127) {
      hasNonAscii = true;
      break;
    }
  }
  if (!hasNonAscii) return false;
  if (trimmed.includes("://") || trimmed.includes("/") || trimmed.includes(".")) {
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 渲染函数 / Render Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染单个 Agent 行
 * Render a single agent row
 */
function renderAgentRow(props: {
  agent: AgentsListResult["agents"][number];
  defaultId: string | null;
  isSelected: boolean;
  identity: AgentIdentityResult | null;
  status?: AgentStatus;
  onSelect: () => void;
  onSetDefault?: (agentId: string) => void;
  onToggleMenu?: (agentId: string | null, top?: number, right?: number) => void;
}) {
  const { agent, defaultId, isSelected, identity, status, onSelect, onSetDefault, onToggleMenu } =
    props;
  const isDefault = defaultId && agent.id === defaultId;
  const emoji = resolveAgentEmoji(agent, identity);
  const displayName = agent.name?.trim() || identity?.name?.trim() || agent.id;
  const hasActions = onToggleMenu && onSetDefault;

  const handleMenuToggle = (e: Event) => {
    e.stopPropagation();
    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    // 传递 top 和 left 位置
    onToggleMenu?.(agent.id, rect.bottom + 4, rect.right);
  };

  return html`
    <button
      type="button"
      class="agents-sidebar__item ${isSelected ? "agents-sidebar__item--active" : ""}"
      @click=${onSelect}
      data-agent-id=${agent.id}
    >
      <span class="agents-sidebar__avatar">
        ${emoji || displayName.slice(0, 1)}
        ${status ? html`<span class="agents-sidebar__status-indicator agents-sidebar__status-indicator--${status}"></span>` : nothing}
      </span>
      <span class="agents-sidebar__item-content">
        <span class="agents-sidebar__item-name">${displayName}</span>
        <span class="agents-sidebar__item-id">${agent.id}</span>
      </span>
      ${isDefault ? html`<span class="agents-sidebar__badge">${LABELS.status.default}</span>` : nothing}
      ${
        hasActions
          ? html`
        <button class="agents-sidebar__more-btn" @click=${handleMenuToggle} title="更多操作">
          ${icons.more}
        </button>
      `
          : nothing
      }
    </button>
  `;
}

/**
 * 渲染浮动菜单（在 sidebar 根级别）
 */
function renderFloatingMenu(props: {
  agentId: string;
  isDefault: boolean;
  menuTop?: number;
  menuRight?: number;
  onClose: () => void;
  onSetDefault?: (agentId: string) => void;
  onDuplicate?: (agentId: string) => void;
  onExport?: (agentId: string) => void;
  onDelete?: (agentId: string) => void;
}) {
  const {
    agentId,
    isDefault,
    menuTop,
    menuRight,
    onClose,
    onSetDefault,
    onDuplicate,
    onExport,
    onDelete,
  } = props;

  const handleAction = (action: ((id: string) => void) | undefined) => (e: Event) => {
    e.stopPropagation();
    action?.(agentId);
    onClose();
  };

  const handleBackdropClick = (e: Event) => {
    e.stopPropagation();
    onClose();
  };

  // 菜单右对齐到按钮右边缘
  const menuStyle =
    menuTop !== undefined && menuRight !== undefined
      ? `top: ${menuTop}px; right: ${window.innerWidth - menuRight}px`
      : "";

  return html`
    <div class="agents-sidebar__menu-backdrop" @click=${handleBackdropClick}></div>
    <div class="agents-sidebar__menu" style=${menuStyle} data-for-agent=${agentId}>
      ${
        onSetDefault && !isDefault
          ? html`
        <button class="agents-sidebar__menu-item" @click=${handleAction(onSetDefault)}>
          ${icons.agent}<span>设为默认</span>
        </button>
      `
          : nothing
      }
      ${
        onDuplicate
          ? html`
        <button class="agents-sidebar__menu-item" @click=${handleAction(onDuplicate)}>
          ${icons.copy}<span>复制配置</span>
        </button>
      `
          : nothing
      }
      ${
        onExport
          ? html`
        <button class="agents-sidebar__menu-item" @click=${handleAction(onExport)}>
          ${icons.download}<span>导出</span>
        </button>
      `
          : nothing
      }
      ${
        onDelete
          ? html`
        <button class="agents-sidebar__menu-item agents-sidebar__menu-item--danger" @click=${handleAction(onDelete)}>
          ${icons.trash}<span>删除</span>
        </button>
      `
          : nothing
      }
    </div>
  `;
}

/**
 * 渲染全局配置入口
 * Render global config links
 */
function renderGlobalConfigLinks(
  activeGlobalPanel?: string | null,
  onGlobalConfigClick?: (section: string) => void,
) {
  const handleClick = (section: string) => (e: Event) => {
    e.preventDefault();
    onGlobalConfigClick?.(section);
  };

  const isActive = (section: string) => activeGlobalPanel === section;

  return html`
    <div class="agents-sidebar__section">
      <div class="agents-sidebar__section-title">${LABELS.sidebar.globalConfig}</div>
      <nav class="agents-sidebar__links">
        <a href="#providers" class="agents-sidebar__link ${isActive("providers") ? "agents-sidebar__link--active" : ""}" @click=${handleClick("providers")}>
          <span class="agents-sidebar__link-icon">${icons.provider}</span>
          <span>${LABELS.sidebar.providers}</span>
        </a>
        <a href="#gateway" class="agents-sidebar__link ${isActive("gateway") ? "agents-sidebar__link--active" : ""}" @click=${handleClick("gateway")}>
          <span class="agents-sidebar__link-icon">${icons.gateway}</span>
          <span>${LABELS.sidebar.gateway}</span>
        </a>
        <a href="#agent" class="agents-sidebar__link ${isActive("agent") ? "agents-sidebar__link--active" : ""}" @click=${handleClick("agent")}>
          <span class="agents-sidebar__link-icon">${icons.agent}</span>
          <span>${LABELS.sidebar.agent}</span>
        </a>
        <a href="#channels" class="agents-sidebar__link ${isActive("channels") ? "agents-sidebar__link--active" : ""}" @click=${handleClick("channels")}>
          <span class="agents-sidebar__link-icon">${icons.channel}</span>
          <span>${LABELS.sidebar.channels}</span>
        </a>
      </nav>
    </div>
  `;
}

/**
 * 渲染搜索框
 * Render search bar
 */
function renderSearchBar(props: AgentSidebarProps) {
  if (!props.onSearchChange) return nothing;
  const handleInput = (e: Event) => {
    props.onSearchChange?.((e.target as HTMLInputElement).value);
  };
  return html`
    <div class="agents-sidebar__search">
      <input
        type="text"
        class="agents-sidebar__search-input"
        placeholder="搜索 Agent..."
        .value=${props.searchQuery ?? ""}
        @input=${handleInput}
      />
      ${
        props.searchQuery
          ? html`
        <button class="agents-sidebar__search-clear" @click=${() => props.onSearchChange?.("")}>×</button>
      `
          : nothing
      }
    </div>
  `;
}

/**
 * 渲染分组的 Agent 列表
 * Render grouped agent list
 */
function renderGroupedAgentList(
  props: AgentSidebarProps,
  filteredAgents: AgentsListResult["agents"],
) {
  const { groups, collapsedGroups, onToggleGroup } = props;
  if (!groups || groups.length === 0) return nothing;

  const agentMap = new Map(filteredAgents.map((a) => [a.id, a]));
  const groupedIds = new Set(groups.flatMap((g) => g.agentIds));
  const ungroupedAgents = filteredAgents.filter((a) => !groupedIds.has(a.id));

  const renderAgentItem = (agent: AgentsListResult["agents"][number]) =>
    renderAgentRow({
      agent,
      defaultId: props.defaultId,
      isSelected: props.selectedId === agent.id,
      identity: props.agentIdentityById[agent.id] ?? null,
      status: props.agentStatusById?.[agent.id],
      onSelect: () => props.onSelectAgent(agent.id),
      onSetDefault: props.onSetDefault,
      onToggleMenu: props.onToggleMenu,
    });

  return html`
    ${groups.map((group) => {
      const groupAgents = group.agentIds
        .map((id) => agentMap.get(id))
        .filter((a): a is AgentsListResult["agents"][number] => !!a);
      if (groupAgents.length === 0) return nothing;

      const isCollapsed = collapsedGroups?.has(group.id) ?? false;
      return html`
        <div class="agents-sidebar__group">
          <button
            class="agents-sidebar__group-header"
            @click=${() => onToggleGroup?.(group.id)}
          >
            <span class="agents-sidebar__group-chevron ${isCollapsed ? "" : "agents-sidebar__group-chevron--open"}">
              ${icons.chevron}
            </span>
            <span class="agents-sidebar__group-label">${group.label}</span>
            <span class="agents-sidebar__group-count">${groupAgents.length}</span>
          </button>
          ${
            isCollapsed
              ? nothing
              : html`
            <div class="agents-sidebar__group-items">
              ${groupAgents.map(renderAgentItem)}
            </div>
          `
          }
        </div>
      `;
    })}
    ${
      ungroupedAgents.length > 0
        ? html`
      <div class="agents-sidebar__group">
        <div class="agents-sidebar__group-header agents-sidebar__group-header--static">
          <span class="agents-sidebar__group-label">未分组</span>
          <span class="agents-sidebar__group-count">${ungroupedAgents.length}</span>
        </div>
        <div class="agents-sidebar__group-items">
          ${ungroupedAgents.map(renderAgentItem)}
        </div>
      </div>
    `
        : nothing
    }
  `;
}

/**
 * 渲染 Agent 侧边栏
 * Render agent sidebar
 */
export function renderAgentSidebar(props: AgentSidebarProps) {
  // 过滤 Agent 列表
  const query = props.searchQuery?.toLowerCase().trim() ?? "";
  const filteredAgents = query
    ? props.agents.filter((a: AgentsListResult["agents"][number]) => {
        const name = a.name?.toLowerCase() ?? "";
        const id = a.id.toLowerCase();
        return name.includes(query) || id.includes(query);
      })
    : props.agents;

  const hasGroups = props.groups && props.groups.length > 0;

  // 查找打开菜单的 Agent
  const openMenuAgent = props.openMenuId
    ? props.agents.find((a) => a.id === props.openMenuId)
    : null;

  return html`
    <aside class="agents-sidebar">
      <!-- Agent 列表头部 / Agent list header -->
      <div class="agents-sidebar__header">
        <div class="agents-sidebar__header-info">
          <h2 class="agents-sidebar__title">${LABELS.sidebar.agents}</h2>
          <span class="agents-sidebar__count">${props.agents.length} ${LABELS.sidebar.agentsCount}</span>
        </div>
        <div class="agents-sidebar__header-actions">
          ${
            props.onCreateAgent
              ? html`
            <button
              class="mc-btn mc-btn--icon mc-btn--sm mc-btn--primary"
              @click=${props.onCreateAgent}
              title="创建 Agent"
            >
              ${icons.add}
            </button>
          `
              : nothing
          }
          <button
            class="mc-btn mc-btn--icon mc-btn--sm"
            ?disabled=${props.loading}
            @click=${props.onRefresh}
            title=${LABELS.actions.refresh}
          >
            ${icons.refresh}
          </button>
        </div>
      </div>

      <!-- 搜索框 / Search bar -->
      ${renderSearchBar(props)}

      <!-- 错误提示 / Error message -->
      ${
        props.error
          ? html`<div class="mc-error" style="margin: 0 12px;">${props.error}</div>`
          : nothing
      }

      <!-- Agent 列表 / Agent list -->
      <div class="agents-sidebar__list">
        ${
          filteredAgents.length === 0
            ? html`<div class="agents-sidebar__empty">${props.loading ? LABELS.actions.loading : query ? "无匹配结果" : LABELS.empty.noAgents}</div>`
            : hasGroups
              ? renderGroupedAgentList(props, filteredAgents)
              : filteredAgents.map((agent: AgentsListResult["agents"][number]) =>
                  renderAgentRow({
                    agent,
                    defaultId: props.defaultId,
                    isSelected: props.selectedId === agent.id,
                    identity: props.agentIdentityById[agent.id] ?? null,
                    status: props.agentStatusById?.[agent.id],
                    onSelect: () => props.onSelectAgent(agent.id),
                    onSetDefault: props.onSetDefault,
                    onToggleMenu: props.onToggleMenu,
                  }),
                )
        }
      </div>

      <!-- 全局配置入口 / Global config links -->
      ${renderGlobalConfigLinks(props.activeGlobalPanel, props.onGlobalConfigClick)}

      <!-- 底部状态栏 / Footer status bar -->
      <div class="agents-sidebar__footer">
        <div class="agents-sidebar__status">
          <span class="agents-sidebar__status-dot ${props.connected ? "agents-sidebar__status-dot--ok" : ""}"></span>
          <span class="agents-sidebar__status-text">
            ${props.connected ? LABELS.status.connected : LABELS.status.disconnected}
          </span>
        </div>
        ${props.hasChanges ? html`<span class="agents-sidebar__unsaved">${LABELS.status.unsaved}</span>` : nothing}
      </div>

      <!-- 浮动菜单 / Floating menu -->
      ${
        openMenuAgent
          ? renderFloatingMenu({
              agentId: openMenuAgent.id,
              isDefault: props.defaultId === openMenuAgent.id,
              menuTop: props.menuPosition?.top,
              menuRight: props.menuPosition?.right,
              onClose: () => props.onToggleMenu?.(null),
              onSetDefault: props.onSetDefault,
              onDuplicate: props.onDuplicate,
              onExport: props.onExport,
              onDelete: props.onDelete,
            })
          : nothing
      }
    </aside>
  `;
}
