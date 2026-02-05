/**
 * Agent Tab 切换栏组件
 * Agent tab navigation component
 *
 * 提供 5 个 Tab 切换：概览、文件、工具、技能、定时任务
 * Provides 5 tabs: Overview, Files, Tools, Skills, Cron
 */
import { html } from "lit";
import type { AgentPanel } from "../../types/agents-config";
import { LABELS } from "../../types/agents-config";

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type AgentTabsProps = {
  active: AgentPanel;
  onSelect: (panel: AgentPanel) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab 定义 / Tab Definitions
// ─────────────────────────────────────────────────────────────────────────────

const TABS: Array<{ id: AgentPanel; label: string }> = [
  { id: "overview", label: LABELS.panels.overview },
  { id: "files", label: LABELS.panels.files },
  { id: "tools", label: LABELS.panels.tools },
  { id: "skills", label: LABELS.panels.skills },
  { id: "cron", label: LABELS.panels.cron },
];

// ─────────────────────────────────────────────────────────────────────────────
// 渲染函数 / Render Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染 Agent Tab 切换栏
 * Render agent tab navigation
 */
export function renderAgentTabs(props: AgentTabsProps) {
  return html`
    <nav class="agent-tabs">
      ${TABS.map(
        (tab) => html`
          <button
            class="agent-tabs__item ${props.active === tab.id ? "agent-tabs__item--active" : ""}"
            type="button"
            @click=${() => props.onSelect(tab.id)}
          >
            ${tab.label}
          </button>
        `,
      )}
    </nav>
  `;
}
