import { html, nothing } from "lit";

import type { GatewayBrowserClient, GatewayHelloOk } from "./gateway";
import type { AppViewState } from "./app-view-state";
import { parseAgentSessionKey } from "../../../src/routing/session-key.js";
import {
  TAB_GROUPS,
  iconForTab,
  pathForTab,
  subtitleForTab,
  titleForTab,
  type Tab,
} from "./navigation";
import { icons } from "./icons";
import type { UiSettings } from "./storage";
import type { ThemeMode } from "./theme";
import type { ThemeTransitionContext } from "./theme-transition";
import type {
  ConfigSnapshot,
  CronJob,
  CronRunLogEntry,
  CronStatus,
  HealthSnapshot,
  LogEntry,
  LogLevel,
  PresenceEntry,
  ChannelsStatusSnapshot,
  SessionsListResult,
  SkillStatusReport,
  StatusSummary,
} from "./types";
import type { ChatQueueItem, CronFormState } from "./ui-types";
import { DEFAULT_CRON_FORM } from "./app-defaults";
import { refreshChatAvatar } from "./app-chat";
import { renderChat } from "./views/chat";
import { renderConfig } from "./views/config";
import { renderChannels } from "./views/channels";
import { renderCron } from "./views/cron";
import { renderDebug } from "./views/debug";
import { renderInstances } from "./views/instances";
import { renderLogs } from "./views/logs";
import { renderNodes } from "./views/nodes";
import { renderOverview } from "./views/overview";
import { renderSessions } from "./views/sessions";
import { renderExecApprovalPrompt } from "./views/exec-approval";
import { renderGatewayUrlConfirmation } from "./views/gateway-url-confirmation";
import {
  approveDevicePairing,
  loadDevices,
  rejectDevicePairing,
  revokeDeviceToken,
  rotateDeviceToken,
} from "./controllers/devices";
import { renderSkills } from "./views/skills";
import { renderModelConfig } from "./changeoradd/views/model-config";
import {
  loadModelConfig,
  saveModelConfig,
  applyModelConfig,
  toggleProviderExpanded,
  addProvider,
  removeProvider,
  renameProvider,
  updateProviderField,
  addModel,
  removeModel,
  updateModelField,
  updateAgentDefaults,
  updateGatewayConfig,
  getAvailableModels,
  hasModelConfigChanges,
  setActiveSection,
  getPermissionsAgents,
  loadPermissions,
  savePermissions,
  selectPermissionsAgent,
  updatePermissionsFormValue,
  removePermissionsFormValue,
  addPermissionsAllowlistEntry,
  removePermissionsAllowlistEntry,
  addPermissionsAgent,
  removePermissionsAgent,
  setPermissionsActiveTab,
  // 目标选择
  resolveExecApprovalsNodes,
  // 工具权限
  getToolsAgents,
  selectToolsAgent,
  toggleToolsExpanded,
  updateGlobalToolsConfig,
  updateAgentToolsConfig,
  addGlobalToolsDenyEntry,
  removeGlobalToolsDenyEntry,
  addAgentToolsDenyEntry,
  removeAgentToolsDenyEntry,
  // 会话管理 / Session management
  loadAgentSessions,
  patchSessionModel,
  // 工作区文件 / Workspace files
  loadWorkspaceFiles,
  selectWorkspaceFile,
  saveWorkspaceFile,
  createWorkspaceFile,
  // 添加供应商弹窗 / Add provider modal
  showAddProviderModal,
  updateAddProviderForm,
  confirmAddProvider,
} from "./changeoradd/controllers/model-config";
import {
  loadSkillsStatus as loadSkillsConfig,
  saveSkillsConfig,
  updateSkillEnabled as updateSkillEnabledConfig,
  saveSkillApiKey as saveSkillApiKeyConfig,
  installSkillDependency,
  updateSkillsFilter,
  updateSkillsSourceFilter,
  updateSkillsStatusFilter,
  toggleSkillsGroup,
  selectSkill,
  updateSkillApiKeyEdit as updateSkillApiKeyEditConfig,
  setAllowlistMode,
  toggleAllowlistEntry,
  updateGlobalSetting,
  hasSkillsConfigChanges,
  // Phase 3: 环境变量和配置编辑
  updateSkillEnv as updateSkillEnvConfig,
  removeSkillEnv as removeSkillEnvConfig,
  updateSkillConfig as updateSkillConfigConfig,
  updateExtraDirs as updateExtraDirsConfig,
  // Phase 5-6: 技能编辑器操作
  openSkillEditor,
  closeSkillEditor,
  updateEditorContent,
  updateEditorMode,
  saveSkillFile,
  openCreateSkill,
  closeCreateSkill,
  updateCreateSkillName,
  updateCreateSkillSource,
  confirmCreateSkill,
  openDeleteSkill,
  closeDeleteSkill,
  confirmDeleteSkill,
} from "./changeoradd/controllers/skills-config";
import { renderChatControls, renderTab, renderThemeToggle } from "./app-render.helpers";
import { loadChannels } from "./controllers/channels";
import { loadPresence } from "./controllers/presence";
import { deleteSession, loadSessions, patchSession } from "./controllers/sessions";
import {
  installSkill,
  loadSkills,
  saveSkillApiKey,
  updateSkillEdit,
  updateSkillEnabled,
  type SkillMessage,
} from "./controllers/skills";
import { loadNodes } from "./controllers/nodes";
import { loadChatHistory } from "./controllers/chat";
import {
  applyConfig,
  loadConfig,
  runUpdate,
  saveConfig,
  updateConfigFormValue,
  removeConfigFormValue,
} from "./controllers/config";
import {
  loadExecApprovals,
  removeExecApprovalsFormValue,
  saveExecApprovals,
  updateExecApprovalsFormValue,
} from "./controllers/exec-approvals";
import { loadCronRuns, toggleCronJob, runCronJob, removeCronJob, addCronJob, updateCronJob } from "./controllers/cron";
import { loadDebug, callDebugMethod } from "./controllers/debug";
import { loadLogs } from "./controllers/logs";

const AVATAR_DATA_RE = /^data:/i;
const AVATAR_HTTP_RE = /^https?:\/\//i;

/**
 * 将 CronJob 转换为 CronFormState（用于编辑）
 */
function jobToFormState(job: CronJob): CronFormState {
  const schedule = job.schedule;
  let scheduleKind: "at" | "every" | "cron" = "every";
  let scheduleAt = "";
  let everyAmount = "30";
  let everyUnit: "minutes" | "hours" | "days" = "minutes";
  let cronExpr = "0 7 * * *";
  let cronTz = "";

  if (schedule.kind === "at") {
    scheduleKind = "at";
    scheduleAt = new Date(schedule.atMs).toISOString().slice(0, 16);
  } else if (schedule.kind === "every") {
    scheduleKind = "every";
    const ms = schedule.everyMs;
    if (ms % 86400000 === 0) {
      everyAmount = String(ms / 86400000);
      everyUnit = "days";
    } else if (ms % 3600000 === 0) {
      everyAmount = String(ms / 3600000);
      everyUnit = "hours";
    } else {
      everyAmount = String(ms / 60000);
      everyUnit = "minutes";
    }
  } else if (schedule.kind === "cron") {
    scheduleKind = "cron";
    cronExpr = schedule.expr;
    cronTz = schedule.tz ?? "";
  }

  const payload = job.payload;
  const payloadKind = payload.kind;
  const payloadText = payload.kind === "systemEvent" ? payload.text : payload.message;

  return {
    name: job.name,
    description: job.description ?? "",
    agentId: job.agentId ?? "",
    enabled: job.enabled,
    scheduleKind,
    scheduleAt,
    everyAmount,
    everyUnit,
    cronExpr,
    cronTz,
    sessionTarget: job.sessionTarget,
    wakeMode: job.wakeMode,
    payloadKind,
    payloadText,
    deliver: payload.kind === "agentTurn" ? (payload.deliver ?? false) : false,
    channel: payload.kind === "agentTurn" ? (payload.provider ?? "last") : "last",
    to: payload.kind === "agentTurn" ? (payload.to ?? "") : "",
    timeoutSeconds: payload.kind === "agentTurn" ? String(payload.timeoutSeconds ?? "") : "",
    postToMainPrefix: job.isolation?.postToMainPrefix ?? "",
  };
}

function resolveAssistantAvatarUrl(state: AppViewState): string | undefined {
  const list = state.agentsList?.agents ?? [];
  const parsed = parseAgentSessionKey(state.sessionKey);
  const agentId =
    parsed?.agentId ??
    state.agentsList?.defaultId ??
    "main";
  const agent = list.find((entry) => entry.id === agentId);
  const identity = agent?.identity;
  const candidate = identity?.avatarUrl ?? identity?.avatar;
  if (!candidate) return undefined;
  if (AVATAR_DATA_RE.test(candidate) || AVATAR_HTTP_RE.test(candidate)) return candidate;
  return identity?.avatarUrl;
}

// ─── 工作区文件处理器 / Workspace file handlers ──────────────────────────────

/**
 * 处理工作区文件选择
 * Handle workspace file selection
 */
function handleWorkspaceFileSelect(state: AppViewState, fileName: string): void {
  void selectWorkspaceFile(state as Parameters<typeof selectWorkspaceFile>[0], fileName);
}

/**
 * 处理工作区文件保存
 * Handle workspace file save
 */
function handleWorkspaceFileSave(state: AppViewState): void {
  void saveWorkspaceFile(state as Parameters<typeof saveWorkspaceFile>[0]);
}

/**
 * 处理工作区文件刷新
 * Handle workspace file refresh
 */
function handleWorkspaceRefresh(state: AppViewState): void {
  void loadWorkspaceFiles(state as Parameters<typeof loadWorkspaceFiles>[0]);
}

/**
 * 处理工作区 Agent 切换
 * Handle workspace agent change
 */
function handleWorkspaceAgentChange(state: AppViewState, agentId: string): void {
  state.workspaceAgentId = agentId;
  state.workspaceSelectedFile = null;
  state.workspaceEditorContent = "";
  state.workspaceOriginalContent = "";
  void loadWorkspaceFiles(state as Parameters<typeof loadWorkspaceFiles>[0]);
}

/**
 * 获取工作区可用的 Agent 列表
 * Get available agents for workspace
 */
function getWorkspaceAgents(state: AppViewState): Array<{ id: string; name?: string; default?: boolean }> {
  const agents = state.modelConfigAgentsList ?? [];
  if (agents.length === 0) {
    return [{ id: "main", name: "Main Agent", default: true }];
  }
  return agents.map((agent) => ({
    id: agent.id,
    name: agent.name ?? agent.identity?.name,
    default: agent.default,
  }));
}

/**
 * 处理工作区文件创建
 * Handle workspace file creation
 */
function handleWorkspaceFileCreate(state: AppViewState, fileName: string): void {
  createWorkspaceFile(state as Parameters<typeof createWorkspaceFile>[0], fileName);
}

export function renderApp(state: AppViewState) {
  const presenceCount = state.presenceEntries.length;
  const sessionsCount = state.sessionsResult?.count ?? null;
  const cronNext = state.cronStatus?.nextWakeAtMs ?? null;
  const chatDisabledReason = state.connected ? null : "Disconnected from gateway.";
  const isChat = state.tab === "chat";
  const chatFocus = isChat && (state.settings.chatFocusMode || state.onboarding);
  const showThinking = state.onboarding ? false : state.settings.chatShowThinking;
  const assistantAvatarUrl = resolveAssistantAvatarUrl(state);
  const chatAvatarUrl = state.chatAvatarUrl ?? assistantAvatarUrl ?? null;

  return html`
    <div class="shell ${isChat ? "shell--chat" : ""} ${chatFocus ? "shell--chat-focus" : ""} ${state.settings.navCollapsed ? "shell--nav-collapsed" : ""} ${state.onboarding ? "shell--onboarding" : ""}">
      <header class="topbar">
        <div class="topbar-left">
          <button
            class="nav-collapse-toggle"
            @click=${() =>
              state.applySettings({
                ...state.settings,
                navCollapsed: !state.settings.navCollapsed,
              })}
            title="${state.settings.navCollapsed ? "Expand sidebar" : "Collapse sidebar"}"
            aria-label="${state.settings.navCollapsed ? "Expand sidebar" : "Collapse sidebar"}"
          >
            <span class="nav-collapse-toggle__icon">${icons.menu}</span>
          </button>
          <div class="brand">
            <div class="brand-logo">
              <img src="https://mintcdn.com/clawhub/4rYvG-uuZrMK_URE/assets/pixel-lobster.svg?fit=max&auto=format&n=4rYvG-uuZrMK_URE&q=85&s=da2032e9eac3b5d9bfe7eb96ca6a8a26" alt="OpenClaw" />
            </div>
            <div class="brand-text">
              <div class="brand-title">OPENCLAW</div>
              <div class="brand-sub">Gateway Dashboard</div>
            </div>
          </div>
        </div>
        <div class="topbar-status">
          <div class="pill">
            <span class="statusDot ${state.connected ? "ok" : ""}"></span>
            <span>Health</span>
            <span class="mono">${state.connected ? "OK" : "Offline"}</span>
          </div>
          ${renderThemeToggle(state)}
        </div>
      </header>
      <aside class="nav ${state.settings.navCollapsed ? "nav--collapsed" : ""}">
        ${TAB_GROUPS.map((group) => {
          const isGroupCollapsed = state.settings.navGroupsCollapsed[group.label] ?? false;
          const hasActiveTab = group.tabs.some((tab) => tab === state.tab);
          return html`
            <div class="nav-group ${isGroupCollapsed && !hasActiveTab ? "nav-group--collapsed" : ""}">
              <button
                class="nav-label"
                @click=${() => {
                  const next = { ...state.settings.navGroupsCollapsed };
                  next[group.label] = !isGroupCollapsed;
                  state.applySettings({
                    ...state.settings,
                    navGroupsCollapsed: next,
                  });
                }}
                aria-expanded=${!isGroupCollapsed}
              >
                <span class="nav-label__text">${group.label}</span>
                <span class="nav-label__chevron">${isGroupCollapsed ? "+" : "−"}</span>
              </button>
              <div class="nav-group__items">
                ${group.tabs.map((tab) => renderTab(state, tab))}
              </div>
            </div>
          `;
        })}
        <div class="nav-group nav-group--links">
          <div class="nav-label nav-label--static">
            <span class="nav-label__text">Resources</span>
          </div>
          <div class="nav-group__items">
            <a
              class="nav-item nav-item--external"
              href="https://docs.openclaw.ai"
              target="_blank"
              rel="noreferrer"
              title="Docs (opens in new tab)"
            >
              <span class="nav-item__icon" aria-hidden="true">${icons.book}</span>
              <span class="nav-item__text">Docs</span>
            </a>
          </div>
        </div>
      </aside>
      <main class="content ${isChat ? "content--chat" : ""}">
        <section class="content-header">
          <div>
            <div class="page-title">${titleForTab(state.tab)}</div>
            <div class="page-sub">${subtitleForTab(state.tab)}</div>
          </div>
          <div class="page-meta">
            ${state.lastError
              ? html`<div class="pill danger">${state.lastError}</div>`
              : nothing}
            ${isChat ? renderChatControls(state) : nothing}
          </div>
        </section>

        ${state.tab === "overview"
          ? renderOverview({
              connected: state.connected,
              hello: state.hello,
              settings: state.settings,
              password: state.password,
              lastError: state.lastError,
              presenceCount,
              sessionsCount,
              cronEnabled: state.cronStatus?.enabled ?? null,
              cronNext,
              lastChannelsRefresh: state.channelsLastSuccess,
              onSettingsChange: (next) => state.applySettings(next),
              onPasswordChange: (next) => (state.password = next),
              onSessionKeyChange: (next) => {
                state.sessionKey = next;
                state.chatMessage = "";
                state.resetToolStream();
                state.applySettings({
                  ...state.settings,
                  sessionKey: next,
                  lastActiveSessionKey: next,
                });
                void state.loadAssistantIdentity();
              },
              onConnect: () => state.connect(),
              onRefresh: () => state.loadOverview(),
            })
          : nothing}

        ${state.tab === "channels"
          ? renderChannels({
              connected: state.connected,
              loading: state.channelsLoading,
              snapshot: state.channelsSnapshot,
              lastError: state.channelsError,
              lastSuccessAt: state.channelsLastSuccess,
              whatsappMessage: state.whatsappLoginMessage,
              whatsappQrDataUrl: state.whatsappLoginQrDataUrl,
              whatsappConnected: state.whatsappLoginConnected,
              whatsappBusy: state.whatsappBusy,
              configSchema: state.configSchema,
              configSchemaLoading: state.configSchemaLoading,
              configForm: state.configForm,
              configUiHints: state.configUiHints,
              configSaving: state.configSaving,
              configFormDirty: state.configFormDirty,
              nostrProfileFormState: state.nostrProfileFormState,
              nostrProfileAccountId: state.nostrProfileAccountId,
              onRefresh: (probe) => loadChannels(state, probe),
              onWhatsAppStart: (force) => state.handleWhatsAppStart(force),
              onWhatsAppWait: () => state.handleWhatsAppWait(),
              onWhatsAppLogout: () => state.handleWhatsAppLogout(),
              onConfigPatch: (path, value) => updateConfigFormValue(state, path, value),
              onConfigSave: () => state.handleChannelConfigSave(),
              onConfigReload: () => state.handleChannelConfigReload(),
              onNostrProfileEdit: (accountId, profile) =>
                state.handleNostrProfileEdit(accountId, profile),
              onNostrProfileCancel: () => state.handleNostrProfileCancel(),
              onNostrProfileFieldChange: (field, value) =>
                state.handleNostrProfileFieldChange(field, value),
              onNostrProfileSave: () => state.handleNostrProfileSave(),
              onNostrProfileImport: () => state.handleNostrProfileImport(),
              onNostrProfileToggleAdvanced: () => state.handleNostrProfileToggleAdvanced(),
            })
          : nothing}

        ${state.tab === "instances"
          ? renderInstances({
              loading: state.presenceLoading,
              entries: state.presenceEntries,
              lastError: state.presenceError,
              statusMessage: state.presenceStatus,
              onRefresh: () => loadPresence(state),
            })
          : nothing}

        ${state.tab === "sessions"
          ? renderSessions({
              loading: state.sessionsLoading,
              result: state.sessionsResult,
              error: state.sessionsError,
              activeMinutes: state.sessionsFilterActive,
              limit: state.sessionsFilterLimit,
              includeGlobal: state.sessionsIncludeGlobal,
              includeUnknown: state.sessionsIncludeUnknown,
              basePath: state.basePath,
              onFiltersChange: (next) => {
                state.sessionsFilterActive = next.activeMinutes;
                state.sessionsFilterLimit = next.limit;
                state.sessionsIncludeGlobal = next.includeGlobal;
                state.sessionsIncludeUnknown = next.includeUnknown;
	              },
	              onRefresh: () => loadSessions(state),
	              onPatch: (key, patch) => patchSession(state, key, patch),
	              onDelete: (key) => deleteSession(state, key),
	            })
	          : nothing}

        ${state.tab === "cron"
          ? renderCron({
              loading: state.cronLoading,
              status: state.cronStatus,
              jobs: state.cronJobs,
              error: state.cronError,
              busy: state.cronBusy,
              form: state.cronForm,
              channels: state.channelsSnapshot?.channelMeta?.length
                ? state.channelsSnapshot.channelMeta.map((entry) => entry.id)
                : state.channelsSnapshot?.channelOrder ?? [],
              channelLabels: state.channelsSnapshot?.channelLabels ?? {},
              channelMeta: state.channelsSnapshot?.channelMeta ?? [],
              runsJobId: state.cronRunsJobId,
              runs: state.cronRuns,
              onFormChange: (patch) => (state.cronForm = { ...state.cronForm, ...patch }),
              onRefresh: () => state.loadCron(),
              onAdd: () => addCronJob(state),
              onToggle: (job, enabled) => toggleCronJob(state, job, enabled),
              onRun: (job) => runCronJob(state, job),
              onRemove: (job) => removeCronJob(state, job),
              onLoadRuns: (jobId) => loadCronRuns(state, jobId),
            })
          : nothing}

        ${state.tab === "skills"
          ? renderSkills({
              loading: state.skillsLoading,
              report: state.skillsReport,
              error: state.skillsError,
              filter: state.skillsFilter,
              edits: state.skillEdits,
              messages: state.skillMessages,
              busyKey: state.skillsBusyKey,
              onFilterChange: (next) => (state.skillsFilter = next),
              onRefresh: () => loadSkills(state, { clearMessages: true }),
              onToggle: (key, enabled) => updateSkillEnabled(state, key, enabled),
              onEdit: (key, value) => updateSkillEdit(state, key, value),
              onSaveKey: (key) => saveSkillApiKey(state, key),
              onInstall: (skillKey, name, installId) =>
                installSkill(state, skillKey, name, installId),
            })
          : nothing}

        ${state.tab === "nodes"
          ? renderNodes({
              loading: state.nodesLoading,
              nodes: state.nodes,
              devicesLoading: state.devicesLoading,
              devicesError: state.devicesError,
              devicesList: state.devicesList,
              configForm: state.configForm ?? (state.configSnapshot?.config as Record<string, unknown> | null),
              configLoading: state.configLoading,
              configSaving: state.configSaving,
              configDirty: state.configFormDirty,
              configFormMode: state.configFormMode,
              execApprovalsLoading: state.execApprovalsLoading,
              execApprovalsSaving: state.execApprovalsSaving,
              execApprovalsDirty: state.execApprovalsDirty,
              execApprovalsSnapshot: state.execApprovalsSnapshot,
              execApprovalsForm: state.execApprovalsForm,
              execApprovalsSelectedAgent: state.execApprovalsSelectedAgent,
              execApprovalsTarget: state.execApprovalsTarget,
              execApprovalsTargetNodeId: state.execApprovalsTargetNodeId,
              onRefresh: () => loadNodes(state),
              onDevicesRefresh: () => loadDevices(state),
              onDeviceApprove: (requestId) => approveDevicePairing(state, requestId),
              onDeviceReject: (requestId) => rejectDevicePairing(state, requestId),
              onDeviceRotate: (deviceId, role, scopes) =>
                rotateDeviceToken(state, { deviceId, role, scopes }),
              onDeviceRevoke: (deviceId, role) =>
                revokeDeviceToken(state, { deviceId, role }),
              onLoadConfig: () => loadConfig(state),
              onLoadExecApprovals: () => {
                const target =
                  state.execApprovalsTarget === "node" && state.execApprovalsTargetNodeId
                    ? { kind: "node" as const, nodeId: state.execApprovalsTargetNodeId }
                    : { kind: "gateway" as const };
                return loadExecApprovals(state, target);
              },
              onBindDefault: (nodeId) => {
                if (nodeId) {
                  updateConfigFormValue(state, ["tools", "exec", "node"], nodeId);
                } else {
                  removeConfigFormValue(state, ["tools", "exec", "node"]);
                }
              },
              onBindAgent: (agentIndex, nodeId) => {
                const basePath = ["agents", "list", agentIndex, "tools", "exec", "node"];
                if (nodeId) {
                  updateConfigFormValue(state, basePath, nodeId);
                } else {
                  removeConfigFormValue(state, basePath);
                }
              },
              onSaveBindings: () => saveConfig(state),
              onExecApprovalsTargetChange: (kind, nodeId) => {
                state.execApprovalsTarget = kind;
                state.execApprovalsTargetNodeId = nodeId;
                state.execApprovalsSnapshot = null;
                state.execApprovalsForm = null;
                state.execApprovalsDirty = false;
                state.execApprovalsSelectedAgent = null;
              },
              onExecApprovalsSelectAgent: (agentId) => {
                state.execApprovalsSelectedAgent = agentId;
              },
              onExecApprovalsPatch: (path, value) =>
                updateExecApprovalsFormValue(state, path, value),
              onExecApprovalsRemove: (path) =>
                removeExecApprovalsFormValue(state, path),
              onSaveExecApprovals: () => {
                const target =
                  state.execApprovalsTarget === "node" && state.execApprovalsTargetNodeId
                    ? { kind: "node" as const, nodeId: state.execApprovalsTargetNodeId }
                    : { kind: "gateway" as const };
                return saveExecApprovals(state, target);
              },
            })
          : nothing}

        ${state.tab === "chat"
          ? renderChat({
              sessionKey: state.sessionKey,
              onSessionKeyChange: (next) => {
                state.sessionKey = next;
                state.chatMessage = "";
                state.chatAttachments = [];
                state.chatStream = null;
                state.chatStreamStartedAt = null;
                state.chatRunId = null;
                state.chatQueue = [];
                state.resetToolStream();
                state.resetChatScroll();
                state.applySettings({
                  ...state.settings,
                  sessionKey: next,
                  lastActiveSessionKey: next,
                });
                void state.loadAssistantIdentity();
                void loadChatHistory(state);
                void refreshChatAvatar(state);
              },
              thinkingLevel: state.chatThinkingLevel,
              showThinking,
              loading: state.chatLoading,
              sending: state.chatSending,
              compactionStatus: state.compactionStatus,
              assistantAvatarUrl: chatAvatarUrl,
              messages: state.chatMessages,
              toolMessages: state.chatToolMessages,
              stream: state.chatStream,
              streamStartedAt: state.chatStreamStartedAt,
              draft: state.chatMessage,
              queue: state.chatQueue,
              connected: state.connected,
              canSend: state.connected,
              disabledReason: chatDisabledReason,
              error: state.lastError,
              sessions: state.sessionsResult,
              focusMode: chatFocus,
              onRefresh: () => {
                state.resetToolStream();
                return Promise.all([loadChatHistory(state), refreshChatAvatar(state)]);
              },
              onToggleFocusMode: () => {
                if (state.onboarding) return;
                state.applySettings({
                  ...state.settings,
                  chatFocusMode: !state.settings.chatFocusMode,
                });
              },
              onChatScroll: (event) => state.handleChatScroll(event),
              onDraftChange: (next) => (state.chatMessage = next),
              attachments: state.chatAttachments,
              onAttachmentsChange: (next) => (state.chatAttachments = next),
              onSend: () => state.handleSendChat(),
              canAbort: Boolean(state.chatRunId),
              onAbort: () => void state.handleAbortChat(),
              onQueueRemove: (id) => state.removeQueuedMessage(id),
              onNewSession: () =>
                state.handleSendChat("/new", { restoreDraft: true }),
              // Sidebar props for tool output viewing
              sidebarOpen: state.sidebarOpen,
              sidebarContent: state.sidebarContent,
              sidebarError: state.sidebarError,
              splitRatio: state.splitRatio,
              onOpenSidebar: (content: string) => state.handleOpenSidebar(content),
              onCloseSidebar: () => state.handleCloseSidebar(),
              onSplitRatioChange: (ratio: number) => state.handleSplitRatioChange(ratio),
              assistantName: state.assistantName,
              assistantAvatar: state.assistantAvatar,
            })
          : nothing}

        ${state.tab === "model-config"
          ? renderModelConfig({
              loading: state.modelConfigLoading,
              saving: state.modelConfigSaving,
              applying: state.modelConfigApplying,
              connected: state.connected,
              hasChanges: hasModelConfigChanges(state),
              providers: state.modelConfigProviders,
              agentDefaults: state.modelConfigAgentDefaults,
              gatewayConfig: state.modelConfigGateway,
              availableModels: getAvailableModels(state.modelConfigProviders),
              channelsConfig: state.modelConfigChannelsConfig ?? {},
              selectedChannel: state.modelConfigSelectedChannel,
              expandedProviders: state.modelConfigExpandedProviders,
              activeSection: state.modelConfigActiveSection,
              // 会话管理相关状态
              agentSessionsLoading: state.agentSessionsLoading,
              agentSessionsResult: state.agentSessionsResult,
              agentSessionsError: state.agentSessionsError,
              onAgentSessionsRefresh: () => loadAgentSessions(state),
              onAgentSessionModelChange: (sessionKey, model) => patchSessionModel(state, sessionKey, model),
              onAgentSessionNavigate: (sessionKey) => {
                state.sessionKey = sessionKey;
                state.chatMessage = "";
                state.resetToolStream();
                state.applySettings({
                  ...state.settings,
                  sessionKey,
                  lastActiveSessionKey: sessionKey,
                });
                void state.loadAssistantIdentity();
                state.setTab("chat");
              },
              // 工作区文件相关 / Workspace file props
              workspaceFiles: state.workspaceFiles,
              workspaceDir: state.workspaceDir,
              workspaceAgentId: state.workspaceAgentId,
              workspaceAgents: getWorkspaceAgents(state),
              workspaceSelectedFile: state.workspaceSelectedFile,
              workspaceEditorContent: state.workspaceEditorContent,
              workspaceOriginalContent: state.workspaceOriginalContent,
              workspaceLoading: state.workspaceLoading,
              workspaceSaving: state.workspaceSaving,
              workspaceError: state.workspaceError,
              workspaceEditorMode: state.workspaceEditorMode,
              onWorkspaceFileSelect: (fileName) => handleWorkspaceFileSelect(state, fileName),
              onWorkspaceContentChange: (content) => { state.workspaceEditorContent = content; },
              onWorkspaceFileSave: () => handleWorkspaceFileSave(state),
              onWorkspaceRefresh: () => handleWorkspaceRefresh(state),
              onWorkspaceModeChange: (mode) => { state.workspaceEditorMode = mode; },
              onWorkspaceFileCreate: (fileName) => handleWorkspaceFileCreate(state, fileName),
              onWorkspaceAgentChange: (agentId) => handleWorkspaceAgentChange(state, agentId),
              expandedFolders: state.workspaceExpandedFolders,
              onFolderToggle: (folderName) => {
                const next = new Set(state.workspaceExpandedFolders);
                if (next.has(folderName)) {
                  next.delete(folderName);
                } else {
                  next.add(folderName);
                }
                state.workspaceExpandedFolders = next;
              },
              // 权限管理相关状态 / Permissions state
              permissionsLoading: state.permissionsLoading,
              permissionsSaving: state.permissionsSaving,
              permissionsDirty: state.permissionsDirty,
              execApprovalsSnapshot: state.execApprovalsSnapshot,
              execApprovalsForm: state.execApprovalsForm,
              permissionsSelectedAgent: state.permissionsSelectedAgent,
              permissionsAgents: getPermissionsAgents(state),
              // Exec Approvals 目标选择
              execTarget: state.execApprovalsTarget ?? "gateway",
              execTargetNodeId: state.execApprovalsTargetNodeId ?? null,
              execTargetNodes: resolveExecApprovalsNodes(state.nodes ?? []),
              onExecTargetChange: (target, nodeId) => {
                state.execApprovalsTarget = target;
                state.execApprovalsTargetNodeId = nodeId;
                state.execApprovalsSnapshot = null;
                state.execApprovalsForm = null;
                state.permissionsDirty = false;
                state.permissionsSelectedAgent = null;
                // 自动加载新目标的权限配置
                const loadTarget = target === "node" && nodeId
                  ? { kind: "node" as const, nodeId }
                  : { kind: "gateway" as const };
                void loadPermissions(state, loadTarget);
              },
              onReload: () => loadModelConfig(state),
              onSave: () => saveModelConfig(state),
              onApply: () => applyModelConfig(state),
              onSectionChange: (sectionId) => {
                setActiveSection(state, sectionId);
                // 自动加载工作区文件 / Auto-load workspace files
                if (sectionId === "workspace" && state.workspaceFiles.length === 0) {
                  void loadWorkspaceFiles(state as Parameters<typeof loadWorkspaceFiles>[0]);
                }
                // 自动加载技能数据 / Auto-load skills data
                if (sectionId === "skills" && !state.skillsConfigReport) {
                  void loadSkillsConfig(state as Parameters<typeof loadSkillsConfig>[0]);
                }
                // 自动加载定时任务数据 / Auto-load cron data
                if (sectionId === "cron" && state.cronJobs.length === 0 && !state.cronLoading) {
                  void state.loadCron();
                }
              },
              onProviderToggle: (key) => toggleProviderExpanded(state, key),
              onProviderAdd: () => addProvider(state),
              // 添加供应商弹窗 / Add provider modal
              showAddProviderModal: state.addProviderModalShow,
              addProviderForm: state.addProviderForm,
              addProviderError: state.addProviderError,
              onShowAddProviderModal: (show) => showAddProviderModal(state, show),
              onAddProviderFormChange: (patch) => updateAddProviderForm(state, patch),
              onAddProviderConfirm: () => confirmAddProvider(state),
              onProviderRemove: (key) => removeProvider(state, key),
              onProviderRename: (oldKey, newKey) => renameProvider(state, oldKey, newKey),
              onProviderUpdate: (key, field, value) =>
                updateProviderField(state, key, field, value),
              onModelAdd: (providerKey) => addModel(state, providerKey),
              onModelRemove: (providerKey, modelIndex) =>
                removeModel(state, providerKey, modelIndex),
              onModelUpdate: (providerKey, modelIndex, field, value) =>
                updateModelField(state, providerKey, modelIndex, field, value),
              onAgentDefaultsUpdate: (path, value) =>
                updateAgentDefaults(state, path, value),
              onGatewayUpdate: (path, value) =>
                updateGatewayConfig(state, path, value),
              onNavigateToChannels: () => state.setTab("channels"),
              onChannelSelect: (channelId) => {
                state.modelConfigSelectedChannel = channelId;
              },
              onChannelConfigUpdate: (channelId, field, value) => {
                const current = state.modelConfigChannelsConfig ?? {};
                const channelConfig = JSON.parse(JSON.stringify(current[channelId] ?? {})) as Record<string, unknown>;

                // 支持嵌套路径，如 "polling.pollingIntervalMs"
                const parts = field.split(".");
                if (parts.length === 1) {
                  channelConfig[field] = value;
                } else {
                  let target = channelConfig;
                  for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];
                    if (!target[part] || typeof target[part] !== "object") {
                      target[part] = {};
                    }
                    target = target[part] as Record<string, unknown>;
                  }
                  target[parts[parts.length - 1]] = value;
                }

                state.modelConfigChannelsConfig = {
                  ...current,
                  [channelId]: channelConfig,
                };
              },
              // 权限管理回调
              permissionsActiveTab: state.permissionsActiveTab ?? "exec",
              onPermissionsTabChange: (tab) => { state.permissionsActiveTab = tab; },
              onPermissionsLoad: () => {
                const target = state.execApprovalsTarget === "node" && state.execApprovalsTargetNodeId
                  ? { kind: "node" as const, nodeId: state.execApprovalsTargetNodeId }
                  : { kind: "gateway" as const };
                return loadPermissions(state, target);
              },
              onPermissionsSave: () => {
                const target = state.execApprovalsTarget === "node" && state.execApprovalsTargetNodeId
                  ? { kind: "node" as const, nodeId: state.execApprovalsTargetNodeId }
                  : { kind: "gateway" as const };
                return savePermissions(state, target);
              },
              onPermissionsSelectAgent: (agentId) => selectPermissionsAgent(state, agentId),
              onPermissionsPatch: (path, value) => updatePermissionsFormValue(state, path, value),
              onPermissionsRemove: (path) => removePermissionsFormValue(state, path),
              onPermissionsAddAllowlistEntry: (agentId) => addPermissionsAllowlistEntry(state, agentId),
              onPermissionsRemoveAllowlistEntry: (agentId, index) => removePermissionsAllowlistEntry(state, agentId, index),
              onPermissionsAddAgent: (agentId) => addPermissionsAgent(state, agentId),
              onPermissionsRemoveAgent: (agentId) => removePermissionsAgent(state, agentId),
              // 工具权限相关状态
              toolsConfig: state.toolsConfig,
              agentToolsConfigs: state.agentToolsConfigs,
              toolsAgents: getToolsAgents(state),
              toolsSelectedAgent: state.toolsSelectedAgent,
              toolsExpanded: state.toolsExpanded,
              // 工具权限回调
              onToolsSelectAgent: (agentId) => selectToolsAgent(state, agentId),
              onToolsToggleExpanded: () => toggleToolsExpanded(state),
              onToolsUpdateGlobal: (field, value) => updateGlobalToolsConfig(state, field, value),
              onToolsUpdateAgent: (agentId, field, value) => updateAgentToolsConfig(state, agentId, field, value),
              onToolsAddGlobalDeny: (entry) => addGlobalToolsDenyEntry(state, entry),
              onToolsRemoveGlobalDeny: (entry) => removeGlobalToolsDenyEntry(state, entry),
              onToolsAddAgentDeny: (agentId, entry) => addAgentToolsDenyEntry(state, agentId, entry),
              onToolsRemoveAgentDeny: (agentId, entry) => removeAgentToolsDenyEntry(state, agentId, entry),
              onToolsToggleDeny: (tool, denied) => {
                if (denied) {
                  addGlobalToolsDenyEntry(state, tool);
                } else {
                  removeGlobalToolsDenyEntry(state, tool);
                }
              },
              // 技能管理相关状态 / Skills management props
              skillsLoading: state.skillsConfigLoading,
              skillsSaving: state.skillsConfigSaving,
              skillsError: state.skillsConfigError,
              skillsReport: state.skillsConfigReport,
              skillsConfig: state.skillsConfig,
              skillsHasChanges: hasSkillsConfigChanges(state as Parameters<typeof hasSkillsConfigChanges>[0]),
              skillsFilter: state.skillsConfigFilter,
              skillsSourceFilter: state.skillsConfigSourceFilter,
              skillsStatusFilter: state.skillsConfigStatusFilter,
              skillsExpandedGroups: state.skillsConfigExpandedGroups,
              skillsSelectedSkill: state.skillsConfigSelectedSkill,
              skillsBusySkill: state.skillsConfigBusySkill,
              skillsMessages: state.skillsConfigMessages,
              skillsAllowlistMode: state.skillsConfigAllowlistMode,
              skillsAllowlistDraft: state.skillsConfigAllowlistDraft,
              skillsEdits: state.skillsConfigEdits,
              // 技能管理回调 / Skills management callbacks
              onSkillsRefresh: () => loadSkillsConfig(state as Parameters<typeof loadSkillsConfig>[0]),
              onSkillsSave: () => saveSkillsConfig(state as Parameters<typeof saveSkillsConfig>[0]),
              onSkillsFilterChange: (filter) => { state.skillsConfigFilter = filter; },
              onSkillsSourceFilterChange: (source) => { state.skillsConfigSourceFilter = source; },
              onSkillsStatusFilterChange: (status) => { state.skillsConfigStatusFilter = status; },
              onSkillsGroupToggle: (group) => toggleSkillsGroup(state as Parameters<typeof toggleSkillsGroup>[0], group),
              onSkillsSkillSelect: (skillKey) => { state.skillsConfigSelectedSkill = skillKey; },
              onSkillsSkillToggle: (skillKey, enabled) => updateSkillEnabledConfig(state as Parameters<typeof updateSkillEnabledConfig>[0], skillKey, enabled),
              onSkillsApiKeyChange: (skillKey, apiKey) => updateSkillApiKeyEditConfig(state as Parameters<typeof updateSkillApiKeyEditConfig>[0], skillKey, apiKey),
              onSkillsApiKeySave: (skillKey) => saveSkillApiKeyConfig(state as Parameters<typeof saveSkillApiKeyConfig>[0], skillKey),
              onSkillsAllowlistModeChange: (mode) => setAllowlistMode(state as Parameters<typeof setAllowlistMode>[0], mode),
              onSkillsAllowlistToggle: (skillKey, inList) => toggleAllowlistEntry(state as Parameters<typeof toggleAllowlistEntry>[0], skillKey, inList),
              onSkillsInstall: (skillKey, name, installId) => installSkillDependency(state as Parameters<typeof installSkillDependency>[0], skillKey, name, installId),
              onSkillsGlobalSettingChange: (field, value) => updateGlobalSetting(state as Parameters<typeof updateGlobalSetting>[0], field, value),
              // Phase 3: 环境变量和配置编辑
              onSkillsEnvChange: (skillKey, envKey, value) => updateSkillEnvConfig(state as Parameters<typeof updateSkillEnvConfig>[0], skillKey, envKey, value),
              onSkillsEnvRemove: (skillKey, envKey) => removeSkillEnvConfig(state as Parameters<typeof removeSkillEnvConfig>[0], skillKey, envKey),
              onSkillsConfigChange: (skillKey, config) => updateSkillConfigConfig(state as Parameters<typeof updateSkillConfigConfig>[0], skillKey, config),
              onSkillsExtraDirsChange: (dirs) => updateExtraDirsConfig(state as Parameters<typeof updateExtraDirsConfig>[0], dirs),
              // Phase 5-6: 编辑器状态和回调
              skillsEditorState: state.skillsConfigEditor,
              skillsCreateState: state.skillsConfigCreate,
              skillsDeleteState: state.skillsConfigDelete,
              onSkillsEditorOpen: (skillKey, skillName, source) => openSkillEditor(state as Parameters<typeof openSkillEditor>[0], skillKey, skillName, source),
              onSkillsEditorClose: () => closeSkillEditor(state as Parameters<typeof closeSkillEditor>[0]),
              onSkillsEditorContentChange: (content) => updateEditorContent(state as Parameters<typeof updateEditorContent>[0], content),
              onSkillsEditorModeChange: (mode) => updateEditorMode(state as Parameters<typeof updateEditorMode>[0], mode),
              onSkillsEditorSave: () => saveSkillFile(state as Parameters<typeof saveSkillFile>[0]),
              onSkillsCreateOpen: (source) => openCreateSkill(state as Parameters<typeof openCreateSkill>[0], source),
              onSkillsCreateClose: () => closeCreateSkill(state as Parameters<typeof closeCreateSkill>[0]),
              onSkillsCreateNameChange: (name) => updateCreateSkillName(state as Parameters<typeof updateCreateSkillName>[0], name),
              onSkillsCreateSourceChange: (source) => updateCreateSkillSource(state as Parameters<typeof updateCreateSkillSource>[0], source),
              onSkillsCreateConfirm: () => confirmCreateSkill(state as Parameters<typeof confirmCreateSkill>[0]),
              onSkillsDeleteOpen: (skillKey, skillName, source) => openDeleteSkill(state as Parameters<typeof openDeleteSkill>[0], skillKey, skillName, source),
              onSkillsDeleteClose: () => closeDeleteSkill(state as Parameters<typeof closeDeleteSkill>[0]),
              onSkillsDeleteConfirm: () => confirmDeleteSkill(state as Parameters<typeof confirmDeleteSkill>[0]),
              // 定时任务状态 / Cron state props
              cronLoading: state.cronLoading,
              cronBusy: state.cronBusy,
              cronError: state.cronError,
              cronStatus: state.cronStatus,
              cronJobs: state.cronJobs,
              cronForm: state.cronForm,
              cronAgents: (state.agentsList?.agents ?? []) as import("./types").GatewayAgentRow[],
              cronDefaultAgentId: state.agentsList?.defaultId ?? "",
              cronChannels: state.channelsSnapshot?.channelMeta?.length
                ? state.channelsSnapshot.channelMeta.map((entry) => entry.id)
                : state.channelsSnapshot?.channelOrder ?? [],
              cronChannelLabels: state.channelsSnapshot?.channelLabels ?? {},
              cronChannelMeta: state.channelsSnapshot?.channelMeta ?? [],
              cronRunsJobId: state.cronRunsJobId,
              cronRuns: state.cronRuns,
              cronExpandedJobId: state.cronExpandedJobId,
              cronDeleteConfirmJobId: state.cronDeleteConfirmJobId,
              cronShowCreateModal: state.cronShowCreateModal,
              cronEditJobId: state.cronEditJobId,
              // 定时任务回调 / Cron callbacks
              onCronFormChange: (patch) => { state.cronForm = { ...state.cronForm, ...patch }; },
              onCronRefresh: () => state.loadCron(),
              onCronAdd: () => addCronJob(state),
              onCronUpdate: () => {
                if (state.cronEditJobId) {
                  void updateCronJob(state, state.cronEditJobId);
                }
              },
              onCronToggle: (job, enabled) => toggleCronJob(state, job, enabled),
              onCronRun: (job) => runCronJob(state, job),
              onCronRemove: (job) => removeCronJob(state, job),
              onCronLoadRuns: (jobId) => loadCronRuns(state, jobId),
              onCronExpandJob: (jobId) => { state.cronExpandedJobId = jobId; },
              onCronDeleteConfirm: (jobId) => { state.cronDeleteConfirmJobId = jobId; },
              onCronShowCreateModal: (show) => {
                state.cronShowCreateModal = show;
                if (show) {
                  // 打开新建模式时，重置表单和编辑状态
                  state.cronEditJobId = null;
                  state.cronForm = { ...DEFAULT_CRON_FORM };
                } else {
                  state.cronEditJobId = null;
                }
              },
              onCronEdit: (job) => {
                // 填充表单数据
                state.cronForm = jobToFormState(job);
                state.cronEditJobId = job.id;
                state.cronShowCreateModal = true;
              },
            })
          : nothing}

        ${state.tab === "config"
          ? renderConfig({
              raw: state.configRaw,
              originalRaw: state.configRawOriginal,
              valid: state.configValid,
              issues: state.configIssues,
              loading: state.configLoading,
              saving: state.configSaving,
              applying: state.configApplying,
              updating: state.updateRunning,
              connected: state.connected,
              schema: state.configSchema,
              schemaLoading: state.configSchemaLoading,
              uiHints: state.configUiHints,
              formMode: state.configFormMode,
              formValue: state.configForm,
              originalValue: state.configFormOriginal,
              searchQuery: state.configSearchQuery,
              activeSection: state.configActiveSection,
              activeSubsection: state.configActiveSubsection,
              onRawChange: (next) => {
                state.configRaw = next;
              },
              onFormModeChange: (mode) => (state.configFormMode = mode),
              onFormPatch: (path, value) => updateConfigFormValue(state, path, value),
              onSearchChange: (query) => (state.configSearchQuery = query),
              onSectionChange: (section) => {
                state.configActiveSection = section;
                state.configActiveSubsection = null;
              },
              onSubsectionChange: (section) => (state.configActiveSubsection = section),
              onReload: () => loadConfig(state),
              onSave: () => saveConfig(state),
              onApply: () => applyConfig(state),
              onUpdate: () => runUpdate(state),
            })
          : nothing}

        ${state.tab === "debug"
          ? renderDebug({
              loading: state.debugLoading,
              status: state.debugStatus,
              health: state.debugHealth,
              models: state.debugModels,
              heartbeat: state.debugHeartbeat,
              eventLog: state.eventLog,
              callMethod: state.debugCallMethod,
              callParams: state.debugCallParams,
              callResult: state.debugCallResult,
              callError: state.debugCallError,
              onCallMethodChange: (next) => (state.debugCallMethod = next),
              onCallParamsChange: (next) => (state.debugCallParams = next),
              onRefresh: () => loadDebug(state),
              onCall: () => callDebugMethod(state),
            })
          : nothing}

        ${state.tab === "logs"
          ? renderLogs({
              loading: state.logsLoading,
              error: state.logsError,
              file: state.logsFile,
              entries: state.logsEntries,
              filterText: state.logsFilterText,
              levelFilters: state.logsLevelFilters,
              autoFollow: state.logsAutoFollow,
              truncated: state.logsTruncated,
              onFilterTextChange: (next) => (state.logsFilterText = next),
              onLevelToggle: (level, enabled) => {
                state.logsLevelFilters = { ...state.logsLevelFilters, [level]: enabled };
              },
              onToggleAutoFollow: (next) => (state.logsAutoFollow = next),
              onRefresh: () => loadLogs(state, { reset: true }),
              onExport: (lines, label) => state.exportLogs(lines, label),
              onScroll: (event) => state.handleLogsScroll(event),
            })
          : nothing}
      </main>
      ${renderExecApprovalPrompt(state)}
      ${renderGatewayUrlConfirmation(state)}
    </div>
  `;
}
