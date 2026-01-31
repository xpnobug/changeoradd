/**
 * 模型配置控制器
 * Model config controller
 *
 * 处理模型配置页面的数据加载和保存
 * Handles loading and saving of model config page data
 */
import type { GatewayBrowserClient } from "../../ui/gateway";
import type { CronJob, CronStatus, CronRunLogEntry, ChannelUiMetaEntry } from "../../ui/types";
import type { CronFormState } from "../../ui/ui-types";
import { DEFAULT_CRON_FORM } from "../../ui/app-defaults";
import {
  loadCronStatus as loadCronStatusBase,
  loadCronJobs as loadCronJobsBase,
  addCronJob as addCronJobBase,
  toggleCronJob as toggleCronJobBase,
  runCronJob as runCronJobBase,
  removeCronJob as removeCronJobBase,
  loadCronRuns as loadCronRunsBase,
  type CronState,
} from "../../ui/controllers/cron";
import type {
  ProviderConfig,
  AgentDefaults,
  GatewayConfig,
  ModelConfig,
} from "../views/model-config";
import type { ConfigSectionId } from "../types/config-sections";
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

// 会话相关类型
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

// Agent 身份配置类型
export type AgentIdentityConfig = {
  name?: string;
  theme?: string;
  emoji?: string;
  avatar?: string;
};

// Agent 列表条目类型
export type AgentIdentityEntry = {
  id: string;
  name?: string;
  default?: boolean;
  workspace?: string;
  identity?: AgentIdentityConfig;
};

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
  // 当前选中的配置区块
  modelConfigActiveSection: ConfigSectionId;
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
 * 从配置快照中提取模型供应商数据
 */
function extractProviders(
  config: Record<string, unknown>,
): Record<string, ProviderConfig> {
  const models = config.models as Record<string, unknown> | undefined;
  if (!models) return {};

  const providers = models.providers as Record<string, unknown> | undefined;
  if (!providers) return {};

  const result: Record<string, ProviderConfig> = {};

  for (const [key, value] of Object.entries(providers)) {
    if (!value || typeof value !== "object") continue;

    const provider = value as Record<string, unknown>;
    const modelsArray = provider.models as Array<Record<string, unknown>> | undefined;

    result[key] = {
      baseUrl: (provider.baseUrl as string) ?? "",
      apiKey: (provider.apiKey as string) ?? "",
      auth: provider.auth as ProviderConfig["auth"],
      api: (provider.api as ProviderConfig["api"]) ?? "openai-completions",
      headers: provider.headers as Record<string, string> | undefined,
      models: (modelsArray ?? []).map((m) => ({
        id: (m.id as string) ?? "",
        name: (m.name as string) ?? "",
        reasoning: (m.reasoning as boolean) ?? false,
        input: (m.input as Array<"text" | "image">) ?? ["text"],
        contextWindow: (m.contextWindow as number) ?? 128000,
        maxTokens: (m.maxTokens as number) ?? 4096,
        cost: m.cost as ModelConfig["cost"],
        compat: m.compat as ModelConfig["compat"],
      })),
    };
  }

  return result;
}

/**
 * 从配置快照中提取 Agent 默认设置
 */
function extractAgentDefaults(config: Record<string, unknown>): AgentDefaults {
  const agents = config.agents as Record<string, unknown> | undefined;
  if (!agents) return {};

  const defaults = agents.defaults as Record<string, unknown> | undefined;
  if (!defaults) return {};

  return {
    maxConcurrent: defaults.maxConcurrent as number | undefined,
    subagents: defaults.subagents as AgentDefaults["subagents"],
    workspace: defaults.workspace as string | undefined,
    model: defaults.model as AgentDefaults["model"],
    contextPruning: defaults.contextPruning as AgentDefaults["contextPruning"],
    compaction: defaults.compaction as AgentDefaults["compaction"],
  };
}

/**
 * 从配置快照中提取 Gateway 配置
 */
function extractGatewayConfig(config: Record<string, unknown>): GatewayConfig {
  const gateway = config.gateway as Record<string, unknown> | undefined;
  if (!gateway) return {};

  return {
    port: gateway.port as number | undefined,
    bind: gateway.bind as string | undefined,
    auth: gateway.auth as GatewayConfig["auth"],
  };
}

/**
 * 从配置快照中提取通道配置
 */
function extractChannelsConfig(config: Record<string, unknown>): ChannelsConfigData {
  const channels = config.channels as Record<string, unknown> | undefined;
  if (!channels) return {};

  return channels as ChannelsConfigData;
}

/**
 * 从配置快照中提取全局工具配置
 */
function extractToolsConfig(config: Record<string, unknown>): ToolsConfig {
  const tools = config.tools as Record<string, unknown> | undefined;
  if (!tools) return {};

  return {
    profile: tools.profile as ToolProfileId | undefined,
    allow: tools.allow as string[] | undefined,
    alsoAllow: tools.alsoAllow as string[] | undefined,
    deny: tools.deny as string[] | undefined,
  };
}

/**
 * 从配置快照中提取每个 Agent 的工具配置
 */
function extractAgentToolsConfigs(config: Record<string, unknown>): AgentWithTools[] {
  const agents = config.agents as Record<string, unknown> | undefined;
  if (!agents) return [];

  const list = agents.list as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(list)) return [];

  return list
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => {
      const tools = entry.tools as Record<string, unknown> | undefined;
      return {
        id: (entry.id as string) ?? "",
        name: entry.name as string | undefined,
        default: entry.default as boolean | undefined,
        tools: tools ? {
          profile: tools.profile as ToolProfileId | undefined,
          allow: tools.allow as string[] | undefined,
          alsoAllow: tools.alsoAllow as string[] | undefined,
          deny: tools.deny as string[] | undefined,
        } : undefined,
      };
    })
    .filter((entry) => entry.id);
}

/**
 * 从配置快照中提取 Agent 列表（含身份信息）
 * 如果配置中没有 agents.list，则创建一个默认的 "main" agent
 */
function extractAgentsList(config: Record<string, unknown>): AgentIdentityEntry[] {
  const agents = config.agents as Record<string, unknown> | undefined;

  const list = agents?.list as Array<Record<string, unknown>> | undefined;

  // 如果有 agents.list，从中提取
  if (Array.isArray(list) && list.length > 0) {
    return list
      .filter((entry) => entry && typeof entry === "object" && entry.id)
      .map((entry) => {
        const identity = entry.identity as Record<string, unknown> | undefined;
        return {
          id: (entry.id as string) ?? "",
          name: entry.name as string | undefined,
          default: entry.default as boolean | undefined,
          workspace: entry.workspace as string | undefined,
          identity: identity ? {
            name: identity.name as string | undefined,
            theme: identity.theme as string | undefined,
            emoji: identity.emoji as string | undefined,
            avatar: identity.avatar as string | undefined,
          } : undefined,
        };
      });
  }

  // 如果没有 agents.list，创建一个默认的 "main" agent
  // 这样用户仍然可以配置默认 agent 的身份
  return [{
    id: "main",
    name: "Main Agent",
    default: true,
  }];
}

/**
 * 获取可用模型列表
 */
export function getAvailableModels(
  providers: Record<string, ProviderConfig>,
): Array<{ id: string; name: string; provider: string }> {
  const models: Array<{ id: string; name: string; provider: string }> = [];

  for (const [providerKey, provider] of Object.entries(providers)) {
    for (const model of provider.models) {
      models.push({
        id: `${providerKey}/${model.id}`,
        name: model.name,
        provider: providerKey,
      });
    }
  }

  return models;
}

/**
 * 检查配置是否有更改（包括主配置和权限配置）
 */
export function hasModelConfigChanges(state: ModelConfigState): boolean {
  // 检查权限配置是否有更改
  if (state.permissionsDirty) return true;

  // 检查工具配置是否有更改
  if (hasToolsConfigChanges(state)) return true;

  if (!state.modelConfigOriginal) return false;

  const currentJson = JSON.stringify({
    providers: state.modelConfigProviders,
    agentDefaults: state.modelConfigAgentDefaults,
    gateway: state.modelConfigGateway,
    channels: state.modelConfigChannelsConfig,
  });

  const originalJson = JSON.stringify(state.modelConfigOriginal);

  return currentJson !== originalJson;
}

/**
 * 加载模型配置
 */
export async function loadModelConfig(state: ModelConfigState): Promise<void> {
  if (!state.client || !state.connected) return;

  state.modelConfigLoading = true;
  state.lastError = null;

  try {
    const res = (await state.client.request("config.get", {})) as {
      config?: Record<string, unknown>;
      hash?: string;
    };

    const config = res.config ?? {};

    // 保存完整配置快照和 hash（用于保存时）
    state.modelConfigFullSnapshot = JSON.parse(JSON.stringify(config));
    state.modelConfigHash = res.hash ?? null;

    state.modelConfigProviders = extractProviders(config);
    state.modelConfigAgentDefaults = extractAgentDefaults(config);
    state.modelConfigGateway = extractGatewayConfig(config);
    state.modelConfigChannelsConfig = extractChannelsConfig(config);

    // 提取工具配置
    state.toolsConfig = extractToolsConfig(config);
    state.toolsConfigOriginal = JSON.parse(JSON.stringify(state.toolsConfig));
    state.agentToolsConfigs = extractAgentToolsConfigs(config);
    state.agentToolsConfigsOriginal = JSON.parse(JSON.stringify(state.agentToolsConfigs));

    // 提取 Agent 列表（含身份信息）
    state.modelConfigAgentsList = extractAgentsList(config);
    state.modelConfigAgentsListOriginal = JSON.parse(JSON.stringify(state.modelConfigAgentsList));

    // 保存原始数据用于比较
    state.modelConfigOriginal = {
      providers: JSON.parse(JSON.stringify(state.modelConfigProviders)),
      agentDefaults: JSON.parse(JSON.stringify(state.modelConfigAgentDefaults)),
      gateway: JSON.parse(JSON.stringify(state.modelConfigGateway)),
      channels: JSON.parse(JSON.stringify(state.modelConfigChannelsConfig)),
    };

    // 默认展开第一个供应商
    const providerKeys = Object.keys(state.modelConfigProviders);
    if (providerKeys.length > 0 && state.modelConfigExpandedProviders.size === 0) {
      state.modelConfigExpandedProviders = new Set([providerKeys[0]]);
    }
  } catch (err) {
    state.lastError = `加载配置失败: ${String(err)}`;
  } finally {
    state.modelConfigLoading = false;
  }
}

/**
 * 构建更新后的配置 raw 字符串
 */
function buildConfigRaw(state: ModelConfigState): string | null {
  if (!state.modelConfigFullSnapshot) {
    state.lastError = "配置快照缺失，请重新加载后再试";
    return null;
  }
  if (!state.modelConfigHash) {
    state.lastError = "配置 hash 缺失，请重新加载后再试";
    return null;
  }

  // 深度复制完整配置
  const updatedConfig = JSON.parse(JSON.stringify(state.modelConfigFullSnapshot)) as Record<string, unknown>;

  // 更新 models.providers
  if (!updatedConfig.models) {
    updatedConfig.models = {};
  }
  (updatedConfig.models as Record<string, unknown>).providers = state.modelConfigProviders;

  // 更新 agents.defaults
  if (!updatedConfig.agents) {
    updatedConfig.agents = {};
  }
  (updatedConfig.agents as Record<string, unknown>).defaults = state.modelConfigAgentDefaults;

  // 更新 gateway（合并而不是替换）
  if (!updatedConfig.gateway) {
    updatedConfig.gateway = {};
  }
  const gatewayConfig = updatedConfig.gateway as Record<string, unknown>;
  if (state.modelConfigGateway.port !== undefined) {
    gatewayConfig.port = state.modelConfigGateway.port;
  }
  if (state.modelConfigGateway.bind !== undefined) {
    gatewayConfig.bind = state.modelConfigGateway.bind;
  }
  if (state.modelConfigGateway.auth !== undefined) {
    gatewayConfig.auth = state.modelConfigGateway.auth;
  }

  // 更新 channels（合并而不是替换）
  if (state.modelConfigChannelsConfig) {
    if (!updatedConfig.channels) {
      updatedConfig.channels = {};
    }
    const channelsConfig = updatedConfig.channels as Record<string, unknown>;
    for (const [channelId, channelSettings] of Object.entries(state.modelConfigChannelsConfig)) {
      if (channelId === "defaults") {
        channelsConfig.defaults = channelSettings;
      } else if (channelSettings && typeof channelSettings === "object") {
        channelsConfig[channelId] = {
          ...(channelsConfig[channelId] as Record<string, unknown> ?? {}),
          ...channelSettings,
        };
      }
    }
  }

  // 更新 tools（全局工具配置）
  if (state.toolsConfig) {
    if (!updatedConfig.tools) {
      updatedConfig.tools = {};
    }
    const toolsConfig = updatedConfig.tools as Record<string, unknown>;
    if (state.toolsConfig.profile !== undefined) {
      toolsConfig.profile = state.toolsConfig.profile;
    } else {
      delete toolsConfig.profile;
    }
    if (state.toolsConfig.allow && state.toolsConfig.allow.length > 0) {
      toolsConfig.allow = state.toolsConfig.allow;
    } else {
      delete toolsConfig.allow;
    }
    if (state.toolsConfig.alsoAllow && state.toolsConfig.alsoAllow.length > 0) {
      toolsConfig.alsoAllow = state.toolsConfig.alsoAllow;
    } else {
      delete toolsConfig.alsoAllow;
    }
    if (state.toolsConfig.deny && state.toolsConfig.deny.length > 0) {
      toolsConfig.deny = state.toolsConfig.deny;
    } else {
      delete toolsConfig.deny;
    }
  }

  // 更新 agents.list 中每个 agent 的 tools 配置
  if (state.agentToolsConfigs.length > 0) {
    if (!updatedConfig.agents) {
      updatedConfig.agents = {};
    }
    const agentsConfig = updatedConfig.agents as Record<string, unknown>;
    const list = (agentsConfig.list ?? []) as Array<Record<string, unknown>>;

    for (const agentTools of state.agentToolsConfigs) {
      const existingAgent = list.find((a) => a.id === agentTools.id);
      if (existingAgent) {
        // 更新现有 agent 的 tools
        if (agentTools.tools) {
          if (!existingAgent.tools) {
            existingAgent.tools = {};
          }
          const tools = existingAgent.tools as Record<string, unknown>;
          if (agentTools.tools.profile !== undefined) {
            tools.profile = agentTools.tools.profile;
          } else {
            delete tools.profile;
          }
          if (agentTools.tools.allow && agentTools.tools.allow.length > 0) {
            tools.allow = agentTools.tools.allow;
          } else {
            delete tools.allow;
          }
          if (agentTools.tools.alsoAllow && agentTools.tools.alsoAllow.length > 0) {
            tools.alsoAllow = agentTools.tools.alsoAllow;
          } else {
            delete tools.alsoAllow;
          }
          if (agentTools.tools.deny && agentTools.tools.deny.length > 0) {
            tools.deny = agentTools.tools.deny;
          } else {
            delete tools.deny;
          }
        }
      }
    }
  }

  // 更新 agents.list 中每个 agent 的 identity 配置
  if (state.modelConfigAgentsList.length > 0) {
    if (!updatedConfig.agents) {
      updatedConfig.agents = {};
    }
    const agentsConfig = updatedConfig.agents as Record<string, unknown>;
    const list = (agentsConfig.list ?? []) as Array<Record<string, unknown>>;

    for (const agentIdentity of state.modelConfigAgentsList) {
      const existingAgent = list.find((a) => a.id === agentIdentity.id);
      if (existingAgent) {
        // 更新现有 agent 的 identity
        if (agentIdentity.identity && Object.keys(agentIdentity.identity).length > 0) {
          existingAgent.identity = agentIdentity.identity;
        } else {
          delete existingAgent.identity;
        }
      }
    }
  }

  return `${JSON.stringify(updatedConfig, null, 2).trimEnd()}\n`;
}

/**
 * 检查主配置是否有更改（不包括权限配置）
 */
function hasMainConfigChanges(state: ModelConfigState): boolean {
  // 检查工具配置是否有更改
  if (hasToolsConfigChanges(state)) return true;

  // 检查 Agent 身份列表是否有更改
  if (JSON.stringify(state.modelConfigAgentsList) !== JSON.stringify(state.modelConfigAgentsListOriginal)) {
    return true;
  }

  if (!state.modelConfigOriginal) return false;

  const currentJson = JSON.stringify({
    providers: state.modelConfigProviders,
    agentDefaults: state.modelConfigAgentDefaults,
    gateway: state.modelConfigGateway,
    channels: state.modelConfigChannelsConfig,
  });

  const originalJson = JSON.stringify(state.modelConfigOriginal);

  return currentJson !== originalJson;
}

/**
 * 保存模型配置（仅保存，不重启服务）
 */
export async function saveModelConfig(state: ModelConfigState): Promise<void> {
  if (!state.client || !state.connected) return;

  state.modelConfigSaving = true;
  state.lastError = null;

  try {
    // 检查主配置是否有更改
    const mainConfigChanged = hasMainConfigChanges(state);

    // 保存主配置（如果有更改）
    if (mainConfigChanged) {
      const raw = buildConfigRaw(state);
      if (!raw) {
        // 主配置保存失败，但继续尝试保存权限配置
        console.warn("主配置保存失败，继续保存权限配置");
      } else {
        await state.client.request("config.set", {
          raw,
          baseHash: state.modelConfigHash,
        });
      }
    }

    // 保存权限配置（如果有更改）
    if (state.permissionsDirty && state.execApprovalsSnapshot?.hash) {
      const file = state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? {};
      await state.client.request("exec.approvals.set", {
        file,
        baseHash: state.execApprovalsSnapshot.hash,
      });
      state.permissionsDirty = false;
    }

    // 重新加载配置以获取最新状态
    if (mainConfigChanged) {
      await loadModelConfig(state);
    }
    // 重新加载权限配置
    if (state.execApprovalsSnapshot) {
      await loadPermissions(state);
    }

  } catch (err) {
    state.lastError = `保存配置失败: ${String(err)}`;
  } finally {
    state.modelConfigSaving = false;
  }
}

/**
 * 保存并应用模型配置（保存 + 重启服务）
 */
export async function applyModelConfig(state: ModelConfigState): Promise<void> {
  if (!state.client || !state.connected) return;

  state.modelConfigApplying = true;
  state.lastError = null;

  try {
    // 保存权限配置（如果有更改，需要在 apply 之前保存）
    if (state.permissionsDirty && state.execApprovalsSnapshot?.hash) {
      const file = state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? {};
      await state.client.request("exec.approvals.set", {
        file,
        baseHash: state.execApprovalsSnapshot.hash,
      });
      state.permissionsDirty = false;
    }

    // 检查主配置是否有更改
    const mainConfigChanged = hasMainConfigChanges(state);

    // 保存并应用主配置（如果有更改）
    if (mainConfigChanged) {
      const raw = buildConfigRaw(state);
      if (!raw) {
        // 主配置保存失败
        console.warn("主配置保存失败");
      } else {
        await state.client.request("config.apply", {
          raw,
          baseHash: state.modelConfigHash,
        });
      }
    }

    // 重新加载配置以获取最新状态
    if (mainConfigChanged) {
      await loadModelConfig(state);
    }
    // 重新加载权限配置
    if (state.execApprovalsSnapshot) {
      await loadPermissions(state);
    }

  } catch (err) {
    state.lastError = `应用配置失败: ${String(err)}`;
  } finally {
    state.modelConfigApplying = false;
  }
}

/**
 * 切换供应商展开状态
 */
export function toggleProviderExpanded(state: ModelConfigState, key: string): void {
  const expanded = new Set(state.modelConfigExpandedProviders);
  if (expanded.has(key)) {
    expanded.delete(key);
  } else {
    expanded.add(key);
  }
  state.modelConfigExpandedProviders = expanded;
}

/**
 * 添加新供应商
 */
export function addProvider(state: ModelConfigState): void {
  // 生成唯一的供应商名称
  let baseName = "new-provider";
  let counter = 1;
  while (state.modelConfigProviders[baseName]) {
    baseName = `new-provider-${counter}`;
    counter++;
  }

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [baseName]: {
      baseUrl: "",
      apiKey: "",
      api: "openai-completions",
      models: [],
    },
  };

  // 展开新添加的供应商
  state.modelConfigExpandedProviders = new Set([
    ...state.modelConfigExpandedProviders,
    baseName,
  ]);
}

/**
 * 默认添加供应商表单
 */
const DEFAULT_ADD_PROVIDER_FORM: ProviderFormState = {
  name: "",
  baseUrl: "",
  apiKey: "",
  api: "openai-completions",
  auth: "api-key",
};

/**
 * 显示/隐藏添加供应商弹窗
 */
export function showAddProviderModal(state: ModelConfigState, show: boolean): void {
  state.addProviderModalShow = show;
  if (show) {
    // 打开弹窗时重置表单
    state.addProviderForm = { ...DEFAULT_ADD_PROVIDER_FORM };
    state.addProviderError = null;
  }
}

/**
 * 更新添加供应商表单
 */
export function updateAddProviderForm(
  state: ModelConfigState,
  patch: Partial<ProviderFormState>,
): void {
  state.addProviderForm = {
    ...state.addProviderForm,
    ...patch,
  };
  // 清除之前的错误
  state.addProviderError = null;
}

/**
 * 确认添加供应商
 */
export function confirmAddProvider(state: ModelConfigState): void {
  const form = state.addProviderForm;
  const name = form.name.trim();

  // 验证名称
  if (!name) {
    state.addProviderError = "请输入供应商名称";
    return;
  }

  // 检查名称是否已存在
  if (state.modelConfigProviders[name]) {
    state.addProviderError = `供应商名称 "${name}" 已存在`;
    return;
  }

  // 创建新供应商
  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [name]: {
      baseUrl: form.baseUrl,
      apiKey: form.apiKey || undefined,
      auth: form.auth,
      api: form.api,
      models: [],
    },
  };

  // 展开新添加的供应商
  state.modelConfigExpandedProviders = new Set([
    ...state.modelConfigExpandedProviders,
    name,
  ]);

  // 关闭弹窗
  state.addProviderModalShow = false;
  state.addProviderForm = { ...DEFAULT_ADD_PROVIDER_FORM };
  state.addProviderError = null;
}

/**
 * 删除供应商
 */
export function removeProvider(state: ModelConfigState, key: string): void {
  const { [key]: _, ...rest } = state.modelConfigProviders;
  state.modelConfigProviders = rest;

  // 从展开列表中移除
  const expanded = new Set(state.modelConfigExpandedProviders);
  expanded.delete(key);
  state.modelConfigExpandedProviders = expanded;
}

/**
 * 重命名供应商
 */
export function renameProvider(
  state: ModelConfigState,
  oldKey: string,
  newKey: string,
): void {
  // 验证新名称
  const trimmedKey = newKey.trim();
  if (!trimmedKey) {
    state.lastError = "供应商名称不能为空";
    return;
  }
  if (oldKey === trimmedKey) return;
  if (state.modelConfigProviders[trimmedKey]) {
    state.lastError = `供应商名称 "${trimmedKey}" 已存在`;
    return;
  }

  // 获取旧配置
  const provider = state.modelConfigProviders[oldKey];
  if (!provider) return;

  // 创建新的 providers 对象，保持顺序
  const newProviders: Record<string, ProviderConfig> = {};
  for (const [key, value] of Object.entries(state.modelConfigProviders)) {
    if (key === oldKey) {
      newProviders[trimmedKey] = value;
    } else {
      newProviders[key] = value;
    }
  }
  state.modelConfigProviders = newProviders;

  // 更新展开状态
  const expanded = new Set(state.modelConfigExpandedProviders);
  if (expanded.has(oldKey)) {
    expanded.delete(oldKey);
    expanded.add(trimmedKey);
  }
  state.modelConfigExpandedProviders = expanded;

  // 清除可能的旧错误
  if (state.lastError?.includes("供应商名称")) {
    state.lastError = null;
  }
}

/**
 * 更新供应商字段
 */
export function updateProviderField(
  state: ModelConfigState,
  key: string,
  field: string,
  value: unknown,
): void {
  const provider = state.modelConfigProviders[key];
  if (!provider) return;

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [key]: {
      ...provider,
      [field]: value,
    },
  };
}

/**
 * 添加模型到供应商
 */
export function addModel(state: ModelConfigState, providerKey: string): void {
  const provider = state.modelConfigProviders[providerKey];
  if (!provider) return;

  const newModel: ModelConfig = {
    id: "new-model",
    name: "New Model",
    reasoning: false,
    input: ["text"],
    contextWindow: 128000,
    maxTokens: 4096,
  };

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [providerKey]: {
      ...provider,
      models: [...provider.models, newModel],
    },
  };
}

/**
 * 删除模型
 */
export function removeModel(
  state: ModelConfigState,
  providerKey: string,
  modelIndex: number,
): void {
  const provider = state.modelConfigProviders[providerKey];
  if (!provider) return;

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [providerKey]: {
      ...provider,
      models: provider.models.filter((_, idx) => idx !== modelIndex),
    },
  };
}

/**
 * 更新模型字段
 */
export function updateModelField(
  state: ModelConfigState,
  providerKey: string,
  modelIndex: number,
  field: string,
  value: unknown,
): void {
  const provider = state.modelConfigProviders[providerKey];
  if (!provider || !provider.models[modelIndex]) return;

  const updatedModels = [...provider.models];
  updatedModels[modelIndex] = {
    ...updatedModels[modelIndex],
    [field]: value,
  };

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [providerKey]: {
      ...provider,
      models: updatedModels,
    },
  };
}

/**
 * 更新 Agent 默认设置
 */
export function updateAgentDefaults(
  state: ModelConfigState,
  path: string[],
  value: unknown,
): void {
  const updated = { ...state.modelConfigAgentDefaults };

  if (path.length === 1) {
    (updated as Record<string, unknown>)[path[0]] = value;
  } else if (path.length === 2) {
    const [key, subKey] = path;
    const current = (updated as Record<string, Record<string, unknown>>)[key] ?? {};
    (updated as Record<string, unknown>)[key] = {
      ...current,
      [subKey]: value,
    };
  }

  state.modelConfigAgentDefaults = updated;
}

/**
 * 更新 Gateway 配置
 */
export function updateGatewayConfig(
  state: ModelConfigState,
  path: string[],
  value: unknown,
): void {
  const updated = { ...state.modelConfigGateway };

  if (path.length === 1) {
    (updated as Record<string, unknown>)[path[0]] = value;
  } else if (path.length === 2) {
    const [key, subKey] = path;
    const current = (updated as Record<string, Record<string, unknown>>)[key] ?? {};
    (updated as Record<string, unknown>)[key] = {
      ...current,
      [subKey]: value,
    };
  }

  state.modelConfigGateway = updated;
}

/**
 * 选择要编辑身份的 Agent
 */
export function selectAgentForIdentity(
  state: ModelConfigState,
  agentId: string | null,
): void {
  state.modelConfigSelectedAgentId = agentId;
}

/**
 * 更新 Agent 身份配置
 */
export function updateAgentIdentity(
  state: ModelConfigState,
  agentId: string,
  field: keyof AgentIdentityConfig,
  value: string | undefined,
): void {
  const list = [...state.modelConfigAgentsList];
  const index = list.findIndex((a) => a.id === agentId);
  if (index === -1) return;

  const agent = { ...list[index] };
  const identity = { ...agent.identity };

  if (value) {
    identity[field] = value;
  } else {
    delete identity[field];
  }

  // 如果 identity 全空，删除整个对象
  if (Object.keys(identity).length === 0) {
    delete agent.identity;
  } else {
    agent.identity = identity;
  }

  list[index] = agent;
  state.modelConfigAgentsList = list;
}

/**
 * 切换配置区块
 */
export function setActiveSection(
  state: ModelConfigState,
  sectionId: string,
): void {
  state.modelConfigActiveSection = sectionId as ConfigSectionId;

  // 切换到权限管理时自动加载权限数据
  if (sectionId === "permissions" && !state.execApprovalsSnapshot && !state.permissionsLoading) {
    void loadPermissions(state);
  }

  // 切换到 Agent 设置时自动加载会话列表
  if (sectionId === "agent" && !state.agentSessionsResult && !state.agentSessionsLoading) {
    void loadAgentSessions(state);
  }
}

// ============================================
// 权限管理相关函数
// ============================================

/**
 * 从配置中提取 Agent 列表用于权限管理
 */
export function getPermissionsAgents(state: ModelConfigState): AgentOption[] {
  const config = state.modelConfigFullSnapshot;
  const form = state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? null;

  // 从配置中提取 agents
  const agentsNode = (config?.agents ?? {}) as Record<string, unknown>;
  const list = Array.isArray(agentsNode.list) ? agentsNode.list : [];
  const configAgents: AgentOption[] = [];

  list.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const record = entry as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id.trim() : "";
    if (!id) return;
    const name = typeof record.name === "string" ? record.name.trim() : undefined;
    const isDefault = record.default === true;
    configAgents.push({ id, name: name || undefined, isDefault });
  });

  // 从 exec approvals 中提取额外的 agents
  const approvalsAgents = Object.keys(form?.agents ?? {}).filter((id) => id !== "*");
  const merged = new Map<string, AgentOption>();
  configAgents.forEach((agent) => merged.set(agent.id, agent));
  approvalsAgents.forEach((id) => {
    if (merged.has(id)) return;
    merged.set(id, { id });
  });

  const agents = Array.from(merged.values());
  if (agents.length === 0) {
    agents.push({ id: "main", isDefault: true });
  }

  // 排序：默认 agent 在前
  agents.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    const aLabel = a.name?.trim() ? a.name : a.id;
    const bLabel = b.name?.trim() ? b.name : b.id;
    return aLabel.localeCompare(bLabel);
  });

  // 添加通配符 Agent 到最后（如果配置中存在）
  const hasWildcard = form?.agents?.["*"] != null;
  if (hasWildcard) {
    agents.push({ id: "*", name: "通配符规则" });
  }

  return agents;
}

/**
 * Exec Approvals 目标类型
 */
export type ExecApprovalsTarget = "gateway" | "node";

export type ExecApprovalsTargetNode = {
  id: string;
  label: string;
};

// 支持 Exec Approvals 的节点命令
const EXEC_APPROVALS_COMMANDS = [
  "system.execApprovals.get",
  "system.execApprovals.set",
];

/**
 * 从节点列表中筛选支持 Exec Approvals 的节点
 */
export function resolveExecApprovalsNodes(
  nodes: Array<Record<string, unknown>>,
): ExecApprovalsTargetNode[] {
  return nodes
    .filter((node) => {
      const commands = Array.isArray(node.commands) ? node.commands : [];
      return EXEC_APPROVALS_COMMANDS.some((cmd) => commands.includes(cmd));
    })
    .map((node) => {
      const nodeId = String(node.nodeId ?? "");
      const displayName = node.displayName as string | undefined;
      const label = displayName && displayName !== nodeId
        ? `${displayName} · ${nodeId}`
        : nodeId;
      return { id: nodeId, label };
    });
}

/**
 * 加载权限配置
 */
export async function loadPermissions(
  state: ModelConfigState,
  target?: { kind: "gateway" } | { kind: "node"; nodeId: string },
): Promise<void> {
  if (!state.client || !state.connected) return;
  if (state.permissionsLoading) return;

  // 如果是 node 目标，必须有 nodeId
  if (target?.kind === "node" && !target.nodeId) {
    state.lastError = "请先选择一个节点";
    return;
  }

  state.permissionsLoading = true;
  state.lastError = null;

  try {
    const rpc = target?.kind === "node"
      ? { method: "exec.approvals.node.get", params: { nodeId: target.nodeId } }
      : { method: "exec.approvals.get", params: {} };

    const res = (await state.client.request(rpc.method, rpc.params)) as ExecApprovalsSnapshot;
    state.execApprovalsSnapshot = res;
    if (!state.permissionsDirty) {
      state.execApprovalsForm = JSON.parse(JSON.stringify(res.file ?? {}));
    }
  } catch (err) {
    state.lastError = `加载权限配置失败: ${String(err)}`;
  } finally {
    state.permissionsLoading = false;
  }
}

/**
 * 添加新的 Agent 配置（包括通配符）
 */
export function addPermissionsAgent(
  state: ModelConfigState,
  agentId: string,
): void {
  const base = JSON.parse(
    JSON.stringify(state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? {}),
  ) as ExecApprovalsFile;

  if (!base.agents) {
    base.agents = {};
  }

  // 如果已存在，不重复添加
  if (base.agents[agentId]) {
    return;
  }

  // 初始化空配置
  base.agents[agentId] = {};

  state.execApprovalsForm = base;
  state.permissionsDirty = true;

  // 自动选中新添加的 Agent
  state.permissionsSelectedAgent = agentId;
}

/**
 * 删除 Agent 配置
 */
export function removePermissionsAgent(
  state: ModelConfigState,
  agentId: string,
): void {
  const base = JSON.parse(
    JSON.stringify(state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? {}),
  ) as ExecApprovalsFile;

  if (!base.agents || !base.agents[agentId]) {
    return;
  }

  delete base.agents[agentId];

  state.execApprovalsForm = base;
  state.permissionsDirty = true;

  // 如果删除的是当前选中的，切换回默认
  if (state.permissionsSelectedAgent === agentId) {
    state.permissionsSelectedAgent = null;
  }
}

/**
 * 保存权限配置
 */
export async function savePermissions(
  state: ModelConfigState,
  target?: { kind: "gateway" } | { kind: "node"; nodeId: string },
): Promise<void> {
  if (!state.client || !state.connected) return;

  // 如果是 node 目标，必须有 nodeId
  if (target?.kind === "node" && !target.nodeId) {
    state.lastError = "请先选择一个节点";
    return;
  }

  state.permissionsSaving = true;
  state.lastError = null;

  try {
    const baseHash = state.execApprovalsSnapshot?.hash;
    if (!baseHash) {
      state.lastError = "权限配置 hash 缺失，请重新加载后再试";
      return;
    }

    const file = state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? {};
    const rpc = target?.kind === "node"
      ? { method: "exec.approvals.node.set", params: { nodeId: target.nodeId, file, baseHash } }
      : { method: "exec.approvals.set", params: { file, baseHash } };

    await state.client.request(rpc.method, rpc.params);

    state.permissionsDirty = false;
    await loadPermissions(state, target);
  } catch (err) {
    state.lastError = `保存权限配置失败: ${String(err)}`;
  } finally {
    state.permissionsSaving = false;
  }
}

/**
 * 选择权限管理的 Agent
 */
export function selectPermissionsAgent(
  state: ModelConfigState,
  agentId: string | null,
): void {
  state.permissionsSelectedAgent = agentId;
}

/**
 * 切换权限管理的标签页
 */
export function setPermissionsActiveTab(
  state: ModelConfigState,
  tab: PermissionsTabId,
): void {
  state.permissionsActiveTab = tab;
}

/**
 * 更新权限配置表单值
 */
export function updatePermissionsFormValue(
  state: ModelConfigState,
  path: Array<string | number>,
  value: unknown,
): void {
  const base = JSON.parse(
    JSON.stringify(state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? {}),
  ) as ExecApprovalsFile;

  // 设置路径值
  let current: unknown = base;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current == null || typeof current !== "object") break;
    const obj = current as Record<string | number, unknown>;
    if (obj[key] == null || typeof obj[key] !== "object") {
      obj[key] = typeof path[i + 1] === "number" ? [] : {};
    }
    current = obj[key];
  }

  if (current != null && typeof current === "object") {
    const lastKey = path[path.length - 1];
    (current as Record<string | number, unknown>)[lastKey] = value;
  }

  state.execApprovalsForm = base;
  state.permissionsDirty = true;
}

/**
 * 移除权限配置表单值
 */
export function removePermissionsFormValue(
  state: ModelConfigState,
  path: Array<string | number>,
): void {
  const base = JSON.parse(
    JSON.stringify(state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? {}),
  ) as ExecApprovalsFile;

  // 移除路径值
  let current: unknown = base;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current == null || typeof current !== "object") return;
    current = (current as Record<string | number, unknown>)[key];
  }

  if (current != null && typeof current === "object") {
    const lastKey = path[path.length - 1];
    if (Array.isArray(current) && typeof lastKey === "number") {
      current.splice(lastKey, 1);
    } else {
      delete (current as Record<string | number, unknown>)[lastKey];
    }
  }

  state.execApprovalsForm = base;
  state.permissionsDirty = true;
}

/**
 * 添加允许列表条目
 */
export function addPermissionsAllowlistEntry(
  state: ModelConfigState,
  agentId: string,
): void {
  const base = JSON.parse(
    JSON.stringify(state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? {}),
  ) as ExecApprovalsFile;

  if (!base.agents) {
    base.agents = {};
  }
  if (!base.agents[agentId]) {
    base.agents[agentId] = {};
  }
  if (!base.agents[agentId].allowlist) {
    base.agents[agentId].allowlist = [];
  }

  base.agents[agentId].allowlist!.push({ pattern: "" });

  state.execApprovalsForm = base;
  state.permissionsDirty = true;
}

/**
 * 移除允许列表条目
 */
export function removePermissionsAllowlistEntry(
  state: ModelConfigState,
  agentId: string,
  index: number,
): void {
  const base = JSON.parse(
    JSON.stringify(state.execApprovalsForm ?? state.execApprovalsSnapshot?.file ?? {}),
  ) as ExecApprovalsFile;

  const allowlist = base.agents?.[agentId]?.allowlist;
  if (!allowlist || !Array.isArray(allowlist)) return;

  if (allowlist.length <= 1) {
    // 如果只剩一个条目，删除整个 allowlist
    delete base.agents![agentId].allowlist;
  } else {
    allowlist.splice(index, 1);
  }

  state.execApprovalsForm = base;
  state.permissionsDirty = true;
}

// ============================================
// 工具权限管理相关函数
// ============================================

/**
 * 检查工具配置是否有更改
 */
export function hasToolsConfigChanges(state: ModelConfigState): boolean {
  const currentGlobal = JSON.stringify(state.toolsConfig ?? {});
  const originalGlobal = JSON.stringify(state.toolsConfigOriginal ?? {});
  if (currentGlobal !== originalGlobal) return true;

  const currentAgents = JSON.stringify(state.agentToolsConfigs ?? []);
  const originalAgents = JSON.stringify(state.agentToolsConfigsOriginal ?? []);
  return currentAgents !== originalAgents;
}

/**
 * 获取工具权限管理的 Agent 列表
 */
export function getToolsAgents(state: ModelConfigState): AgentOption[] {
  const agents: AgentOption[] = state.agentToolsConfigs.map((agent) => ({
    id: agent.id,
    name: agent.name,
    isDefault: agent.default,
  }));

  // 排序：默认 agent 在前
  agents.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    const aLabel = a.name?.trim() ? a.name : a.id;
    const bLabel = b.name?.trim() ? b.name : b.id;
    return aLabel.localeCompare(bLabel);
  });

  return agents;
}

/**
 * 选择工具权限管理的作用域
 */
export function selectToolsAgent(
  state: ModelConfigState,
  agentId: string | null,
): void {
  state.toolsSelectedAgent = agentId;
}

/**
 * 切换工具列表展开状态
 */
export function toggleToolsExpanded(state: ModelConfigState): void {
  state.toolsExpanded = !state.toolsExpanded;
}

/**
 * 更新全局工具配置
 */
export function updateGlobalToolsConfig(
  state: ModelConfigState,
  field: keyof ToolPolicyConfig,
  value: unknown,
): void {
  const current = state.toolsConfig ?? {};
  state.toolsConfig = {
    ...current,
    [field]: value,
  };
}

/**
 * 更新特定 Agent 的工具配置
 */
export function updateAgentToolsConfig(
  state: ModelConfigState,
  agentId: string,
  field: keyof ToolPolicyConfig,
  value: unknown,
): void {
  const agents = [...state.agentToolsConfigs];
  const index = agents.findIndex((a) => a.id === agentId);
  if (index < 0) return;

  const agent = agents[index];
  const tools = agent.tools ?? {};
  agents[index] = {
    ...agent,
    tools: {
      ...tools,
      [field]: value,
    },
  };
  state.agentToolsConfigs = agents;
}

/**
 * 添加全局 deny 规则
 */
export function addGlobalToolsDenyEntry(state: ModelConfigState, entry: string): void {
  const current = state.toolsConfig ?? {};
  const deny = [...(current.deny ?? [])];
  if (!deny.includes(entry)) {
    deny.push(entry);
  }
  state.toolsConfig = {
    ...current,
    deny,
  };
}

/**
 * 移除全局 deny 规则
 */
export function removeGlobalToolsDenyEntry(state: ModelConfigState, entry: string): void {
  const current = state.toolsConfig ?? {};
  const deny = (current.deny ?? []).filter((d) => d !== entry);
  state.toolsConfig = {
    ...current,
    deny: deny.length > 0 ? deny : undefined,
  };
}

/**
 * 添加 Agent deny 规则
 */
export function addAgentToolsDenyEntry(
  state: ModelConfigState,
  agentId: string,
  entry: string,
): void {
  const agents = [...state.agentToolsConfigs];
  const index = agents.findIndex((a) => a.id === agentId);
  if (index < 0) return;

  const agent = agents[index];
  const tools = agent.tools ?? {};
  const deny = [...(tools.deny ?? [])];
  if (!deny.includes(entry)) {
    deny.push(entry);
  }
  agents[index] = {
    ...agent,
    tools: {
      ...tools,
      deny,
    },
  };
  state.agentToolsConfigs = agents;
}

/**
 * 移除 Agent deny 规则
 */
export function removeAgentToolsDenyEntry(
  state: ModelConfigState,
  agentId: string,
  entry: string,
): void {
  const agents = [...state.agentToolsConfigs];
  const index = agents.findIndex((a) => a.id === agentId);
  if (index < 0) return;

  const agent = agents[index];
  const tools = agent.tools ?? {};
  const deny = (tools.deny ?? []).filter((d) => d !== entry);
  agents[index] = {
    ...agent,
    tools: {
      ...tools,
      deny: deny.length > 0 ? deny : undefined,
    },
  };
  state.agentToolsConfigs = agents;
}

// ============================================
// 会话管理相关函数 (Agent 设置页)
// ============================================

/**
 * 加载会话列表
 */
export async function loadAgentSessions(state: ModelConfigState): Promise<void> {
  if (!state.client || !state.connected) return;
  if (state.agentSessionsLoading) return;

  state.agentSessionsLoading = true;
  state.agentSessionsError = null;

  try {
    const res = (await state.client.request("sessions.list", {
      limit: 50,
      includeGlobal: false,
      includeUnknown: false,
    })) as SessionsListResult | undefined;

    if (res) {
      state.agentSessionsResult = res;
    }
  } catch (err) {
    state.agentSessionsError = `加载会话列表失败: ${String(err)}`;
  } finally {
    state.agentSessionsLoading = false;
  }
}

/**
 * 更新会话模型 (per-session model override)
 */
export async function patchSessionModel(
  state: ModelConfigState,
  sessionKey: string,
  model: string | null,
): Promise<void> {
  if (!state.client || !state.connected) return;

  const params: Record<string, unknown> = { key: sessionKey };
  // 只有当 model 不是 undefined 时才添加到参数中
  params.model = model;

  try {
    await state.client.request("sessions.patch", params);
    // 重新加载会话列表 / Reload session list
    await loadAgentSessions(state);
  } catch (err) {
    state.agentSessionsError = `更新会话模型失败: ${String(err)}`;
  }
}

// ============================================================
// 工作区文件操作 / Workspace file operations
// ============================================================

/**
 * 加载工作区文件列表
 * Load workspace file list
 */
export async function loadWorkspaceFiles(state: ModelConfigState): Promise<void> {
  if (!state.client || !state.connected) return;

  state.workspaceLoading = true;
  state.workspaceError = null;

  try {
    const res = (await state.client.request("workspace.files.list", {
      agentId: state.workspaceAgentId || undefined,
    })) as {
      workspaceDir: string;
      agentId: string;
      files: WorkspaceFileInfo[];
    };

    state.workspaceFiles = res.files;
    state.workspaceDir = res.workspaceDir;
    state.workspaceAgentId = res.agentId;
  } catch (err) {
    state.workspaceError = `加载文件列表失败: ${String(err)}`;
  } finally {
    state.workspaceLoading = false;
  }
}

/**
 * 选择并读取工作区文件
 * Select and read a workspace file
 */
export async function selectWorkspaceFile(
  state: ModelConfigState,
  fileName: string,
): Promise<void> {
  if (!state.client || !state.connected) return;

  state.workspaceSelectedFile = fileName;
  state.workspaceLoading = true;
  state.workspaceError = null;

  try {
    const res = (await state.client.request("workspace.file.read", {
      fileName,
      agentId: state.workspaceAgentId || undefined,
    })) as {
      name: string;
      path: string;
      exists: boolean;
      content: string;
    };

    state.workspaceEditorContent = res.content;
    state.workspaceOriginalContent = res.content;

    if (!res.exists) {
      state.workspaceError = "文件不存在，编辑后保存将自动创建";
    }
  } catch (err) {
    state.workspaceError = `读取文件失败: ${String(err)}`;
  } finally {
    state.workspaceLoading = false;
  }
}

/**
 * 保存当前工作区文件
 * Save current workspace file
 */
export async function saveWorkspaceFile(state: ModelConfigState): Promise<void> {
  if (!state.client || !state.connected || !state.workspaceSelectedFile) return;

  state.workspaceSaving = true;
  state.workspaceError = null;

  try {
    await state.client.request("workspace.file.write", {
      fileName: state.workspaceSelectedFile,
      content: state.workspaceEditorContent,
      agentId: state.workspaceAgentId || undefined,
    });

    // 保存成功后更新原始内容 / Update original content after save
    state.workspaceOriginalContent = state.workspaceEditorContent;

    // 刷新文件列表 / Refresh file list
    await loadWorkspaceFiles(state);
  } catch (err) {
    state.workspaceError = `保存文件失败: ${String(err)}`;
  } finally {
    state.workspaceSaving = false;
  }
}

/**
 * 创建新的工作区文件（设置空内容，等待用户编辑后保存）
 * Create new workspace file (set empty content, wait for user to edit and save)
 */
export function createWorkspaceFile(
  state: ModelConfigState,
  fileName: string,
): void {
  state.workspaceSelectedFile = fileName;
  state.workspaceEditorContent = "";
  state.workspaceOriginalContent = "";
  state.workspaceError = "文件不存在，编辑后保存将自动创建";
}

// ============================================
// 定时任务 Cron 控制函数
// ============================================

/**
 * 获取 CronState 适配器（将 ModelConfigState 映射到 CronState）
 */
function getCronStateAdapter(state: ModelConfigState): CronState {
  return {
    get client() { return state.client; },
    set client(v) { state.client = v; },
    get connected() { return state.connected; },
    set connected(v) { state.connected = v; },
    get cronLoading() { return state.cronLoading; },
    set cronLoading(v) { state.cronLoading = v; },
    get cronJobs() { return state.cronJobs; },
    set cronJobs(v) { state.cronJobs = v; },
    get cronStatus() { return state.cronStatus; },
    set cronStatus(v) { state.cronStatus = v; },
    get cronError() { return state.cronError; },
    set cronError(v) { state.cronError = v; },
    get cronForm() { return state.cronForm; },
    set cronForm(v) { state.cronForm = v; },
    get cronRunsJobId() { return state.cronRunsJobId; },
    set cronRunsJobId(v) { state.cronRunsJobId = v; },
    get cronRuns() { return state.cronRuns; },
    set cronRuns(v) { state.cronRuns = v; },
    get cronBusy() { return state.cronBusy; },
    set cronBusy(v) { state.cronBusy = v; },
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

/**
 * 加载 Cron 数据（状态 + 任务列表）
 */
export async function loadCronData(state: ModelConfigState): Promise<void> {
  const adapter = getCronStateAdapter(state);
  await Promise.all([
    loadCronStatusBase(adapter),
    loadCronJobsBase(adapter),
  ]);
}

/**
 * 添加 Cron 任务
 */
export async function addCronJob(state: ModelConfigState): Promise<void> {
  await addCronJobBase(getCronStateAdapter(state));
}

/**
 * 切换 Cron 任务启用/禁用
 */
export async function toggleCronJob(
  state: ModelConfigState,
  job: CronJob,
  enabled: boolean,
): Promise<void> {
  await toggleCronJobBase(getCronStateAdapter(state), job, enabled);
}

/**
 * 立即运行 Cron 任务
 */
export async function runCronJob(state: ModelConfigState, job: CronJob): Promise<void> {
  await runCronJobBase(getCronStateAdapter(state), job);
}

/**
 * 删除 Cron 任务
 */
export async function removeCronJob(state: ModelConfigState, job: CronJob): Promise<void> {
  await removeCronJobBase(getCronStateAdapter(state), job);
}

/**
 * 加载 Cron 任务运行记录
 */
export async function loadCronRuns(state: ModelConfigState, jobId: string): Promise<void> {
  await loadCronRunsBase(getCronStateAdapter(state), jobId);
}

/**
 * 更新 Cron 表单
 */
export function updateCronForm(state: ModelConfigState, patch: Partial<CronFormState>): void {
  state.cronForm = { ...state.cronForm, ...patch };
}

/**
 * 展开/折叠 Cron 任务详情
 */
export function expandCronJob(state: ModelConfigState, jobId: string | null): void {
  state.cronExpandedJobId = jobId;
}

/**
 * 设置/清除删除确认
 */
export function setCronDeleteConfirm(state: ModelConfigState, jobId: string | null): void {
  state.cronDeleteConfirmJobId = jobId;
}

/**
 * 更新 Cron 通道数据（从 channels snapshot 中获取）
 */
export function updateCronChannels(
  state: ModelConfigState,
  channels: string[],
  channelLabels: Record<string, string>,
  channelMeta: ChannelUiMetaEntry[],
): void {
  state.cronChannels = channels;
  state.cronChannelLabels = channelLabels;
  state.cronChannelMeta = channelMeta;
}

