/**
 * Agent 配置页面类型定义
 * Agent configuration page type definitions
 */
import type {
  AgentsListResult,
  AgentIdentityResult,
  AgentsFilesListResult,
  CronJob,
  CronStatus,
  CronRunLogEntry,
  ChannelUiMetaEntry,
  GatewayAgentRow,
} from "../../../ui/types";
import type { CronFormState } from "../../../ui/ui-types";
import type { AgentStatus, AgentGroup } from "../../components/agent/agent-sidebar";
import type { ProviderFormState } from "../../components/providers-content";
import type {
  ToolsConfig,
  AgentWithTools,
  ToolPolicyConfig,
  SessionsListResult as AgentSessionsListResult,
} from "../../controllers/model-config";
import type { AgentPanel, GlobalPanel, ConfigSnapshot } from "../../types/agents-config";
import type { ChannelsConfigData } from "../../types/channel-config";
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
  SkillPreviewState,
  EditableSkillSource,
  SkillEditorMode,
} from "../../types/skills-config";
import type { ProviderConfig, GatewayConfig, AgentDefaults } from "../model-config";

// ─────────────────────────────────────────────────────────────────────────────
// Agent 向导数据类型 / Agent Wizard Data Type
// ─────────────────────────────────────────────────────────────────────────────

export type AgentWizardData = {
  id: string;
  displayName?: string;
  emoji?: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  workspace?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Props 类型定义 / Props Type Definition
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

  // Agent 侧边栏状态 / Agent sidebar state
  sidebarSearchQuery?: string;
  sidebarOpenMenuId?: string | null;
  sidebarMenuTop?: number | null;
  sidebarMenuRight?: number | null;
  sidebarAgentStatusById?: Record<string, AgentStatus>;
  sidebarGroups?: AgentGroup[];
  sidebarCollapsedGroups?: Set<string>;

  // Agent Identity 数据 / Agent identity data
  agentIdentity: AgentIdentityResult | null;
  agentIdentityLoading: boolean;
  agentIdentityError: string | null;
  agentIdentityById: Record<string, AgentIdentityResult>;

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
  filesMobileView?: "list" | "editor";

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
  skillsPreviewState: SkillPreviewState;

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
  agentSessionCreateShow?: boolean;
  agentSessionCreateName?: string;
  agentSessionCreateModel?: string | null;
  agentSessionCreating?: boolean;

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
  onSetDefault?: (agentId: string) => void;

  // 侧边栏回调 / Sidebar callbacks
  onSidebarSearchChange?: (query: string) => void;
  onSidebarToggleMenu?: (agentId: string | null, top?: number, right?: number) => void;
  onSidebarToggleGroup?: (groupId: string) => void;
  onAgentDuplicate?: (agentId: string) => void;
  onAgentExport?: (agentId: string) => void;
  onAgentDelete?: (agentId: string) => void;
  onCreateAgent?: () => void;

  // Agent 向导 / Agent wizard
  showAgentWizard?: boolean;
  onAgentWizardComplete?: (data: AgentWizardData) => void;
  onAgentWizardCancel?: () => void;

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
  onFilesMobileBack?: () => void;

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
  onSkillsPreviewOpen: (skillKey: string, skillName: string) => void;
  onSkillsPreviewClose: () => void;

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
  onAgentSessionDelete?: (sessionKey: string) => void;
  onAgentSessionCreateShow?: (show: boolean) => void;
  onAgentSessionCreateNameChange?: (name: string) => void;
  onAgentSessionCreateModelChange?: (model: string | null) => void;
  onAgentSessionCreate?: () => void;

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
