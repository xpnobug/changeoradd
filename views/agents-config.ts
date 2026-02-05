/**
 * Agent 配置页面视图
 * Agent configuration page view
 *
 * Agent-centric 布局：左侧 Agent 列表 + 右侧 Agent 详情（带 Tab 切换）
 * Agent-centric layout: Left agent list + Right agent details (with tabs)
 */
import { html, nothing } from "lit";
import type { AgentsListResult, AgentIdentityResult, AgentsFilesListResult, CronJob, CronStatus, CronRunLogEntry, ChannelUiMetaEntry, GatewayAgentRow } from "../../ui/types";
import type { CronFormState } from "../../ui/ui-types";
import type { AgentPanel, GlobalPanel, ConfigSnapshot } from "../types/agents-config";
import { LABELS } from "../types/agents-config";
import {
  renderAgentSidebar,
  renderAgentHeader,
  renderAgentTabs,
  renderAgentOverview,
  renderAgentFiles,
  renderAgentTools,
  renderAgentSkills,
  renderAgentCron,
} from "../components/agent";
import { renderChannelsContent } from "../components/channels-content";
import { renderProvidersContent, type ProviderFormState } from "../components/providers-content";
import { renderGatewayContent } from "../components/gateway-content";
import { renderAgentContent } from "../components/agent-content";
import type { SkillInfo } from "../components/agent/agent-skills";
import type { ChannelStatus } from "../components/agent/agent-channels";
import type { ChannelsConfigData } from "../types/channel-config";
import type { ToolsConfig, AgentWithTools, ToolPolicyConfig, SessionsListResult as AgentSessionsListResult } from "../controllers/model-config";
import type { ProviderConfig, GatewayConfig, AgentDefaults } from "./model-config";
import type {
  SkillStatusReport,
  SkillsConfig,
  SkillSourceFilter,
  SkillStatusFilter,
  SkillMessage,
  SkillEditState,
  SkillEditorState,
  SkillCreateState,
  SkillDeleteState,
  EditableSkillSource,
  SkillEditorMode,
} from "../types/skills-config";

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type AgentsConfigProps = {
  // 加载状态 / Loading state
  loading: boolean;
  error: string | null;

  // Agent 列表数据 / Agent list data
  agentsList: AgentsListResult | null;
  defaultAgentId: string | null;

  // 当前选中状态 / Current selection state
  selectedAgentId: string | null;
  activePanel: AgentPanel;

  // 配置表单数据 / Config form data
  configForm: ConfigSnapshot | null;
  configLoading: boolean;
  configSaving: boolean;
  configApplying: boolean;
  configDirty: boolean;

  // 连接状态 / Connection state
  connected?: boolean;

  // Agent Identity 数据 / Agent identity data
  agentIdentity: AgentIdentityResult | null;
  agentIdentityLoading: boolean;
  agentIdentityError: string | null;
  agentIdentityById: Record<string, AgentIdentityResult>;  // 所有 Agent 的 Identity 缓存

  // 文件面板数据 / Files panel data
  agentFilesList: AgentsFilesListResult | null;
  agentFilesLoading: boolean;
  agentFilesError: string | null;
  agentFileActive: string | null;
  agentFileContents: Record<string, string>;
  agentFileDrafts: Record<string, string>;
  agentFileSaving: boolean;
  filesEditorMode?: "edit" | "preview" | "split";
  filesExpandedFolders?: Set<string>;

  // 工具面板数据 / Tools panel data
  toolsConfig: ToolsConfig | null;
  agentToolsConfigs: AgentWithTools[];
  toolsLoading: boolean;
  toolsSaving: boolean;
  toolsDirty: boolean;
  toolsExpanded: boolean;

  // 技能面板数据 / Skills panel data
  skillsLoading: boolean;
  skillsSaving: boolean;
  skillsError: string | null;
  skillsHasChanges: boolean;
  skillsReport: SkillStatusReport | null;
  skillsConfig: SkillsConfig | null;
  skillsFilter: string;
  skillsSourceFilter: SkillSourceFilter;
  skillsStatusFilter: SkillStatusFilter;
  skillsExpandedGroups: Set<string>;
  skillsSelectedSkill: string | null;
  skillsBusySkill: string | null;
  skillsMessages: Record<string, SkillMessage>;
  skillsAllowlistMode: "all" | "whitelist";
  skillsAllowlistDraft: Set<string>;
  skillsEdits: Record<string, SkillEditState>;
  skillsEditorState: SkillEditorState;
  skillsCreateState: SkillCreateState;
  skillsDeleteState: SkillDeleteState;

  // 全局配置面板 / Global config panel
  globalPanel: GlobalPanel | null;

  // 供应商配置数据（全局） / Providers config data (global)
  providersConfig: Record<string, ProviderConfig>;
  providersExpanded: Set<string>;
  providersAddModal?: boolean;
  providersAddForm?: ProviderFormState;
  providersAddError?: string | null;

  // Gateway 配置数据（全局） / Gateway config data (global)
  gatewayConfig: GatewayConfig;

  // Agent 默认设置数据（全局） / Agent defaults data (global)
  agentDefaults: AgentDefaults;
  agentAvailableModels: Array<{ id: string; name: string; provider: string }>;
  agentSessionsLoading: boolean;
  agentSessionsResult: AgentSessionsListResult | null;
  agentSessionsError: string | null;

  // 通道配置数据（全局） / Channels config data (global)
  channelsConfig: ChannelsConfigData;
  channelsSelectedChannel: string | null;
  channelsLoading: boolean;
  channelsError: string | null;

  // 定时任务面板数据 / Cron panel data
  cronLoading: boolean;
  cronBusy: boolean;
  cronError: string | null;
  cronStatus: CronStatus | null;
  cronJobs: CronJob[];
  cronForm: CronFormState;
  cronAgents: GatewayAgentRow[];
  cronDefaultAgentId: string;
  cronChannels: string[];
  cronChannelLabels?: Record<string, string>;
  cronChannelMeta?: ChannelUiMetaEntry[];
  cronRunsJobId: string | null;
  cronRuns: CronRunLogEntry[];
  cronExpandedJobId: string | null;
  cronDeleteConfirmJobId: string | null;
  cronShowCreateModal: boolean;
  cronEditJobId: string | null;

  // 回调函数 / Callbacks
  onAgentSelect: (agentId: string) => void;
  onPanelChange: (panel: AgentPanel) => void;
  onGlobalPanelChange: (panel: GlobalPanel | null) => void;
  onRefresh: () => void;

  // 配置回调 / Config callbacks
  onConfigReload: () => void;
  onConfigSave: () => void;
  onConfigApply: () => void;

  // 模型回调 / Model callbacks
  onModelChange: (agentId: string, modelId: string | null) => void;
  onModelFallbacksChange: (agentId: string, fallbacks: string[]) => void;

  // 工具回调 / Tools callbacks
  onToolsToggleExpanded: () => void;
  onToolsUpdateGlobal: (field: keyof ToolPolicyConfig, value: unknown) => void;
  onToolsUpdateAgent: (agentId: string, field: keyof ToolPolicyConfig, value: unknown) => void;
  onToolsAddGlobalDeny: (entry: string) => void;
  onToolsRemoveGlobalDeny: (entry: string) => void;
  onToolsAddAgentDeny: (agentId: string, entry: string) => void;
  onToolsRemoveAgentDeny: (agentId: string, entry: string) => void;
  onToolsReload: () => void;
  onToolsSave: () => void;

  // 文件回调 / Files callbacks
  onLoadFiles: (agentId: string) => void;
  onSelectFile: (name: string) => void;
  onFileDraftChange: (name: string, content: string) => void;
  onFileReset: (name: string) => void;
  onFileSave: (name: string) => void;
  onFilesEditorModeChange?: (mode: "edit" | "preview" | "split") => void;
  onFilesFolderToggle?: (folderName: string) => void;
  onFileCreate?: (fileName: string) => void;

  // 技能回调 / Skills callbacks
  onSkillsRefresh: () => void;
  onSkillsSave: () => void;
  onSkillsFilterChange: (filter: string) => void;
  onSkillsSourceFilterChange: (source: SkillSourceFilter) => void;
  onSkillsStatusFilterChange: (status: SkillStatusFilter) => void;
  onSkillsGroupToggle: (group: string) => void;
  onSkillsSkillSelect: (skillKey: string | null) => void;
  onSkillsSkillToggle: (skillKey: string, enabled: boolean) => void;
  onSkillsApiKeyChange: (skillKey: string, apiKey: string) => void;
  onSkillsApiKeySave: (skillKey: string) => void;
  onSkillsAllowlistModeChange: (mode: "all" | "whitelist") => void;
  onSkillsAllowlistToggle: (skillKey: string, inList: boolean) => void;
  onSkillsInstall: (skillKey: string, name: string, installId: string) => void;
  onSkillsGlobalSettingChange: (field: string, value: unknown) => void;
  onSkillsEnvChange: (skillKey: string, envKey: string, value: string) => void;
  onSkillsEnvRemove: (skillKey: string, envKey: string) => void;
  onSkillsConfigChange: (skillKey: string, config: Record<string, unknown>) => void;
  onSkillsExtraDirsChange: (dirs: string[]) => void;
  onSkillsEditorOpen: (skillKey: string, skillName: string, source: EditableSkillSource) => void;
  onSkillsEditorClose: () => void;
  onSkillsEditorContentChange: (content: string) => void;
  onSkillsEditorModeChange: (mode: SkillEditorMode) => void;
  onSkillsEditorSave: () => void;
  onSkillsCreateOpen: (source?: EditableSkillSource) => void;
  onSkillsCreateClose: () => void;
  onSkillsCreateNameChange: (name: string) => void;
  onSkillsCreateSourceChange: (source: EditableSkillSource) => void;
  onSkillsCreateConfirm: () => void;
  onSkillsDeleteOpen: (skillKey: string, skillName: string, source: EditableSkillSource) => void;
  onSkillsDeleteClose: () => void;
  onSkillsDeleteConfirm: () => void;

  // 供应商回调 / Providers callbacks
  onProviderToggle: (key: string) => void;
  onProviderAdd: () => void;
  onProviderRemove: (key: string) => void;
  onProviderRename: (oldKey: string, newKey: string) => void;
  onProviderUpdate: (key: string, field: string, value: unknown) => void;
  onModelAdd: (providerKey: string) => void;
  onModelRemove: (providerKey: string, modelIndex: number) => void;
  onModelUpdate: (providerKey: string, modelIndex: number, field: string, value: unknown) => void;
  onProviderShowAddModal?: (show: boolean) => void;
  onProviderAddFormChange?: (patch: Partial<ProviderFormState>) => void;
  onProviderAddConfirm?: () => void;

  // Gateway 回调 / Gateway callbacks
  onGatewayUpdate: (path: string[], value: unknown) => void;

  // Agent 默认设置回调 / Agent defaults callbacks
  onAgentDefaultsUpdate: (path: string[], value: unknown) => void;
  onAgentSessionsRefresh: () => void;
  onAgentSessionModelChange: (sessionKey: string, model: string | null) => void;
  onAgentSessionNavigate: (sessionKey: string) => void;

  // 通道回调 / Channels callbacks
  onChannelSelect: (channelId: string) => void;
  onChannelConfigUpdate: (channelId: string, field: string, value: unknown) => void;
  onNavigateToChannels: () => void;
  onChannelsRefresh?: () => void;

  // 定时任务回调 / Cron callbacks
  onCronFormChange: (patch: Partial<CronFormState>) => void;
  onCronRefresh: () => void;
  onCronAdd: () => void;
  onCronUpdate: () => void;
  onCronToggle: (job: CronJob, enabled: boolean) => void;
  onCronRun: (job: CronJob) => void;
  onCronRemove: (job: CronJob) => void;
  onCronLoadRuns: (jobId: string) => void;
  onCronExpandJob: (jobId: string | null) => void;
  onCronDeleteConfirm: (jobId: string | null) => void;
  onCronShowCreateModal: (show: boolean) => void;
  onCronEdit: (job: CronJob) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// 渲染函数 / Render Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染当前激活的面板内容
 * Render current active panel content
 */
function renderActivePanel(props: AgentsConfigProps, agent: AgentsListResult["agents"][number]) {
  const { activePanel, selectedAgentId } = props;

  if (!selectedAgentId) return nothing;

  switch (activePanel) {
    case "overview":
      return renderAgentOverview({
        agent,
        defaultId: props.defaultAgentId,
        configForm: props.configForm as Record<string, unknown> | null,
        agentFilesList: props.agentFilesList,
        agentIdentity: props.agentIdentity,
        agentIdentityLoading: props.agentIdentityLoading,
        agentIdentityError: props.agentIdentityError,
        configLoading: props.configLoading,
        configSaving: props.configSaving,
        configDirty: props.configDirty,
        onConfigReload: props.onConfigReload,
        onConfigSave: props.onConfigSave,
        onModelChange: props.onModelChange,
        onModelFallbacksChange: props.onModelFallbacksChange,
        // 会话管理 / Session management
        sessionsLoading: props.agentSessionsLoading,
        sessionsResult: props.agentSessionsResult,
        sessionsError: props.agentSessionsError,
        availableModels: props.agentAvailableModels,
        onSessionsRefresh: props.onAgentSessionsRefresh,
        onSessionModelChange: props.onAgentSessionModelChange,
        onSessionNavigate: props.onAgentSessionNavigate,
      });

    case "files":
      return renderAgentFiles({
        agentId: selectedAgentId,
        agentName: agent.name ?? agent.id,
        agentFilesList: props.agentFilesList,
        agentFilesLoading: props.agentFilesLoading,
        agentFilesError: props.agentFilesError,
        agentFileActive: props.agentFileActive,
        agentFileContents: props.agentFileContents,
        agentFileDrafts: props.agentFileDrafts,
        agentFileSaving: props.agentFileSaving,
        editorMode: props.filesEditorMode,
        expandedFolders: props.filesExpandedFolders,
        onLoadFiles: props.onLoadFiles,
        onSelectFile: props.onSelectFile,
        onFileDraftChange: props.onFileDraftChange,
        onFileReset: props.onFileReset,
        onFileSave: props.onFileSave,
        onModeChange: props.onFilesEditorModeChange,
        onFolderToggle: props.onFilesFolderToggle,
        onFileCreate: props.onFileCreate,
      });

    case "tools":
      return renderAgentTools({
        agentId: selectedAgentId,
        agentName: agent.name ?? agent.id,
        loading: props.toolsLoading,
        saving: props.toolsSaving,
        dirty: props.toolsDirty,
        toolsConfig: props.toolsConfig,
        agentToolsConfigs: props.agentToolsConfigs,
        toolsExpanded: props.toolsExpanded,
        onToggleExpanded: props.onToolsToggleExpanded,
        onUpdateGlobal: props.onToolsUpdateGlobal,
        onUpdateAgent: props.onToolsUpdateAgent,
        onAddGlobalDeny: props.onToolsAddGlobalDeny,
        onRemoveGlobalDeny: props.onToolsRemoveGlobalDeny,
        onAddAgentDeny: props.onToolsAddAgentDeny,
        onRemoveAgentDeny: props.onToolsRemoveAgentDeny,
        onReload: props.onToolsReload,
        onSave: props.onToolsSave,
      });

    case "skills":
      return renderAgentSkills({
        agentId: selectedAgentId,
        agentName: agent.name ?? agent.id,
        loading: props.skillsLoading,
        saving: props.skillsSaving,
        error: props.skillsError,
        hasChanges: props.skillsHasChanges,
        report: props.skillsReport,
        config: props.skillsConfig,
        filter: props.skillsFilter,
        sourceFilter: props.skillsSourceFilter,
        statusFilter: props.skillsStatusFilter,
        expandedGroups: props.skillsExpandedGroups,
        selectedSkill: props.skillsSelectedSkill,
        busySkill: props.skillsBusySkill,
        messages: props.skillsMessages,
        allowlistMode: props.skillsAllowlistMode,
        allowlistDraft: props.skillsAllowlistDraft,
        edits: props.skillsEdits,
        editorState: props.skillsEditorState,
        createState: props.skillsCreateState,
        deleteState: props.skillsDeleteState,
        onRefresh: props.onSkillsRefresh,
        onSave: props.onSkillsSave,
        onFilterChange: props.onSkillsFilterChange,
        onSourceFilterChange: props.onSkillsSourceFilterChange,
        onStatusFilterChange: props.onSkillsStatusFilterChange,
        onGroupToggle: props.onSkillsGroupToggle,
        onSkillSelect: props.onSkillsSkillSelect,
        onSkillToggle: props.onSkillsSkillToggle,
        onSkillApiKeyChange: props.onSkillsApiKeyChange,
        onSkillApiKeySave: props.onSkillsApiKeySave,
        onAllowlistModeChange: props.onSkillsAllowlistModeChange,
        onAllowlistToggle: props.onSkillsAllowlistToggle,
        onInstall: props.onSkillsInstall,
        onGlobalSettingChange: props.onSkillsGlobalSettingChange,
        onSkillEnvChange: props.onSkillsEnvChange,
        onSkillEnvRemove: props.onSkillsEnvRemove,
        onSkillConfigChange: props.onSkillsConfigChange,
        onExtraDirsChange: props.onSkillsExtraDirsChange,
        onEditorOpen: props.onSkillsEditorOpen,
        onEditorClose: props.onSkillsEditorClose,
        onEditorContentChange: props.onSkillsEditorContentChange,
        onEditorModeChange: props.onSkillsEditorModeChange,
        onEditorSave: props.onSkillsEditorSave,
        onCreateOpen: props.onSkillsCreateOpen,
        onCreateClose: props.onSkillsCreateClose,
        onCreateNameChange: props.onSkillsCreateNameChange,
        onCreateSourceChange: props.onSkillsCreateSourceChange,
        onCreateConfirm: props.onSkillsCreateConfirm,
        onDeleteOpen: props.onSkillsDeleteOpen,
        onDeleteClose: props.onSkillsDeleteClose,
        onDeleteConfirm: props.onSkillsDeleteConfirm,
      });

    case "cron":
      return renderAgentCron({
        agentId: selectedAgentId,
        agentName: agent.name ?? agent.id,
        loading: props.cronLoading,
        busy: props.cronBusy,
        error: props.cronError,
        status: props.cronStatus,
        jobs: props.cronJobs,
        form: props.cronForm,
        agents: props.cronAgents,
        defaultAgentId: props.cronDefaultAgentId,
        channels: props.cronChannels,
        channelLabels: props.cronChannelLabels,
        channelMeta: props.cronChannelMeta,
        runsJobId: props.cronRunsJobId,
        runs: props.cronRuns,
        expandedJobId: props.cronExpandedJobId,
        deleteConfirmJobId: props.cronDeleteConfirmJobId,
        showCreateModal: props.cronShowCreateModal,
        editJobId: props.cronEditJobId,
        onFormChange: props.onCronFormChange,
        onRefresh: props.onCronRefresh,
        onAdd: props.onCronAdd,
        onUpdate: props.onCronUpdate,
        onToggle: props.onCronToggle,
        onRun: props.onCronRun,
        onRemove: props.onCronRemove,
        onLoadRuns: props.onCronLoadRuns,
        onExpandJob: props.onCronExpandJob,
        onDeleteConfirm: props.onCronDeleteConfirm,
        onShowCreateModal: props.onCronShowCreateModal,
        onEdit: props.onCronEdit,
      });

    default:
      return nothing;
  }
}

/**
 * 渲染全局配置面板内容
 * Render global config panel content
 */
function renderGlobalPanel(props: AgentsConfigProps) {
  const { globalPanel } = props;

  if (!globalPanel) return nothing;

  switch (globalPanel) {
    case "channels":
      return html`
        <div class="agents-detail">
          <div class="agents-detail__header">
            <h2 class="agents-detail__title">${LABELS.globalPanels.channels}</h2>
            <p class="agents-detail__subtitle">Gateway 级别的通道配置</p>
          </div>
          <div class="agents-detail__content">
            ${renderChannelsContent({
              channelsConfig: props.channelsConfig,
              selectedChannel: props.channelsSelectedChannel,
              onChannelSelect: props.onChannelSelect,
              onChannelConfigUpdate: props.onChannelConfigUpdate,
              onNavigateToChannels: props.onNavigateToChannels,
            })}
          </div>
        </div>
      `;

    case "providers":
      return html`
        <div class="agents-detail">
          <div class="agents-detail__header">
            <h2 class="agents-detail__title">${LABELS.globalPanels.providers}</h2>
            <p class="agents-detail__subtitle">配置模型供应商和 API 密钥</p>
          </div>
          <div class="agents-detail__content">
            ${renderProvidersContent({
              providers: props.providersConfig,
              expandedProviders: props.providersExpanded,
              showAddModal: props.providersAddModal,
              addForm: props.providersAddForm,
              addError: props.providersAddError,
              onProviderToggle: props.onProviderToggle,
              onProviderAdd: props.onProviderAdd,
              onProviderRemove: props.onProviderRemove,
              onProviderRename: props.onProviderRename,
              onProviderUpdate: props.onProviderUpdate,
              onModelAdd: props.onModelAdd,
              onModelRemove: props.onModelRemove,
              onModelUpdate: props.onModelUpdate,
              onShowAddModal: props.onProviderShowAddModal,
              onAddFormChange: props.onProviderAddFormChange,
              onAddConfirm: props.onProviderAddConfirm,
            })}
          </div>
        </div>
      `;

    case "gateway":
      return html`
        <div class="agents-detail">
          <div class="agents-detail__header">
            <h2 class="agents-detail__title">${LABELS.globalPanels.gateway}</h2>
            <p class="agents-detail__subtitle">Gateway 全局设置</p>
          </div>
          <div class="agents-detail__content">
            ${renderGatewayContent({
              gatewayConfig: props.gatewayConfig,
              onGatewayUpdate: props.onGatewayUpdate,
            })}
          </div>
        </div>
      `;

    case "agent":
      return html`
        <div class="agents-detail">
          <div class="agents-detail__header">
            <h2 class="agents-detail__title">${LABELS.globalPanels.agent}</h2>
            <p class="agents-detail__subtitle">Agent 全局默认参数</p>
          </div>
          <div class="agents-detail__content">
            ${renderAgentContent({
              agentDefaults: props.agentDefaults,
              availableModels: props.agentAvailableModels,
              onAgentDefaultsUpdate: props.onAgentDefaultsUpdate,
            })}
          </div>
        </div>
      `;

    default:
      return nothing;
  }
}

/**
 * 渲染 Agent 详情区域（头部 + Tab + 内容）
 * Render agent details area (header + tabs + content)
 */
function renderAgentDetails(props: AgentsConfigProps) {
  const { agentsList, selectedAgentId, activePanel, agentIdentity, defaultAgentId } = props;

  // 查找当前选中的 Agent
  // Find currently selected agent
  const agents = agentsList?.agents ?? [];
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  if (!selectedAgent) {
    return html`
      <div class="agents-detail agents-detail--empty">
        <div class="agents-detail__placeholder">
          <p>${LABELS.sidebar.selectAgent}</p>
        </div>
      </div>
    `;
  }

  return html`
    <div class="agents-detail">
      <!-- Agent 头部 / Agent header -->
      ${renderAgentHeader({
        agent: selectedAgent,
        defaultId: defaultAgentId,
        agentIdentity,
      })}

      <!-- Tab 切换栏 / Tab navigation -->
      ${renderAgentTabs({
        active: activePanel,
        onSelect: props.onPanelChange,
      })}

      <!-- 面板内容 / Panel content -->
      <div class="agents-detail__content">
        ${renderActivePanel(props, selectedAgent)}
      </div>
    </div>
  `;
}

/**
 * 主渲染函数 - Agent 配置页面
 * Main render function - Agent configuration page
 */
export function renderAgentsConfig(props: AgentsConfigProps) {
  const { loading, error, agentsList, selectedAgentId, defaultAgentId, globalPanel, onAgentSelect, onRefresh, onGlobalPanelChange } = props;

  // 错误状态
  // Error state
  if (error && !agentsList) {
    return html`
      <div class="agents-layout agents-layout--error">
        <div class="mc-error">
          <p>${error}</p>
          <button class="mc-btn mc-btn--primary" @click=${onRefresh}>${LABELS.actions.retry}</button>
        </div>
      </div>
    `;
  }

  // 加载状态
  // Loading state
  if (loading && !agentsList) {
    return html`
      <div class="agents-layout agents-layout--loading">
        <div class="mc-loading">${LABELS.actions.loading}</div>
      </div>
    `;
  }

  const agents = agentsList?.agents ?? [];

  // 处理全局配置点击 - 设置 globalPanel 而不是跳转
  // Handle global config click - set globalPanel instead of navigating
  const handleGlobalConfigClick = (section: string) => {
    onGlobalPanelChange(section as GlobalPanel);
  };

  // 渲染配置操作按钮 / Render config action buttons
  const renderConfigActions = () => {
    const { configDirty, configLoading, configSaving, configApplying, onConfigReload, onConfigSave, onConfigApply } = props;
    const isBusy = configLoading || configSaving || configApplying;

    return html`
      <div class="agents-actions">
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${isBusy}
          @click=${onConfigReload}
        >
          ${configLoading ? LABELS.actions.loading : LABELS.actions.reload}
        </button>
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${!configDirty || isBusy}
          @click=${onConfigSave}
        >
          ${configSaving ? LABELS.actions.saving : LABELS.actions.save}
        </button>
        <button
          class="mc-btn mc-btn--sm mc-btn--primary"
          ?disabled=${!configDirty || isBusy}
          @click=${onConfigApply}
        >
          ${configApplying ? LABELS.actions.applying : LABELS.actions.apply}
        </button>
      </div>
    `;
  };

  return html`
    <div class="agents-layout">
      <!-- 左侧 Agent 侧边栏 / Left agent sidebar -->
      ${renderAgentSidebar({
        agents,
        selectedId: globalPanel ? null : selectedAgentId,  // 全局面板时不高亮 Agent
        defaultId: defaultAgentId,
        activeGlobalPanel: globalPanel,  // 全局面板高亮 / Highlight active global panel
        loading,
        error,
        agentIdentityById: props.agentIdentityById,
        hasChanges: props.configDirty,
        connected: props.connected,
        onSelectAgent: (agentId) => {
          // 选择 Agent 时清除全局面板
          // Clear global panel when selecting agent
          onGlobalPanelChange(null);
          onAgentSelect(agentId);
        },
        onRefresh,
        onGlobalConfigClick: handleGlobalConfigClick,
      })}

      <!-- 右侧内容区域 / Right content area -->
      <div class="agents-main">
        <!-- 配置操作按钮 / Config action buttons -->
        ${renderConfigActions()}

        ${globalPanel
          ? renderGlobalPanel(props)
          : renderAgentDetails(props)}
      </div>
    </div>
  `;
}
