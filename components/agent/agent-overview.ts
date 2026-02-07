/**
 * Agent 概览面板组件
 * Agent overview panel component
 *
 * 显示基本信息、模型选择和会话管理
 * Display basic info, model selection and session management
 */
import { html, nothing } from "lit";
import type { AgentsListResult, AgentIdentityResult, AgentsFilesListResult } from "../../../ui/types";
import type { SessionRow, SessionsListResult } from "../../controllers/model-config";
import { LABELS, type ConfigSnapshot } from "../../types/agents-config";

// ─────────────────────────────────────────────────────────────────────────────
// SVG 图标 / SVG Icons
// ─────────────────────────────────────────────────────────────────────────────

const icons = {
  refresh: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  trash: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
};

// ─────────────────────────────────────────────────────────────────────────────
// 会话管理标签 / Session management labels
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_LABELS = {
  title: "会话管理",
  desc: "查看和管理该 Agent 的会话，为每个会话指定使用的模型",
  sessionKey: "会话",
  sessionModel: "模型",
  sessionUpdated: "最后更新",
  sessionActions: "操作",
  inheritDefault: "继承默认",
  noSessions: "暂无会话",
  loading: "加载中...",
  refresh: "刷新",
  create: "新建会话",
  createTitle: "新建会话",
  sessionNameLabel: "会话名称",
  sessionNamePlaceholder: "输入会话名称",
  sessionModelLabel: "模型（可选）",
  cancel: "取消",
  confirm: "创建",
  creating: "创建中...",
  delete: "删除",
  deleteTitle: "删除会话",
};

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type AgentOverviewProps = {
  agent: AgentsListResult["agents"][number];
  defaultId: string | null;
  configForm: Record<string, unknown> | null;
  agentFilesList: AgentsFilesListResult | null;
  agentIdentity: AgentIdentityResult | null;
  agentIdentityLoading: boolean;
  agentIdentityError: string | null;
  configLoading: boolean;
  configSaving: boolean;
  configDirty: boolean;
  onConfigReload: () => void;
  onConfigSave: () => void;
  onModelChange: (agentId: string, modelId: string | null) => void;
  onModelFallbacksChange: (agentId: string, fallbacks: string[]) => void;
  // 会话管理 / Session management
  sessionsLoading: boolean;
  sessionsResult: SessionsListResult | null;
  sessionsError: string | null;
  availableModels: Array<{ id: string; name: string; provider: string }>;
  onSessionsRefresh: () => void;
  onSessionModelChange: (sessionKey: string, model: string | null) => void;
  onSessionNavigate: (sessionKey: string) => void;
  onSessionDelete?: (sessionKey: string) => void;
  // 新建会话 / Create session
  sessionCreateShow?: boolean;
  sessionCreateName?: string;
  sessionCreateModel?: string | null;
  sessionCreating?: boolean;
  onSessionCreateShow?: (show: boolean) => void;
  onSessionCreateNameChange?: (name: string) => void;
  onSessionCreateModelChange?: (model: string | null) => void;
  onSessionCreate?: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// 辅助函数 / Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 从配置中解析 Agent 条目
 * Resolve agent config entry from config form
 */
function resolveAgentConfig(config: Record<string, unknown> | null, agentId: string) {
  const cfg = config as ConfigSnapshot | null;
  const list = cfg?.agents?.list ?? [];
  const entry = list.find((agent) => agent?.id === agentId);
  return { entry, defaults: cfg?.agents?.defaults };
}

/**
 * 解析工作区路径
 * Resolve workspace path
 *
 * 优先级：配置中的 workspace > 文件列表中的 workspace > 默认 workspace
 * Priority: config workspace > files list workspace > default workspace
 */
function resolveWorkspace(
  config: { entry?: { workspace?: string }; defaults?: { workspace?: string } },
  agentFilesList: AgentsFilesListResult | null,
  agentId: string,
): string {
  // 优先使用配置中的 workspace（更可靠）
  // Prefer workspace from config (more reliable)
  if (config.entry?.workspace) {
    return config.entry.workspace;
  }

  // 其次使用文件列表中的 workspace（如果 agentId 匹配）
  // Then use workspace from files list (if agentId matches)
  if (agentFilesList && agentFilesList.agentId === agentId && agentFilesList.workspace) {
    return agentFilesList.workspace;
  }

  // 最后使用默认 workspace
  // Finally use default workspace
  return config.defaults?.workspace || "default";
}

/**
 * 格式化模型标签
 * Format model label
 */
function resolveModelLabel(model?: unknown): string {
  if (!model) return "-";
  if (typeof model === "string") return model.trim() || "-";
  if (typeof model === "object" && model) {
    const record = model as { primary?: string; fallbacks?: string[] };
    const primary = record.primary?.trim();
    if (primary) {
      const fallbackCount = Array.isArray(record.fallbacks) ? record.fallbacks.length : 0;
      return fallbackCount > 0 ? `${primary} (+${fallbackCount} 备选)` : primary;
    }
  }
  return "-";
}

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

/**
 * 解析主模型
 * Resolve model primary
 */
function resolveModelPrimary(model?: unknown): string | null {
  if (!model) return null;
  if (typeof model === "string") {
    const trimmed = model.trim();
    return trimmed || null;
  }
  if (typeof model === "object" && model) {
    const record = model as Record<string, unknown>;
    const candidate =
      typeof record.primary === "string"
        ? record.primary
        : typeof record.model === "string"
          ? record.model
          : null;
    return candidate?.trim() || null;
  }
  return null;
}

/**
 * 解析备选模型列表
 * Resolve model fallbacks
 */
function resolveModelFallbacks(model?: unknown): string[] | null {
  if (!model || typeof model === "string") return null;
  if (typeof model === "object" && model) {
    const record = model as Record<string, unknown>;
    const fallbacks = Array.isArray(record.fallbacks) ? record.fallbacks : null;
    return fallbacks ? fallbacks.filter((entry): entry is string => typeof entry === "string") : null;
  }
  return null;
}

/**
 * 构建模型下拉选项
 * Build model dropdown options
 */
function buildModelOptions(configForm: Record<string, unknown> | null, current?: string | null) {
  const options: Array<{ value: string; label: string }> = [];

  // 从 models.providers 提取模型列表
  // Extract models from models.providers
  const modelsNode = (configForm as Record<string, unknown> | null)?.models as Record<string, unknown> | undefined;
  const providers = modelsNode?.providers as Record<string, unknown> | undefined;

  if (providers && typeof providers === "object") {
    for (const [providerKey, providerValue] of Object.entries(providers)) {
      if (!providerValue || typeof providerValue !== "object") continue;
      const provider = providerValue as Record<string, unknown>;
      const models = provider.models as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(models)) continue;

      for (const model of models) {
        const modelId = (model.id as string)?.trim();
        const modelName = (model.name as string)?.trim();
        if (!modelId) continue;

        const fullId = `${providerKey}/${modelId}`;
        const label = modelName && modelName !== modelId ? `${modelName} (${fullId})` : fullId;
        options.push({ value: fullId, label });
      }
    }
  }

  // 如果当前值不在选项中，添加它
  // If current value is not in options, add it
  if (current && !options.some((opt) => opt.value === current)) {
    options.unshift({ value: current, label: `${current} (当前)` });
  }

  if (options.length === 0) {
    return html`<option value="" disabled>无可用模型</option>`;
  }

  return options.map((opt) => html`<option value=${opt.value}>${opt.label}</option>`);
}

/**
 * 解析备选模型列表文本
 * Parse fallback list
 */
function parseFallbackList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * 格式化时间为相对时间
 * Format timestamp to relative time
 */
function formatAgo(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 会话渲染函数 / Session Render Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染单个会话行
 * Render a single session row
 */
function renderSessionRow(
  session: SessionRow,
  availableModels: AgentOverviewProps["availableModels"],
  defaultModel: { provider: string | null; model: string | null },
  onModelChange: (sessionKey: string, model: string | null) => void,
  onNavigate: (sessionKey: string) => void,
  onDelete?: (sessionKey: string) => void,
) {
  const displayName = session.displayName ?? session.label ?? session.key;
  const currentModel = session.model
    ? `${session.modelProvider ?? ""}/${session.model}`.replace(/^\//, "")
    : "";
  const defaultModelId = defaultModel.model
    ? `${defaultModel.provider ?? ""}/${defaultModel.model}`.replace(/^\//, "")
    : "";

  return html`
    <div class="session-row">
      <div class="session-row__key" title=${session.key}>
        <a
          class="session-row__link"
          href="javascript:void(0)"
          @click=${(e: Event) => {
            e.preventDefault();
            onNavigate(session.key);
          }}
        >${displayName}</a>
        ${session.kind !== "direct"
          ? html`<span class="session-row__kind">${session.kind}</span>`
          : nothing}
      </div>
      <div class="session-row__model">
        <select
          class="mc-select mc-select--sm"
          @change=${(e: Event) => {
            const value = (e.target as HTMLSelectElement).value;
            onModelChange(session.key, value || null);
          }}
        >
          <option value="" ?selected=${!currentModel}>${SESSION_LABELS.inheritDefault}${defaultModelId ? ` (${defaultModelId})` : ""}</option>
          ${availableModels.map(
            (m) => html`<option value=${m.id} ?selected=${m.id === currentModel}>${m.name} (${m.provider})</option>`,
          )}
        </select>
      </div>
      <div class="session-row__updated">
        ${session.updatedAt ? formatAgo(session.updatedAt) : "-"}
      </div>
      <div class="session-row__actions">
        <button
          class="mc-btn mc-btn--sm mc-btn--icon mc-btn--danger"
          title=${SESSION_LABELS.deleteTitle}
          @click=${() => onDelete?.(session.key)}
        >
          ${icons.trash}
        </button>
      </div>
    </div>
  `;
}

/**
 * 渲染新建会话模态框
 * Render create session modal
 */
function renderCreateSessionModal(props: AgentOverviewProps) {
  const {
    sessionCreateShow,
    sessionCreateName,
    sessionCreateModel,
    sessionCreating,
    availableModels,
    onSessionCreateShow,
    onSessionCreateNameChange,
    onSessionCreateModelChange,
    onSessionCreate,
  } = props;

  if (!sessionCreateShow) return nothing;

  const handleClose = () => onSessionCreateShow?.(false);
  const handleNameChange = (e: Event) => {
    onSessionCreateNameChange?.((e.target as HTMLInputElement).value);
  };
  const handleModelChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value;
    onSessionCreateModelChange?.(value || null);
  };
  const handleCreate = () => onSessionCreate?.();

  const canCreate = (sessionCreateName?.trim().length ?? 0) > 0 && !sessionCreating;

  return html`
    <div class="skills-modal-overlay" @click=${handleClose}>
      <div class="skills-modal skills-create-modal" @click=${(e: Event) => e.stopPropagation()}>
        <!-- 弹窗头部 -->
        <div class="skills-modal__header">
          <div class="skills-modal__title">
            <span class="skills-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </span>
            ${SESSION_LABELS.createTitle}
          </div>
          <button class="skills-modal__close" @click=${handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="skills-modal__body">
          <div class="skills-create__field">
            <label class="skills-create__label">${SESSION_LABELS.sessionNameLabel}</label>
            <input
              type="text"
              class="skills-create__input"
              .value=${sessionCreateName ?? ""}
              placeholder=${SESSION_LABELS.sessionNamePlaceholder}
              ?disabled=${sessionCreating}
              @input=${handleNameChange}
            />
            <div class="skills-create__hint">会话名称将用于标识此会话</div>
          </div>

          <div class="skills-create__field">
            <label class="skills-create__label">${SESSION_LABELS.sessionModelLabel}</label>
            <select
              class="skills-create__input"
              .value=${sessionCreateModel ?? ""}
              ?disabled=${sessionCreating}
              @change=${handleModelChange}
            >
              <option value="">${SESSION_LABELS.inheritDefault}</option>
              ${availableModels.map(
                (m) => html`<option value=${m.id} ?selected=${m.id === sessionCreateModel}>${m.name} (${m.provider})</option>`,
              )}
            </select>
            <div class="skills-create__hint">留空则使用 Agent 默认模型</div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="skills-modal__footer">
          <button class="mc-btn" @click=${handleClose} ?disabled=${sessionCreating}>
            ${SESSION_LABELS.cancel}
          </button>
          <button
            class="mc-btn primary"
            ?disabled=${!canCreate}
            @click=${handleCreate}
          >
            ${sessionCreating ? SESSION_LABELS.creating : SESSION_LABELS.confirm}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染会话列表区域
 * Render sessions list section
 */
function renderSessionsSection(props: AgentOverviewProps) {
  const {
    sessionsLoading,
    sessionsResult,
    sessionsError,
    availableModels,
    onSessionsRefresh,
    onSessionModelChange,
    onSessionNavigate,
    onSessionDelete,
    onSessionCreateShow,
  } = props;

  const sessions = sessionsResult?.sessions ?? [];
  const sessionsDefaults = sessionsResult?.defaults ?? { modelProvider: null, model: null };
  const defaults = { provider: sessionsDefaults.modelProvider, model: sessionsDefaults.model };

  const handleCreateClick = () => onSessionCreateShow?.(true);

  return html`
    <div class="mc-card" style="margin-top: 16px;">
      <div class="mc-card__header">
        <h4 class="mc-card__title">${SESSION_LABELS.title}</h4>
        <div class="mc-card__actions">
          <button
            class="mc-btn mc-btn--sm mc-btn--primary"
            ?disabled=${sessionsLoading}
            @click=${handleCreateClick}
            title=${SESSION_LABELS.create}
          >
            + ${SESSION_LABELS.create}
          </button>
          <button
            class="mc-btn mc-btn--sm"
            ?disabled=${sessionsLoading}
            @click=${onSessionsRefresh}
            title=${SESSION_LABELS.refresh}
          >
            ${icons.refresh}
            ${sessionsLoading ? SESSION_LABELS.loading : SESSION_LABELS.refresh}
          </button>
        </div>
      </div>
      <div class="mc-card__content">
        ${sessionsError
          ? html`<div class="mc-error">${sessionsError}</div>`
          : nothing}

        <div class="sessions-list">
          ${sessions.length > 0
            ? html`
                <div class="sessions-list__header">
                  <div class="sessions-list__col sessions-list__col--key">${SESSION_LABELS.sessionKey}</div>
                  <div class="sessions-list__col sessions-list__col--model">${SESSION_LABELS.sessionModel}</div>
                  <div class="sessions-list__col sessions-list__col--updated">${SESSION_LABELS.sessionUpdated}</div>
                  <div class="sessions-list__col sessions-list__col--actions">${SESSION_LABELS.sessionActions}</div>
                </div>
                <div class="sessions-list__body">
                  ${sessions.map((session) =>
                    renderSessionRow(session, availableModels, defaults, onSessionModelChange, onSessionNavigate, onSessionDelete),
                  )}
                </div>
              `
            : html`<div class="mc-empty">${sessionsLoading ? SESSION_LABELS.loading : SESSION_LABELS.noSessions}</div>`}
        </div>
      </div>
    </div>

    <!-- 新建会话模态框 / Create session modal -->
    ${renderCreateSessionModal(props)}
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 主渲染函数 / Main Render Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染 Agent 概览面板
 * Render agent overview panel
 */
export function renderAgentOverview(props: AgentOverviewProps) {
  const {
    agent,
    configForm,
    agentFilesList,
    agentIdentity,
    agentIdentityLoading,
    agentIdentityError,
    configLoading,
    configSaving,
    onModelChange,
    onModelFallbacksChange,
  } = props;

  const config = resolveAgentConfig(configForm, agent.id);
  const workspace = resolveWorkspace(config, agentFilesList, agent.id);
  const model = resolveModelLabel(config.entry?.model ?? config.defaults?.model);
  const modelPrimary = resolveModelPrimary(config.entry?.model);
  const defaultPrimary = resolveModelPrimary(config.defaults?.model);
  const effectivePrimary = modelPrimary ?? defaultPrimary ?? null;
  const modelFallbacks = resolveModelFallbacks(config.entry?.model);
  const fallbackText = modelFallbacks ? modelFallbacks.join(", ") : "";

  const identityName =
    agentIdentity?.name?.trim() ||
    agent.identity?.name?.trim() ||
    agent.name?.trim() ||
    config.entry?.name ||
    "-";
  const identityEmoji = resolveAgentEmoji(agent, agentIdentity) || "-";
  const skillFilter = Array.isArray(config.entry?.skills) ? config.entry?.skills : null;
  const skillCount = skillFilter?.length ?? null;
  const isDefault = Boolean(props.defaultId && agent.id === props.defaultId);
  const identityStatus = agentIdentityLoading ? LABELS.actions.loading : agentIdentityError ? "不可用" : "";

  return html`
    <div class="mc-section">
      <div class="mc-section__header">
        <div class="mc-section__titles">
          <h3 class="mc-section__title">${LABELS.overview.title}</h3>
          <p class="mc-section__desc">${LABELS.overview.desc}</p>
        </div>
      </div>

      <!-- 基本信息网格 / Basic info grid -->
      <div class="mc-card">
        <div class="mc-card__content">
          <div class="mc-grid mc-grid--3col">
            <div class="mc-kv">
              <span class="mc-kv__label">${LABELS.overview.workspace}</span>
              <span class="mc-kv__value mc-kv__value--mono">${workspace}</span>
            </div>
            <div class="mc-kv">
              <span class="mc-kv__label">${LABELS.overview.primaryModel}</span>
              <span class="mc-kv__value mc-kv__value--mono">${model}</span>
            </div>
            <div class="mc-kv">
              <span class="mc-kv__label">${LABELS.overview.identityName}</span>
              <span class="mc-kv__value">${identityName}</span>
              ${identityStatus ? html`<span class="mc-kv__sub">${identityStatus}</span>` : nothing}
            </div>
            <div class="mc-kv">
              <span class="mc-kv__label">${LABELS.overview.isDefault}</span>
              <span class="mc-kv__value">${isDefault ? "是" : "否"}</span>
            </div>
            <div class="mc-kv">
              <span class="mc-kv__label">${LABELS.overview.identityEmoji}</span>
              <span class="mc-kv__value">${identityEmoji}</span>
            </div>
            <div class="mc-kv">
              <span class="mc-kv__label">${LABELS.overview.skillsFilter}</span>
              <span class="mc-kv__value">${skillFilter ? `已选 ${skillCount} 个` : LABELS.overview.allSkills}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型选择区域 / Model selection area -->
      <div class="mc-card" style="margin-top: 16px;">
        <div class="mc-card__header">
          <h4 class="mc-card__title">${LABELS.overview.modelSelection}</h4>
        </div>
        <div class="mc-card__content">
          <div class="mc-form-row mc-form-row--2col">
            <label class="mc-field">
              <span class="mc-field__label">${LABELS.overview.primaryModel}</span>
              <select
                class="mc-select"
                .value=${effectivePrimary ?? ""}
                ?disabled=${!configForm || configLoading || configSaving}
                @change=${(e: Event) => onModelChange(agent.id, (e.target as HTMLSelectElement).value || null)}
              >
                <option value="">
                  ${defaultPrimary ? `${LABELS.overview.inheritDefault} (${defaultPrimary})` : LABELS.overview.inheritDefault}
                </option>
                ${buildModelOptions(configForm, effectivePrimary)}
              </select>
            </label>
            <label class="mc-field">
              <span class="mc-field__label">${LABELS.overview.fallbacks}</span>
              <input
                type="text"
                class="mc-input"
                .value=${fallbackText}
                placeholder="provider/model, provider/model"
                ?disabled=${!configForm || configLoading || configSaving}
                @input=${(e: Event) => onModelFallbacksChange(agent.id, parseFallbackList((e.target as HTMLInputElement).value))}
              />
            </label>
          </div>
        </div>
      </div>

      <!-- 会话管理区域 / Session management area -->
      ${renderSessionsSection(props)}
    </div>
  `;
}
