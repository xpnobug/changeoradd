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
  refresh: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  // 供应商图标 / Provider icon
  provider: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`,
  // Gateway 图标 / Gateway icon
  gateway: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  // 通道图标 / Channel icon
  channel: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  // Agent 设置图标 / Agent settings icon
  agent: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path><circle cx="8" cy="14" r="1"></circle><circle cx="16" cy="14" r="1"></circle></svg>`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type AgentSidebarProps = {
  agents: AgentsListResult["agents"];
  defaultId: string | null;
  selectedId: string | null;
  activeGlobalPanel?: string | null;
  loading: boolean;
  error: string | null;
  agentIdentityById: Record<string, AgentIdentityResult>;
  hasChanges?: boolean;
  connected?: boolean;
  onSelectAgent: (agentId: string) => void;
  onRefresh: () => void;
  onGlobalConfigClick?: (section: string) => void;
  onSetDefault?: (agentId: string) => void;
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
  onSelect: () => void;
  onSetDefault?: (agentId: string) => void;
}) {
  const { agent, defaultId, isSelected, identity, onSelect, onSetDefault } = props;
  const isDefault = defaultId && agent.id === defaultId;
  const emoji = resolveAgentEmoji(agent, identity);
  const displayName = agent.name?.trim() || identity?.name?.trim() || agent.id;

  const handleSetDefault = (e: Event) => {
    e.stopPropagation();
    onSetDefault?.(agent.id);
  };

  return html`
    <button
      type="button"
      class="agents-sidebar__item ${isSelected ? "agents-sidebar__item--active" : ""}"
      @click=${onSelect}
    >
      <span class="agents-sidebar__avatar">
        ${emoji || displayName.slice(0, 1)}
      </span>
      <span class="agents-sidebar__item-content">
        <span class="agents-sidebar__item-name">${displayName}</span>
        <span class="agents-sidebar__item-id">${agent.id}</span>
      </span>
      ${isDefault
        ? html`<span class="agents-sidebar__badge">${LABELS.status.default}</span>`
        : onSetDefault
          ? html`<span
              class="agents-sidebar__set-default"
              @click=${handleSetDefault}
              title=${LABELS.actions.setDefault}
            >${LABELS.actions.setDefault}</span>`
          : nothing}
    </button>
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
 * 渲染 Agent 侧边栏
 * Render agent sidebar
 */
export function renderAgentSidebar(props: AgentSidebarProps) {
  return html`
    <aside class="agents-sidebar">
      <!-- Agent 列表头部 / Agent list header -->
      <div class="agents-sidebar__header">
        <div class="agents-sidebar__header-info">
          <h2 class="agents-sidebar__title">${LABELS.sidebar.agents}</h2>
          <span class="agents-sidebar__count">${props.agents.length} ${LABELS.sidebar.agentsCount}</span>
        </div>
        <button
          class="mc-btn mc-btn--icon mc-btn--sm"
          ?disabled=${props.loading}
          @click=${props.onRefresh}
          title=${LABELS.actions.refresh}
        >
          ${icons.refresh}
        </button>
      </div>

      <!-- 错误提示 / Error message -->
      ${props.error
        ? html`<div class="mc-error" style="margin: 0 12px;">${props.error}</div>`
        : nothing}

      <!-- Agent 列表 / Agent list -->
      <div class="agents-sidebar__list">
        ${props.agents.length === 0
          ? html`<div class="agents-sidebar__empty">${props.loading ? LABELS.actions.loading : LABELS.empty.noAgents}</div>`
          : props.agents.map((agent) =>
              renderAgentRow({
                agent,
                defaultId: props.defaultId,
                isSelected: props.selectedId === agent.id,
                identity: props.agentIdentityById[agent.id] ?? null,
                onSelect: () => props.onSelectAgent(agent.id),
                onSetDefault: props.onSetDefault,
              }),
            )}
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
    </aside>
  `;
}
