/**
 * Agent 头部信息组件
 * Agent header component
 *
 * 显示 Agent 的 emoji、名称、ID 和 badge
 * Display agent emoji, name, ID and badge
 */
import { html, nothing } from "lit";
import type { AgentsListResult, AgentIdentityResult } from "../../../ui/types";
import { LABELS } from "../../types/agents-config";

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type AgentHeaderProps = {
  agent: AgentsListResult["agents"][number];
  defaultId: string | null;
  agentIdentity: AgentIdentityResult | null;
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
// 渲染函数 / Render Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染 Agent 头部
 * Render agent header
 */
export function renderAgentHeader(props: AgentHeaderProps) {
  const { agent, defaultId, agentIdentity } = props;
  const isDefault = defaultId && agent.id === defaultId;
  const displayName = agent.name?.trim() || agentIdentity?.name?.trim() || agent.id;
  const subtitle = agent.identity?.theme?.trim() || "Agent 工作区和路由配置";
  const emoji = resolveAgentEmoji(agent, agentIdentity);

  return html`
    <header class="agent-header">
      <div class="agent-header__main">
        <span class="agent-header__avatar">
          ${emoji || displayName.slice(0, 1)}
        </span>
        <div class="agent-header__info">
          <h2 class="agent-header__name">${displayName}</h2>
          <p class="agent-header__desc">${subtitle}</p>
        </div>
      </div>
      <div class="agent-header__meta">
        <span class="agent-header__id">${agent.id}</span>
        ${isDefault ? html`<span class="agent-header__badge">${LABELS.status.default}</span>` : nothing}
      </div>
    </header>
  `;
}
