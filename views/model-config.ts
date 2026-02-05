/**
 * 模型配置页面视图
 * Agent-centric 配置布局
 */
import { html } from "lit";
import { renderAgentsConfig, type AgentsConfigProps } from "./agents-config";
import type {
  SkillStatusReport,
  SkillsConfig,
  SkillSourceFilter,
  SkillStatusFilter,
  SkillEditState,
  SkillMessage,
  SkillEditorState,
  SkillCreateState,
  SkillDeleteState,
  EditableSkillSource,
  SkillEditorMode,
} from "../types/skills-config";
import type {
  ExecApprovalsTarget,
  ExecApprovalsTargetNode,
} from "../controllers/model-config";
import type { ChannelsConfigData } from "../types/channel-config";
import type { CronJob, CronStatus, CronRunLogEntry, ChannelUiMetaEntry, GatewayAgentRow } from "../../ui/types";
import type { CronFormState } from "../../ui/ui-types";
import type {
  ToolPolicyConfig,
  ToolsConfig,
  AgentWithTools,
  PermissionsTabId,
  SessionsListResult,
} from "../controllers/model-config";

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type ModelApi =
  | "openai-completions"
  | "openai-responses"
  | "anthropic-messages"
  | "google-generative-ai"
  | "github-copilot"
  | "bedrock-converse-stream";

export type AuthMode = "api-key" | "aws-sdk" | "oauth" | "token";

export type ProviderConfig = {
  baseUrl: string;
  apiKey?: string;
  auth?: AuthMode;
  api: ModelApi;
  headers?: Record<string, string>;
  models: ModelConfig[];
};

export type ModelCost = {
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
};

export type ModelCompat = {
  supportsStore?: boolean;
  supportsDeveloperRole?: boolean;
  supportsReasoningEffort?: boolean;
  maxTokensField?: "max_completion_tokens" | "max_tokens";
};

export type ModelConfig = {
  id: string;
  name: string;
  reasoning: boolean;
  input: Array<"text" | "image">;
  contextWindow: number;
  maxTokens: number;
  cost?: ModelCost;
  compat?: ModelCompat;
};

export type AgentDefaults = {
  maxConcurrent?: number;
  subagents?: {
    maxConcurrent?: number;
  };
  workspace?: string;
  model?: {
    primary?: string;
  };
  contextPruning?: {
    mode?: string;
    ttl?: string;
  };
  compaction?: {
    mode?: string;
  };
};

export type GatewayConfig = {
  port?: number;
  bind?: string;
  auth?: {
    mode?: string;
    token?: string;
  };
};

// 工作区文件信息 / Workspace file info
type WorkspaceFileInfo = {
  name: string;
  path?: string;
  missing?: boolean;
};

// 工作区 Agent 选项 / Workspace agent option
type WorkspaceAgentOption = {
  id: string;
  name?: string;
  default?: boolean;
};

// Exec Approvals 类型 / Exec approvals types
type ExecApprovalsSnapshot = Record<string, unknown>;
type ExecApprovalsFile = Record<string, unknown>;
type AgentOption = { id: string; name?: string };

export type ModelConfigProps = {
  loading: boolean;
  saving: boolean;
  applying: boolean;
  connected: boolean;
  hasChanges: boolean;

  // 模型供应商数据
  providers: Record<string, ProviderConfig>;
  // Agent 默认设置
  agentDefaults: AgentDefaults;
  // Gateway 配置
  gatewayConfig: GatewayConfig;
  // 可用模型列表（用于下拉选择）
  availableModels: Array<{ id: string; name: string; provider: string }>;

  // 通道配置
  channelsConfig: ChannelsConfigData;
  selectedChannel: string | null;

  // 展开状态
  expandedProviders: Set<string>;

  // 添加供应商弹窗状态
  showAddProviderModal?: boolean;
  addProviderForm?: import("../components/providers-content").ProviderFormState;
  addProviderError?: string | null;
  onShowAddProviderModal?: (show: boolean) => void;
  onAddProviderFormChange?: (patch: Partial<import("../components/providers-content").ProviderFormState>) => void;
  onAddProviderConfirm?: () => void;

  // 会话管理相关 (用于 Agent 设置页)
  agentSessionsLoading: boolean;
  agentSessionsResult: SessionsListResult | null;
  agentSessionsError: string | null;
  onAgentSessionsRefresh: () => void;
  onAgentSessionModelChange: (sessionKey: string, model: string | null) => void;
  onAgentSessionNavigate: (sessionKey: string) => void;

  // 工作区文件相关 / Workspace file props
  workspaceFiles: WorkspaceFileInfo[];
  workspaceDir: string;
  workspaceAgentId: string;
  workspaceAgents: WorkspaceAgentOption[];
  workspaceSelectedFile: string | null;
  workspaceEditorContent: string;
  workspaceOriginalContent: string;
  workspaceLoading: boolean;
  workspaceSaving: boolean;
  workspaceError: string | null;
  workspaceEditorMode: "edit" | "preview" | "split";
  onWorkspaceFileSelect: (fileName: string) => void;
  onWorkspaceContentChange: (content: string) => void;
  onWorkspaceFileSave: () => void;
  onWorkspaceRefresh: () => void;
  onWorkspaceModeChange: (mode: "edit" | "preview" | "split") => void;
  onWorkspaceFileCreate: (fileName: string) => void;
  onWorkspaceAgentChange: (agentId: string) => void;
  expandedFolders?: Set<string>;
  onFolderToggle?: (folderName: string) => void;

  // 权限管理相关 / Permissions props
  permissionsLoading: boolean;
  permissionsSaving: boolean;
  permissionsDirty: boolean;
  permissionsActiveTab: PermissionsTabId;
  onPermissionsTabChange: (tab: PermissionsTabId) => void;
  execApprovalsSnapshot: ExecApprovalsSnapshot | null;
  execApprovalsForm: ExecApprovalsFile | null;
  permissionsSelectedAgent: string | null;
  permissionsAgents: AgentOption[];
  onPermissionsLoad: () => void;
  onPermissionsSave: () => void;
  onPermissionsSelectAgent: (agentId: string | null) => void;
  onPermissionsAddAgent: (agentId: string) => void;
  onPermissionsRemoveAgent: (agentId: string) => void;
  onPermissionsPatch: (path: string, value: unknown) => void;
  onPermissionsRemove: (path: string) => void;
  onPermissionsAddAllowlistEntry: (agentId: string | null) => void;
  onPermissionsRemoveAllowlistEntry: (agentId: string | null, index: number) => void;
  // Exec Approvals 目标选择 / Exec approvals target selection
  execTarget: ExecApprovalsTarget;
  execTargetNodeId: string | null;
  execTargetNodes: ExecApprovalsTargetNode[];
  onExecTargetChange: (target: ExecApprovalsTarget, nodeId: string | null) => void;

  // 工具权限相关 / Tools permissions props
  toolsConfig: ToolsConfig | null;
  agentToolsConfigs: AgentWithTools[];
  toolsAgents: AgentOption[];
  toolsSelectedAgent: string | null;
  toolsExpanded: boolean;
  onToolsSelectAgent: (agentId: string | null) => void;
  onToolsToggleExpanded: () => void;
  onToolsUpdateGlobal: (field: keyof ToolPolicyConfig, value: unknown) => void;
  onToolsUpdateAgent: (agentId: string, field: keyof ToolPolicyConfig, value: unknown) => void;
  onToolsAddGlobalDeny: (entry: string) => void;
  onToolsRemoveGlobalDeny: (entry: string) => void;
  onToolsAddAgentDeny: (agentId: string, entry: string) => void;
  onToolsRemoveAgentDeny: (agentId: string, entry: string) => void;
  onToolsToggleDeny: (tool: string, denied: boolean) => void;

  // 回调函数
  onReload: () => void;
  onSave: () => void;
  onApply: () => void;
  onProviderToggle: (key: string) => void;
  onProviderAdd: () => void;
  onProviderRemove: (key: string) => void;
  onProviderRename: (oldKey: string, newKey: string) => void;
  onProviderUpdate: (key: string, field: string, value: unknown) => void;
  onModelAdd: (providerKey: string) => void;
  onModelRemove: (providerKey: string, modelIndex: number) => void;
  onModelUpdate: (providerKey: string, modelIndex: number, field: string, value: unknown) => void;
  onAgentDefaultsUpdate: (path: string[], value: unknown) => void;
  onGatewayUpdate: (path: string[], value: unknown) => void;
  onNavigateToChannels: () => void;
  onChannelSelect: (channelId: string) => void;
  onChannelConfigUpdate: (channelId: string, field: string, value: unknown) => void;

  // 技能管理相关 / Skills management props
  skillsLoading: boolean;
  skillsSaving: boolean;
  skillsError: string | null;
  skillsReport: SkillStatusReport | null;
  skillsConfig: SkillsConfig | null;
  skillsHasChanges: boolean;
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
  onSkillsEnvChange?: (skillKey: string, envKey: string, value: string) => void;
  onSkillsEnvRemove?: (skillKey: string, envKey: string) => void;
  onSkillsConfigChange?: (skillKey: string, config: Record<string, unknown>) => void;
  onSkillsExtraDirsChange?: (dirs: string[]) => void;

  // Phase 5-6: 编辑器相关状态 / Editor related state
  skillsEditorState: SkillEditorState;
  skillsCreateState: SkillCreateState;
  skillsDeleteState: SkillDeleteState;
  // Phase 5-6: 编辑器相关回调 / Editor related callbacks
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

  // 定时任务相关 / Cron management props
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
  // 定时任务回调
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

  // Agent-centric 配置视图相关 / Agents config view props
  agentsConfigProps?: AgentsConfigProps;
};

// ─────────────────────────────────────────────────────────────────────────────
// 渲染函数 / Render Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 主渲染函数 - Agent-centric 配置视图
 * Main render function - Agent-centric config view
 */
export function renderModelConfig(props: ModelConfigProps) {
  // 直接渲染 Agent-centric 视图
  // Directly render Agent-centric view
  if (props.agentsConfigProps) {
    return html`
      <div class="mc-layout mc-layout--full">
        ${renderAgentsConfig(props.agentsConfigProps)}
      </div>
    `;
  }

  // 若未提供 agentsConfigProps，显示占位内容
  // Show placeholder if agentsConfigProps not provided
  return html`
    <div class="mc-layout mc-layout--full">
      <div class="mc-section">
        <div class="mc-section__header">
          <h2 class="mc-section__title">配置管理</h2>
          <p class="mc-section__desc">正在加载配置数据...</p>
        </div>
      </div>
    </div>
  `;
}
