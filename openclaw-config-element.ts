/**
 * OpenClaw 配置页面 Web Component
 * 自包含组件，只需传入 client 和 connected
 *
 * 使用方式：
 * <openclaw-config-zh
 *   .client=${gatewayClient}
 *   .connected=${isConnected}
 * ></openclaw-config-zh>
 */

import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { GatewayBrowserClient } from "../ui/gateway";
import type {
  AgentsListResult,
  AgentIdentityResult,
  CronJob,
  GatewayAgentRow,
} from "../ui/types";
import type { WorkspaceFileInfo } from "./controllers/model-config";
import { renderAgentsConfig, type AgentsConfigProps } from "./views/agents-config";
import type { AgentPanel, GlobalPanel } from "./types/agents-config";

// 导入 Cron 控制器
import {
  loadCronJobs,
  addCronJob,
  updateCronJob,
  toggleCronJob,
  runCronJob,
  removeCronJob,
  loadCronRuns,
  populateCronFormFromJob,
  createInitialCronState,
  DEFAULT_CRON_FORM,
  type CronConfigState,
} from "./controllers/cron-config";

// 导入控制器函数和类型
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
  updateAgentModel,
  updateAgentModelFallbacks,
  getAvailableModels,
  hasModelConfigChanges,
  loadPermissions,
  savePermissions,
  toggleToolsExpanded,
  updateGlobalToolsConfig,
  updateAgentToolsConfig,
  addGlobalToolsDenyEntry,
  removeGlobalToolsDenyEntry,
  addAgentToolsDenyEntry,
  removeAgentToolsDenyEntry,
  loadAgentSessions,
  patchSessionModel,
  createSession,
  deleteSession,
  loadWorkspaceFiles,
  selectWorkspaceFile,
  saveWorkspaceFile,
  createWorkspaceFile,
  showAddProviderModal,
  updateAddProviderForm,
  confirmAddProvider,
  setDefaultAgent,
  createInitialModelConfigState,
  type ModelConfigState,
} from "./controllers/model-config";

import {
  loadSkillsStatus,
  saveSkillsConfig,
  updateSkillEnabled,
  saveSkillApiKey,
  installSkillDependency,
  toggleSkillsGroup,
  setAllowlistMode,
  toggleAllowlistEntry,
  updateGlobalSetting,
  hasSkillsConfigChanges,
  updateSkillEnv,
  removeSkillEnv,
  updateSkillConfig,
  updateExtraDirs,
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
  openSkillPreview,
  closeSkillPreview,
  updateSkillApiKeyEdit,
  createInitialSkillsConfigState,
  type SkillsConfigState,
} from "./controllers/skills-config";

// 内部状态类型 - 合并 ModelConfigState, SkillsConfigState 和 CronConfigState
type InternalState = ModelConfigState & SkillsConfigState & CronConfigState & {
  // Agent 列表
  agentsList: AgentsListResult | null;
  agentsLoading: boolean;
  agentsError: string | null;

  // UI 状态
  selectedAgentId: string | null;
  activePanel: AgentPanel;
  globalPanel: GlobalPanel | null;

  // Agent Identity 状态
  agentIdentityLoading: boolean;
  agentIdentityError: string | null;
  agentIdentityById: Record<string, AgentIdentityResult>;

  // 文件编辑器状态
  filesEditorMode: "edit" | "preview" | "split";
  filesExpandedFolders: Set<string>;
  filesMobileView: "list" | "editor";

  // 新建会话状态
  sessionCreateShow: boolean;
  sessionCreateName: string;
  sessionCreateModel: string | null;
  sessionCreating: boolean;
};

@customElement("openclaw-config-zh")
export class OpenClawConfigElement extends LitElement {
  // 禁用 Shadow DOM，使用 Light DOM 以便全局样式生效
  override createRenderRoot() {
    return this;
  }

  // ============================================
  // 外部属性 / External Properties
  // ============================================

  @property({ attribute: false })
  client: GatewayBrowserClient | null = null;

  @property({ type: Boolean })
  connected = false;

  // ============================================
  // 内部状态 / Internal State
  // ============================================

  @state()
  private _state: InternalState = this._createInitialState();

  private _createInitialState(): InternalState {
    const modelState = createInitialModelConfigState();
    const skillsState = createInitialSkillsConfigState();
    const cronState = createInitialCronState();

    return {
      ...modelState,
      ...skillsState,
      ...cronState,

      // Agent 列表
      agentsList: null,
      agentsLoading: false,
      agentsError: null,

      // UI 状态
      selectedAgentId: null,
      activePanel: "overview",
      globalPanel: null,

      // Agent Identity
      agentIdentityLoading: false,
      agentIdentityError: null,
      agentIdentityById: {},

      // 文件编辑器
      filesEditorMode: "edit",
      filesExpandedFolders: new Set(),
      filesMobileView: "list",

      // 新建会话
      sessionCreateShow: false,
      sessionCreateName: "",
      sessionCreateModel: null,
      sessionCreating: false,
    } as InternalState;
  }

  // ============================================
  // 生命周期 / Lifecycle
  // ============================================

  private _isLoadingInitialData = false;

  override connectedCallback() {
    super.connectedCallback();
    this._syncClientState();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("client") || changedProperties.has("connected")) {
      this._syncClientState();
    }
  }

  private _syncClientState() {
    const wasConnected = this._state.connected;
    this._state.client = this.client;
    this._state.connected = this.connected;

    // 首次连接时加载数据
    if (this.connected && this.client && !this._state.agentsList) {
      this._loadInitialData();
    }

    // 重新连接时刷新数据
    if (this.connected && this.client && !wasConnected && this._state.agentsList) {
      this._loadInitialData();
    }

    this.requestUpdate();
  }

  // ============================================
  // 数据加载 / Data Loading
  // ============================================

  private async _loadInitialData() {
    if (!this.client || !this.connected) return;
    if (this._isLoadingInitialData) return; // 防止重复加载

    this._isLoadingInitialData = true;
    this._state.agentsLoading = true;
    this._state.agentsError = null;
    this.requestUpdate();

    try {
      // 加载 agents 列表
      const agentsRes = await this.client.request<AgentsListResult>("agents.list", {});
      this._state.agentsList = agentsRes;

      // 设置默认选中的 Agent
      const defaultAgentId = agentsRes?.defaultId ?? agentsRes?.agents?.[0]?.id;
      if (!this._state.selectedAgentId && defaultAgentId) {
        this._state.selectedAgentId = defaultAgentId;
      }

      // 并行加载模型配置、Agent Identity 和 Channels 状态
      const agentIds = (agentsRes?.agents ?? []).map((a: GatewayAgentRow) => a.id);
      await Promise.all([
        loadModelConfig(this._state),
        this._loadAgentIdentities(agentIds),
        this._loadChannelsStatus(),
      ]);

      // 加载默认 Agent 的会话数据
      if (this._state.selectedAgentId) {
        await loadAgentSessions(this._state, this._state.selectedAgentId);
      }
    } catch (err) {
      this._state.agentsError = `加载失败: ${String(err)}`;
    } finally {
      this._isLoadingInitialData = false;
      this._state.agentsLoading = false;
      this.requestUpdate();
    }
  }

  private async _loadAgentIdentity(agentId: string) {
    if (!this.client || !this.connected) return;
    if (this._state.agentIdentityById[agentId]) return; // 已缓存

    this._state.agentIdentityLoading = true;
    this._state.agentIdentityError = null;

    try {
      const res = await this.client.request<AgentIdentityResult>("agent.identity.get", { agentId });
      if (res) {
        this._state.agentIdentityById = {
          ...this._state.agentIdentityById,
          [agentId]: res,
        };
      }
    } catch (err) {
      this._state.agentIdentityError = String(err);
    } finally {
      this._state.agentIdentityLoading = false;
      this.requestUpdate();
    }
  }

  private async _loadAgentIdentities(agentIds: string[]) {
    if (!this.client || !this.connected) return;

    const missing = agentIds.filter((id) => !this._state.agentIdentityById[id]);
    if (missing.length === 0) return;

    this._state.agentIdentityLoading = true;
    this._state.agentIdentityError = null;

    try {
      for (const agentId of missing) {
        const res = await this.client.request<any>("agent.identity.get", { agentId });
        if (res) {
          this._state.agentIdentityById = {
            ...this._state.agentIdentityById,
            [agentId]: res,
          };
        }
      }
    } catch (err) {
      this._state.agentIdentityError = String(err);
    } finally {
      this._state.agentIdentityLoading = false;
      this.requestUpdate();
    }
  }

  private async _loadChannelsStatus() {
    if (!this.client || !this.connected) return;

    try {
      const res = await this.client.request<{
        channelOrder?: string[];
        channelLabels?: Record<string, string>;
        channelMeta?: Array<{ id: string; label: string; detailLabel: string; systemImage?: string }>;
      }>("channels.status", { probe: false, timeoutMs: 8000 });

      if (res) {
        // 更新 cronChannelMeta
        this._state.cronChannelMeta = res.channelMeta ?? [];
        // 如果 modelConfigChannelsConfig 为空，使用 channels.status 的数据
        if (!this._state.modelConfigChannelsConfig && res.channelOrder) {
          this._state.cronChannels = res.channelOrder;
          this._state.cronChannelLabels = res.channelLabels ?? {};
        }
      }
    } catch (err) {
      // 静默失败，channelMeta 是可选的
      console.warn("加载 channels 状态失败:", err);
    }
  }

  private async _loadCron() {
    await loadCronJobs(this._state);
    this.requestUpdate();
  }

  // ============================================
  // 渲染 / Render
  // ============================================

  override render() {
    const { agentsLoading, agentsError, agentsList } = this._state;

    // 未连接状态
    if (!this.connected) {
      return html`
        <div class="agents-layout agents-layout--disconnected">
          <div class="mc-status-card">
            <div class="mc-status-card__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3 class="mc-status-card__title">等待连接</h3>
            <p class="mc-status-card__desc">正在连接到 Gateway，请稍候...</p>
            <div class="mc-status-card__spinner"></div>
          </div>
        </div>
      `;
    }

    // 错误状态
    if (agentsError && !agentsList) {
      return html`
        <div class="agents-layout agents-layout--error">
          <div class="mc-status-card mc-status-card--error">
            <div class="mc-status-card__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 class="mc-status-card__title">连接失败</h3>
            <p class="mc-status-card__desc">${agentsError}</p>
            <button class="mc-btn mc-btn--primary" @click=${() => this._loadInitialData()}>
              重试
            </button>
          </div>
        </div>
      `;
    }

    // 加载状态
    if (agentsLoading && !agentsList) {
      return html`
        <div class="agents-layout agents-layout--loading">
          <div class="mc-status-card">
            <div class="mc-status-card__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            </div>
            <h3 class="mc-status-card__title">加载中</h3>
            <p class="mc-status-card__desc">正在加载配置数据...</p>
            <div class="mc-status-card__spinner"></div>
          </div>
        </div>
      `;
    }

    // 构建 props 并渲染
    const props = this._buildProps();
    return renderAgentsConfig(props);
  }

  // ============================================
  // Props 构建 / Props Building
  // ============================================

  private _buildProps(): AgentsConfigProps {
    const s = this._state;
    const update = () => this.requestUpdate();

    return {
      loading: s.agentsLoading || s.modelConfigLoading,
      error: s.agentsError || s.lastError,
      agentsList: s.agentsList,
      defaultAgentId: s.agentsList?.defaultId ?? null,
      selectedAgentId: s.selectedAgentId,
      activePanel: s.activePanel,
      globalPanel: s.globalPanel,

      // 配置状态
      configForm: s.modelConfigFullSnapshot as any,
      configLoading: s.modelConfigLoading,
      configSaving: s.modelConfigSaving,
      configApplying: s.modelConfigApplying,
      configDirty: hasModelConfigChanges(s),
      connected: this.connected,

      // Agent Identity
      agentIdentity: s.selectedAgentId ? s.agentIdentityById[s.selectedAgentId] ?? null : null,
      agentIdentityLoading: s.agentIdentityLoading,
      agentIdentityError: s.agentIdentityError,
      agentIdentityById: s.agentIdentityById,

      // 文件面板 - 直接使用当前状态（已转换为 UI 格式）
      agentFilesList: s.workspaceAgentId && s.workspaceFiles ? {
        agentId: s.workspaceAgentId,
        workspace: s.workspaceDir ?? "",
        files: (s.workspaceFiles ?? []).map((f: WorkspaceFileInfo) => ({
          name: f.name,
          path: f.path ?? f.name,
          missing: !f.exists,
          size: f.size,
          updatedAtMs: f.modifiedAt,
        })),
      } : null,
      agentFilesLoading: s.workspaceLoading,
      agentFilesError: s.workspaceError,
      agentFileActive: s.workspaceSelectedFile,
      agentFileContents: s.workspaceSelectedFile ? { [s.workspaceSelectedFile]: s.workspaceOriginalContent } : {},
      agentFileDrafts: s.workspaceSelectedFile ? { [s.workspaceSelectedFile]: s.workspaceEditorContent } : {},
      agentFileSaving: s.workspaceSaving,
      filesEditorMode: s.filesEditorMode,
      filesExpandedFolders: s.filesExpandedFolders,
      filesMobileView: s.filesMobileView,

      // 工具面板
      toolsConfig: s.toolsConfig,
      agentToolsConfigs: s.agentToolsConfigs,
      toolsLoading: s.permissionsLoading,
      toolsSaving: s.permissionsSaving,
      toolsDirty: s.permissionsDirty,
      toolsExpanded: s.toolsExpanded,

      // 技能面板
      skillsLoading: s.skillsConfigLoading,
      skillsSaving: s.skillsConfigSaving,
      skillsError: s.skillsConfigError,
      skillsHasChanges: hasSkillsConfigChanges(s),
      skillsReport: s.skillsConfigReport,
      skillsConfig: s.skillsConfig,
      skillsFilter: s.skillsConfigFilter,
      skillsSourceFilter: s.skillsConfigSourceFilter,
      skillsStatusFilter: s.skillsConfigStatusFilter,
      skillsExpandedGroups: s.skillsConfigExpandedGroups,
      skillsSelectedSkill: s.skillsConfigSelectedSkill,
      skillsBusySkill: s.skillsConfigBusySkill,
      skillsMessages: s.skillsConfigMessages,
      skillsAllowlistMode: s.skillsConfigAllowlistMode,
      skillsAllowlistDraft: s.skillsConfigAllowlistDraft,
      skillsEdits: s.skillsConfigEdits,
      skillsEditorState: s.skillsConfigEditor,
      skillsCreateState: s.skillsConfigCreate,
      skillsDeleteState: s.skillsConfigDelete,
      skillsPreviewState: s.skillsConfigPreview,

      // 供应商配置
      providersConfig: s.modelConfigProviders,
      providersExpanded: s.modelConfigExpandedProviders,
      providersAddModal: s.addProviderModalShow,
      providersAddForm: s.addProviderForm,
      providersAddError: s.addProviderError,

      // Gateway 配置
      gatewayConfig: s.modelConfigGateway,

      // Agent 默认设置
      agentDefaults: s.modelConfigAgentDefaults,
      agentAvailableModels: getAvailableModels(s.modelConfigProviders),
      agentSessionsLoading: s.agentSessionsLoading,
      agentSessionsResult: s.agentSessionsResult,
      agentSessionsError: s.agentSessionsError,
      // 新建会话状态
      agentSessionCreateShow: s.sessionCreateShow,
      agentSessionCreateName: s.sessionCreateName,
      agentSessionCreateModel: s.sessionCreateModel,
      agentSessionCreating: s.sessionCreating,

      // 通道配置
      channelsConfig: s.modelConfigChannelsConfig ?? {},
      channelsSelectedChannel: s.modelConfigSelectedChannel,
      channelsLoading: s.modelConfigLoading,
      channelsError: null,

      // 定时任务
      cronLoading: s.cronLoading,
      cronBusy: s.cronBusy,
      cronError: s.cronError,
      cronStatus: s.cronStatus,
      cronJobs: s.selectedAgentId
        ? s.cronJobs.filter((job: CronJob) => {
            // 任务的 agentId 匹配选中的 Agent
            if (job.agentId === s.selectedAgentId) return true;
            // 任务没有指定 agentId（使用默认 Agent），且当前选中的是默认 Agent
            const defaultAgentId = s.agentsList?.defaultId;
            if (!job.agentId && s.selectedAgentId === defaultAgentId) return true;
            return false;
          })
        : s.cronJobs,
      cronForm: s.cronForm,
      cronAgents: s.agentsList?.agents ?? [],
      cronDefaultAgentId: s.agentsList?.defaultId ?? "",
      cronChannels: Object.keys(s.modelConfigChannelsConfig ?? {}),
      cronChannelLabels: Object.fromEntries(
        Object.entries(s.modelConfigChannelsConfig ?? {}).map(([k, v]: [string, any]) => [k, v?.label ?? k])
      ),
      cronChannelMeta: s.cronChannelMeta,
      cronRunsJobId: s.cronRunsJobId,
      cronRuns: s.cronRuns,
      cronExpandedJobId: s.cronExpandedJobId,
      cronDeleteConfirmJobId: s.cronDeleteConfirmJobId,
      cronShowCreateModal: s.cronShowCreateModal,
      cronEditJobId: s.cronEditJobId,

      // ============================================
      // 回调函数 / Callbacks
      // ============================================

      onAgentSelect: (agentId) => {
        const previousAgentId = s.selectedAgentId;
        const previousPanel = s.activePanel;
        s.selectedAgentId = agentId;
        s.globalPanel = null;
        s.activePanel = "overview";

        // 切换 Agent 时重置文件相关状态
        if (previousAgentId !== agentId) {
          s.workspaceSelectedFile = null;
          s.workspaceEditorContent = "";
          s.workspaceOriginalContent = "";
          // 设置新的 agentId 并预加载文件列表（用于概览页面显示工作区）
          s.workspaceAgentId = agentId;
          s.workspaceFiles = undefined as any;
          s.workspaceDir = undefined as any;
          // 预加载文件列表以获取工作区路径
          loadWorkspaceFiles(s).then(update);
        }

        // 加载 Agent Identity（如果未缓存）
        this._loadAgentIdentity(agentId);
        // 加载会话数据
        loadAgentSessions(s, agentId).then(update);
        update();
      },

      onPanelChange: (panel) => {
        s.activePanel = panel;
        // 懒加载数据
        if (panel === "overview" && s.selectedAgentId) {
          loadAgentSessions(s, s.selectedAgentId).then(update);
        } else if (panel === "files" && s.selectedAgentId) {
          // 设置 workspaceAgentId 并加载文件
          s.workspaceAgentId = s.selectedAgentId;
          loadWorkspaceFiles(s).then(update);
        } else if (panel === "skills" && s.selectedAgentId) {
          loadSkillsStatus(s).then(update);
        } else if (panel === "cron") {
          this._loadCron();
        } else if (panel === "tools") {
          loadPermissions(s, { kind: "gateway" }).then(update);
        }
        update();
      },

      onGlobalPanelChange: (panel) => {
        s.globalPanel = panel;
        if (panel) {
          s.selectedAgentId = null;
          // 根据全局面板类型加载数据
          if (panel === "channels") {
            // channels 数据已在 loadModelConfig 中加载
          } else if (panel === "providers") {
            // providers 数据已在 loadModelConfig 中加载
          } else if (panel === "gateway") {
            // gateway 数据已在 loadModelConfig 中加载
          } else if (panel === "agent") {
            // agent defaults 数据已在 loadModelConfig 中加载
          }
        } else {
          const agents = s.agentsList?.agents ?? [];
          s.selectedAgentId = agents.length > 0 ? (s.agentsList?.defaultId ?? agents[0].id) : null;
        }
        update();
      },

      onRefresh: () => this._loadInitialData(),

      onSetDefault: (agentId) => {
        setDefaultAgent(s, agentId);
        // 更新 agentsList 中的 defaultId
        if (s.agentsList) {
          s.agentsList = { ...s.agentsList, defaultId: agentId };
        }
        update();
      },

      // 配置回调
      onConfigReload: () => { loadModelConfig(s).then(update); },
      onConfigSave: () => { saveModelConfig(s).then(update); },
      onConfigApply: () => { applyModelConfig(s).then(update); },

      // 模型回调
      onModelChange: (agentId, modelId) => {
        updateAgentModel(s, agentId, modelId);
        update();
      },
      onModelFallbacksChange: (agentId, fallbacks) => {
        updateAgentModelFallbacks(s, agentId, fallbacks);
        update();
      },

      // 工具回调
      onToolsToggleExpanded: () => { toggleToolsExpanded(s); update(); },
      onToolsUpdateGlobal: (field, value) => { updateGlobalToolsConfig(s, field, value); update(); },
      onToolsUpdateAgent: (agentId, field, value) => { updateAgentToolsConfig(s, agentId, field, value); update(); },
      onToolsAddGlobalDeny: (entry) => { addGlobalToolsDenyEntry(s, entry); update(); },
      onToolsRemoveGlobalDeny: (entry) => { removeGlobalToolsDenyEntry(s, entry); update(); },
      onToolsAddAgentDeny: (agentId, entry) => { addAgentToolsDenyEntry(s, agentId, entry); update(); },
      onToolsRemoveAgentDeny: (agentId, entry) => { removeAgentToolsDenyEntry(s, agentId, entry); update(); },
      onToolsReload: () => { loadPermissions(s, { kind: "gateway" }).then(update); },
      onToolsSave: () => { savePermissions(s, { kind: "gateway" }).then(update); },

      // 文件回调
      onLoadFiles: (agentId) => {
        s.workspaceAgentId = agentId;
        loadWorkspaceFiles(s).then(update);
      },
      onSelectFile: (name) => {
        selectWorkspaceFile(s, name).then(update);
        // 移动端选择文件后切换到编辑器视图
        s.filesMobileView = "editor";
      },
      onFileDraftChange: (_name, content) => {
        s.workspaceEditorContent = content;
        update();
      },
      onFileReset: (_name) => {
        s.workspaceEditorContent = s.workspaceOriginalContent;
        update();
      },
      onFileSave: (_name) => {
        saveWorkspaceFile(s).then(update);
      },
      onFilesEditorModeChange: (mode) => { s.filesEditorMode = mode; update(); },
      onFilesFolderToggle: (folder) => {
        const next = new Set(s.filesExpandedFolders);
        if (next.has(folder)) next.delete(folder);
        else next.add(folder);
        s.filesExpandedFolders = next;
        update();
      },
      onFileCreate: (fileName) => { createWorkspaceFile(s, fileName); update(); },
      onFilesMobileBack: () => { s.filesMobileView = "list"; update(); },

      // 技能回调
      onSkillsRefresh: () => { loadSkillsStatus(s).then(update); },
      onSkillsSave: () => { saveSkillsConfig(s).then(update); },
      onSkillsFilterChange: (filter) => { s.skillsConfigFilter = filter; update(); },
      onSkillsSourceFilterChange: (source) => { s.skillsConfigSourceFilter = source; update(); },
      onSkillsStatusFilterChange: (status) => { s.skillsConfigStatusFilter = status; update(); },
      onSkillsGroupToggle: (group) => { toggleSkillsGroup(s, group); update(); },
      onSkillsSkillSelect: (skillKey) => { s.skillsConfigSelectedSkill = skillKey; update(); },
      onSkillsSkillToggle: (skillKey, enabled) => { updateSkillEnabled(s, skillKey, enabled); update(); },
      onSkillsApiKeyChange: (skillKey, apiKey) => { updateSkillApiKeyEdit(s, skillKey, apiKey); update(); },
      onSkillsApiKeySave: (skillKey) => { saveSkillApiKey(s, skillKey).then(update); },
      onSkillsAllowlistModeChange: (mode) => { setAllowlistMode(s, mode); update(); },
      onSkillsAllowlistToggle: (skillKey, inList) => { toggleAllowlistEntry(s, skillKey, inList); update(); },
      onSkillsInstall: (skillKey, name, installId) => { installSkillDependency(s, skillKey, name, installId).then(update); },
      onSkillsGlobalSettingChange: (field, value) => { updateGlobalSetting(s, field, value); update(); },
      onSkillsEnvChange: (skillKey, envKey, value) => { updateSkillEnv(s, skillKey, envKey, value); update(); },
      onSkillsEnvRemove: (skillKey, envKey) => { removeSkillEnv(s, skillKey, envKey); update(); },
      onSkillsConfigChange: (skillKey, config) => { updateSkillConfig(s, skillKey, config); update(); },
      onSkillsExtraDirsChange: (dirs) => { updateExtraDirs(s, dirs); update(); },
      onSkillsEditorOpen: (skillKey, skillName, source) => { openSkillEditor(s, skillKey, skillName, source).then(update); },
      onSkillsEditorClose: () => { closeSkillEditor(s); update(); },
      onSkillsEditorContentChange: (content) => { updateEditorContent(s, content); update(); },
      onSkillsEditorModeChange: (mode) => { updateEditorMode(s, mode); update(); },
      onSkillsEditorSave: () => { saveSkillFile(s).then(update); },
      onSkillsCreateOpen: (source) => { openCreateSkill(s, source); update(); },
      onSkillsCreateClose: () => { closeCreateSkill(s); update(); },
      onSkillsCreateNameChange: (name) => { updateCreateSkillName(s, name); update(); },
      onSkillsCreateSourceChange: (source) => { updateCreateSkillSource(s, source); update(); },
      onSkillsCreateConfirm: () => { confirmCreateSkill(s).then(update); },
      onSkillsDeleteOpen: (skillKey, skillName, source) => { openDeleteSkill(s, skillKey, skillName, source); update(); },
      onSkillsDeleteClose: () => { closeDeleteSkill(s); update(); },
      onSkillsDeleteConfirm: () => { confirmDeleteSkill(s).then(update); },
      onSkillsPreviewOpen: (skillKey, skillName) => { openSkillPreview(s, skillKey, skillName).then(update); },
      onSkillsPreviewClose: () => { closeSkillPreview(s); update(); },

      // 供应商回调
      onProviderToggle: (key) => { toggleProviderExpanded(s, key); update(); },
      onProviderAdd: () => { addProvider(s); update(); },
      onProviderRemove: (key) => { removeProvider(s, key); update(); },
      onProviderRename: (oldKey, newKey) => { renameProvider(s, oldKey, newKey); update(); },
      onProviderUpdate: (key, field, value) => { updateProviderField(s, key, field, value); update(); },
      onModelAdd: (providerKey) => { addModel(s, providerKey); update(); },
      onModelRemove: (providerKey, modelIndex) => { removeModel(s, providerKey, modelIndex); update(); },
      onModelUpdate: (providerKey, modelIndex, field, value) => { updateModelField(s, providerKey, modelIndex, field, value); update(); },
      onProviderShowAddModal: (show) => { showAddProviderModal(s, show); update(); },
      onProviderAddFormChange: (patch) => { updateAddProviderForm(s, patch); update(); },
      onProviderAddConfirm: () => { confirmAddProvider(s); update(); },

      // Gateway 回调
      onGatewayUpdate: (path, value) => { updateGatewayConfig(s, path, value); update(); },

      // Agent 默认设置回调
      onAgentDefaultsUpdate: (path, value) => { updateAgentDefaults(s, path, value); update(); },
      onAgentSessionsRefresh: () => { loadAgentSessions(s, s.selectedAgentId ?? undefined).then(update); },
      onAgentSessionModelChange: (sessionKey, model) => { patchSessionModel(s, sessionKey, model, s.selectedAgentId ?? undefined).then(update); },
      onAgentSessionNavigate: (sessionKey) => {
        this.dispatchEvent(new CustomEvent("session-navigate", {
          detail: { sessionKey },
          bubbles: true,
          composed: true,
        }));
      },
      onAgentSessionDelete: (sessionKey) => {
        deleteSession(s, sessionKey, s.selectedAgentId ?? undefined).then(update);
      },
      // 新建会话回调
      onAgentSessionCreateShow: (show) => {
        s.sessionCreateShow = show;
        if (show) {
          s.sessionCreateName = "";
          s.sessionCreateModel = null;
        }
        update();
      },
      onAgentSessionCreateNameChange: (name) => {
        s.sessionCreateName = name;
        update();
      },
      onAgentSessionCreateModelChange: (model) => {
        s.sessionCreateModel = model;
        update();
      },
      onAgentSessionCreate: async () => {
        if (!s.selectedAgentId || !s.sessionCreateName.trim()) return;
        s.sessionCreating = true;
        update();
        try {
          const result = await createSession(
            s,
            s.selectedAgentId,
            s.sessionCreateName,
            s.sessionCreateModel,
          );
          if (result.ok) {
            s.sessionCreateShow = false;
            s.sessionCreateName = "";
            s.sessionCreateModel = null;
          }
        } finally {
          s.sessionCreating = false;
          update();
        }
      },

      // 通道回调
      onChannelSelect: (channelId) => { s.modelConfigSelectedChannel = channelId; update(); },
      onChannelConfigUpdate: (channelId, field, value) => {
        const current = s.modelConfigChannelsConfig ?? {};
        const channelConfig = JSON.parse(JSON.stringify(current[channelId] ?? {}));
        const parts = field.split(".");
        if (parts.length === 1) {
          channelConfig[field] = value;
        } else {
          let target = channelConfig;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) target[parts[i]] = {};
            target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = value;
        }
        s.modelConfigChannelsConfig = { ...current, [channelId]: channelConfig };
        update();
      },
      onNavigateToChannels: () => {
        this.dispatchEvent(new CustomEvent("navigate-channels", {
          bubbles: true,
          composed: true,
        }));
      },
      onChannelsRefresh: () => {
        Promise.all([
          loadModelConfig(s),
          this._loadChannelsStatus(),
        ]).then(update);
      },

      // 定时任务回调
      onCronFormChange: (patch) => { s.cronForm = { ...s.cronForm, ...patch }; update(); },
      onCronRefresh: () => this._loadCron(),
      onCronAdd: async () => {
        await addCronJob(s);
        update();
      },
      onCronUpdate: async () => {
        await updateCronJob(s);
        update();
      },
      onCronToggle: async (job, enabled) => {
        await toggleCronJob(s, job, enabled);
        update();
      },
      onCronRun: async (job) => {
        await runCronJob(s, job);
        update();
      },
      onCronRemove: async (job) => {
        await removeCronJob(s, job);
        update();
      },
      onCronLoadRuns: async (jobId) => {
        await loadCronRuns(s, jobId);
        update();
      },
      onCronExpandJob: (jobId) => { s.cronExpandedJobId = jobId; update(); },
      onCronDeleteConfirm: (jobId) => { s.cronDeleteConfirmJobId = jobId; update(); },
      onCronShowCreateModal: (show) => {
        s.cronShowCreateModal = show;
        if (show) {
          s.cronEditJobId = null;
          s.cronForm = { ...DEFAULT_CRON_FORM, agentId: s.selectedAgentId ?? "" };
        }
        update();
      },
      onCronEdit: (job) => {
        populateCronFormFromJob(s, job);
        update();
      },
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "openclaw-config-zh": OpenClawConfigElement;
  }
}
