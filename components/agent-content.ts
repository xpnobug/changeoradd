/**
 * Agent 设置配置内容组件
 * Agent settings configuration content component
 *
 * 右侧面板 - Agent 全局默认参数
 * Right panel - Agent global default parameters
 */
import { html } from "lit";
import type { AgentDefaults } from "../views/model-config";

// ─────────────────────────────────────────────────────────────────────────────
// SVG 图标 / SVG Icons
// ─────────────────────────────────────────────────────────────────────────────

const icons = {
  agent: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path><circle cx="8" cy="14" r="1"></circle><circle cx="16" cy="14" r="1"></circle></svg>`,
  settings: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 中文标签 / Chinese Labels
// ─────────────────────────────────────────────────────────────────────────────

const LABELS = {
  // Agent 设置标题 / Agent settings title
  agentTitle: "Agent 全局设置",
  agentDesc: "配置所有 Agent 的默认运行参数",
  // 默认参数 / Default parameters
  defaultsTitle: "默认参数",
  defaultsDesc: "设置 Agent 运行时的默认参数（可被单个 Agent 覆盖）",
  primaryModel: "默认模型",
  maxConcurrent: "最大并发",
  subagentConcurrent: "子 Agent 并发",
  workspace: "工作目录",
  contextPruning: "上下文裁剪",
  compactionMode: "压缩模式",
  pruneCacheTtl: "缓存 TTL",
  pruneTokenLimit: "Token 限制",
  compactSafeguard: "保守模式",
  compactAggressive: "激进模式",
};

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type AgentContentProps = {
  // Agent 默认设置 / Agent default settings
  agentDefaults: AgentDefaults;
  availableModels: Array<{ id: string; name: string; provider: string }>;
  onAgentDefaultsUpdate: (path: string[], value: unknown) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// 渲染函数 / Render Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染默认参数设置
 * Render default parameters settings
 */
function renderDefaultsSection(props: AgentContentProps) {
  const defaults = props.agentDefaults;

  return html`
    <div class="mc-section">
      <div class="mc-section__header">
        <div class="mc-section__icon">${icons.settings}</div>
        <div class="mc-section__titles">
          <h3 class="mc-section__title">${LABELS.defaultsTitle}</h3>
          <p class="mc-section__desc">${LABELS.defaultsDesc}</p>
        </div>
      </div>
      <div class="mc-card">
        <div class="mc-card__content">
          <!-- 模型和工作目录 / Model and workspace -->
          <div class="mc-form-row mc-form-row--2col">
            <label class="mc-field">
              <span class="mc-field__label">${LABELS.primaryModel}</span>
              <select
                class="mc-select"
                @change=${(e: Event) =>
                  props.onAgentDefaultsUpdate(
                    ["model", "primary"],
                    (e.target as HTMLSelectElement).value,
                  )}
              >
                <option value="" ?selected=${!defaults.model?.primary}>-- 选择模型 --</option>
                ${props.availableModels.map(
                  (m) => html`<option value=${m.id} ?selected=${m.id === defaults.model?.primary}>${m.name} (${m.provider})</option>`,
                )}
              </select>
            </label>
            <label class="mc-field">
              <span class="mc-field__label">${LABELS.workspace}</span>
              <input
                type="text"
                class="mc-input"
                .value=${defaults.workspace ?? ""}
                placeholder="/path/to/workspace"
                @input=${(e: Event) =>
                  props.onAgentDefaultsUpdate(["workspace"], (e.target as HTMLInputElement).value)}
              />
            </label>
          </div>
          <!-- 并发设置 / Concurrency settings -->
          <div class="mc-form-row mc-form-row--2col">
            <label class="mc-field">
              <span class="mc-field__label">${LABELS.maxConcurrent}</span>
              <input
                type="number"
                class="mc-input"
                .value=${String(defaults.maxConcurrent ?? 4)}
                min="1"
                max="32"
                @input=${(e: Event) =>
                  props.onAgentDefaultsUpdate(
                    ["maxConcurrent"],
                    Number((e.target as HTMLInputElement).value),
                  )}
              />
            </label>
            <label class="mc-field">
              <span class="mc-field__label">${LABELS.subagentConcurrent}</span>
              <input
                type="number"
                class="mc-input"
                .value=${String(defaults.subagents?.maxConcurrent ?? 8)}
                min="1"
                max="32"
                @input=${(e: Event) =>
                  props.onAgentDefaultsUpdate(
                    ["subagents", "maxConcurrent"],
                    Number((e.target as HTMLInputElement).value),
                  )}
              />
            </label>
          </div>
          <!-- 上下文管理 / Context management -->
          <div class="mc-form-row mc-form-row--2col">
            <label class="mc-field">
              <span class="mc-field__label">${LABELS.contextPruning}</span>
              <select
                class="mc-select"
                .value=${defaults.contextPruning?.mode ?? "cache-ttl"}
                @change=${(e: Event) =>
                  props.onAgentDefaultsUpdate(
                    ["contextPruning", "mode"],
                    (e.target as HTMLSelectElement).value,
                  )}
              >
                <option value="cache-ttl">${LABELS.pruneCacheTtl}</option>
                <option value="token-limit">${LABELS.pruneTokenLimit}</option>
              </select>
            </label>
            <label class="mc-field">
              <span class="mc-field__label">${LABELS.compactionMode}</span>
              <select
                class="mc-select"
                .value=${defaults.compaction?.mode ?? "safeguard"}
                @change=${(e: Event) =>
                  props.onAgentDefaultsUpdate(
                    ["compaction", "mode"],
                    (e.target as HTMLSelectElement).value,
                  )}
              >
                <option value="safeguard">${LABELS.compactSafeguard}</option>
                <option value="aggressive">${LABELS.compactAggressive}</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 主渲染函数 / Main Render Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染 Agent 设置内容
 * Render Agent settings content
 */
export function renderAgentContent(props: AgentContentProps) {
  return html`
    <div class="config-content">
      <div class="config-content__header">
        <div class="config-content__icon">${icons.agent}</div>
        <div class="config-content__titles">
          <h2 class="config-content__title">${LABELS.agentTitle}</h2>
          <p class="config-content__desc">${LABELS.agentDesc}</p>
        </div>
      </div>
      <div class="config-content__body">
        <!-- 默认设置区块 / Default settings section -->
        ${renderDefaultsSection(props)}
      </div>
    </div>
  `;
}
