/**
 * 模型配置核心状态定义
 * Model config core state definitions
 *
 * 包含所有状态类型定义和初始状态创建函数
 * Contains all state type definitions and initial state creation functions
 */
import type { GatewayBrowserClient } from "../../ui/gateway";
import type { CronJob, CronStatus, CronRunLogEntry, ChannelUiMetaEntry } from "../../ui/types";
import type { CronFormState } from "../../ui/ui-types";
import { DEFAULT_CRON_FORM } from "../../ui/app-defaults";
import type {
  ProviderConfig,
  AgentDefaults,
  GatewayConfig,
} from "../views/model-config";
import type { ChannelsConfigData } from "../types/channel-config";
import type { ProviderFormState } from "../components/providers-content";
import type {
  ExecApprovalsSnapshot,
  ExecApprovalsFile,
  ExecApprovalsAllowlistEntry,
  AgentOption,
} from "../components/permissions-content";
import type { WorkspaceFileInfo } from "../components/workspace-content";

// 重新导出权限相关类型 / Re-export permission types
export type {
  ExecApprovalsSnapshot,
  ExecApprovalsFile,
  ExecApprovalsAllowlistEntry,
  AgentOption,
} from "../components/permissions-content";

// 重新导出工作区文件类型 / Re-export workspace file types
export type { WorkspaceFileInfo } from "../components/workspace-content";

// ============================================
// 会话相关类型
// ============================================

export type SessionRow = {
  key: string;
  kind: "direct" | "group" | "global" | "unknown";
  label?: string;
  displayName?: string;
  updatedAt: number | null;
  model?: string;
  modelProvider?: string;
  thinkingLevel?: string;
};

export type SessionsListResult = {
  ts: number;
  path: string;
  count: number;
  defaults: {
    modelProvider: string | null;
    model: string | null;
  };
  sessions: SessionRow[];
};

// ============================================
// 工具权限类型定义
// ============================================

export type ToolProfileId = "minimal" | "coding" | "messaging" | "full";

export type ToolPolicyConfig = {
  profile?: ToolProfileId;
  allow?: string[];
  alsoAllow?: string[];
  deny?: string[];
};

export type ToolsConfig = ToolPolicyConfig & {
  // 其他工具配置字段可以后续扩展
};

export type AgentToolsConfig = ToolPolicyConfig;

// 每个 Agent 的工具配置
export type AgentWithTools = {
  id: string;
  name?: string;
  default?: boolean;
  tools?: AgentToolsConfig;
};

export type PermissionsTabId = "exec" | "tools";

// ============================================
// Agent 身份配置类型
// ============================================

export type AgentIdentityConfig = {
  name?: string;
  theme?: string;
  emoji?: string;
  avatar?: string;
};

export type AgentIdentityEntry = {
  id: string;
  name?: string;
  default?: boolean;
  workspace?: string;
  identity?: AgentIdentityConfig;
  model?: string | { primary?: string; fallbacks?: string[] };
};

// ============================================
// 核心状态类型
// ============================================

export type ModelConfigState = {
  client: GatewayBrowserClient | null;
  connected: boolean;
  lastError: string | null;

  // 模型配置数据
  modelConfigLoading: boolean;
  modelConfigSaving: boolean;
  modelConfigApplying: boolean;
  modelConfigProviders: Record<string, ProviderConfig>;
  modelConfigAgentDefaults: AgentDefaults;
  modelConfigGateway: GatewayConfig;
  modelConfigExpandedProviders: Set<string>;
  modelConfigOriginal: {
    providers: Record<string, ProviderConfig>;
    agentDefaults: AgentDefaults;
    gateway: GatewayConfig;
    channels: ChannelsConfigData | null;
  } | null;
  // 完整配置快照（用于保存）
  modelConfigFullSnapshot: Record<string, unknown> | null;
  modelConfigHash: string | null;
  // 通道配置
  modelConfigChannelsConfig: ChannelsConfigData | null;
  modelConfigSelectedChannel: string | null;

  // 会话管理状态 (用于 Agent 设置页)
  agentSessionsLoading: boolean;
  agentSessionsResult: SessionsListResult | null;
  agentSessionsError: string | null;

  // 权限管理状态
  permissionsLoading: boolean;
  permissionsSaving: boolean;
  permissionsDirty: boolean;
  execApprovalsSnapshot: ExecApprovalsSnapshot | null;
  execApprovalsForm: ExecApprovalsFile | null;
  permissionsSelectedAgent: string | null;
  permissionsActiveTab: PermissionsTabId;

  // 工具权限状态
  toolsConfig: ToolsConfig | null;
  toolsConfigOriginal: ToolsConfig | null;
  agentToolsConfigs: AgentWithTools[];
  agentToolsConfigsOriginal: AgentWithTools[];
  toolsSelectedAgent: string | null;  // null = 全局, string = agent id
  toolsExpanded: boolean;

  // Agent 身份配置状态 / Agent identity config state
  modelConfigAgentsList: AgentIdentityEntry[];
  modelConfigAgentsListOriginal: AgentIdentityEntry[];
  modelConfigSelectedAgentId: string | null;

  // 工作区文件状态 / Workspace file state
  workspaceFiles: WorkspaceFileInfo[];
  workspaceDir: string;
  workspaceAgentId: string;
  workspaceSelectedFile: string | null;
  workspaceEditorContent: string;
  workspaceOriginalContent: string;
  workspaceLoading: boolean;
  workspaceSaving: boolean;
  workspaceError: string | null;
  workspaceEditorMode: "edit" | "preview" | "split";

  // 定时任务状态 / Cron state
  cronLoading: boolean;
  cronBusy: boolean;
  cronError: string | null;
  cronStatus: CronStatus | null;
  cronJobs: CronJob[];
  cronForm: CronFormState;
  cronChannels: string[];
  cronChannelLabels: Record<string, string>;
  cronChannelMeta: ChannelUiMetaEntry[];
  cronRunsJobId: string | null;
  cronRuns: CronRunLogEntry[];
  cronExpandedJobId: string | null;
  cronDeleteConfirmJobId: string | null;

  // 添加供应商弹窗状态 / Add provider modal state
  addProviderModalShow: boolean;
  addProviderForm: ProviderFormState;
  addProviderError: string | null;
};

/**
 * 创建初始 ModelConfigState
 * Create initial ModelConfigState
 */
export function createInitialModelConfigState(): ModelConfigState {
  return {
    client: null,
    connected: false,
    lastError: null,

    // 模型配置数据
    modelConfigLoading: false,
    modelConfigSaving: false,
    modelConfigApplying: false,
    modelConfigProviders: {},
    modelConfigAgentDefaults: {},
    modelConfigGateway: {},
    modelConfigExpandedProviders: new Set(),
    modelConfigOriginal: null,
    modelConfigFullSnapshot: null,
    modelConfigHash: null,
    modelConfigChannelsConfig: null,
    modelConfigSelectedChannel: null,

    // 会话管理状态
    agentSessionsLoading: false,
    agentSessionsResult: null,
    agentSessionsError: null,

    // 权限管理状态
    permissionsLoading: false,
    permissionsSaving: false,
    permissionsDirty: false,
    execApprovalsSnapshot: null,
    execApprovalsForm: null,
    permissionsSelectedAgent: null,
    permissionsActiveTab: "exec",

    // 工具权限状态
    toolsConfig: null,
    toolsConfigOriginal: null,
    agentToolsConfigs: [],
    agentToolsConfigsOriginal: [],
    toolsSelectedAgent: null,
    toolsExpanded: true,

    // Agent 身份配置状态
    modelConfigAgentsList: [],
    modelConfigAgentsListOriginal: [],
    modelConfigSelectedAgentId: null,

    // 工作区文件状态
    workspaceFiles: [],
    workspaceDir: "",
    workspaceAgentId: "",
    workspaceSelectedFile: null,
    workspaceEditorContent: "",
    workspaceOriginalContent: "",
    workspaceLoading: false,
    workspaceSaving: false,
    workspaceError: null,
    workspaceEditorMode: "edit",

    // 定时任务状态
    cronLoading: false,
    cronBusy: false,
    cronError: null,
    cronStatus: null,
    cronJobs: [],
    cronForm: {
      name: "",
      description: "",
      agentId: "",
      enabled: true,
      scheduleKind: "every",
      scheduleAt: "",
      everyAmount: "30",
      everyUnit: "minutes",
      cronExpr: "0 7 * * *",
      cronTz: "",
      sessionTarget: "isolated",
      wakeMode: "next-heartbeat",
      payloadKind: "agentTurn",
      payloadText: "",
      deliveryMode: "announce",
      deliveryChannel: "last",
      deliveryTo: "",
      timeoutSeconds: "",
    },
    cronChannels: [],
    cronChannelLabels: {},
    cronChannelMeta: [],
    cronRunsJobId: null,
    cronRuns: [],
    cronExpandedJobId: null,
    cronDeleteConfirmJobId: null,

    // 添加供应商弹窗状态
    addProviderModalShow: false,
    addProviderForm: {
      name: "",
      baseUrl: "",
      apiKey: "",
      api: "openai-completions",
      auth: "api-key",
    },
    addProviderError: null,
  };
}

/**
 * 初始化 Cron 默认状态
 */
export function getDefaultCronState(): Pick<
  ModelConfigState,
  | "cronLoading" | "cronBusy" | "cronError"
  | "cronStatus" | "cronJobs" | "cronForm"
  | "cronChannels" | "cronChannelLabels" | "cronChannelMeta"
  | "cronRunsJobId" | "cronRuns"
  | "cronExpandedJobId" | "cronDeleteConfirmJobId"
> {
  return {
    cronLoading: false,
    cronBusy: false,
    cronError: null,
    cronStatus: null,
    cronJobs: [],
    cronForm: { ...DEFAULT_CRON_FORM },
    cronChannels: [],
    cronChannelLabels: {},
    cronChannelMeta: [],
    cronRunsJobId: null,
    cronRuns: [],
    cronExpandedJobId: null,
    cronDeleteConfirmJobId: null,
  };
}
