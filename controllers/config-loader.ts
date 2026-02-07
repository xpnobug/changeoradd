/**
 * 配置加载和保存控制器
 * Config loading and saving controller
 *
 * 处理配置的加载、保存、应用操作
 * Handles config loading, saving, and applying operations
 */
import type { ModelConfigState, ToolProfileId, AgentIdentityConfig } from "./state";
import type {
  ProviderConfig,
  AgentDefaults,
  GatewayConfig,
  ModelConfig,
} from "../views/model-config";
import type { ChannelsConfigData } from "../types/channel-config";
import { deepMerge } from "../utils/deep-merge";
import { toNumberOrUndefined, sanitizeCompat } from "../utils/sanitize";
import { extractAgentsList } from "./agents";
import { extractToolsConfig, extractAgentToolsConfigs, hasToolsConfigChanges } from "./tools-config";
import { loadPermissions } from "./permissions";

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
 * 清理 providers 配置，确保数字字段是正确的类型
 * Sanitize providers config to ensure numeric fields have correct types
 */
function sanitizeProviders(providers: Record<string, ProviderConfig>): Record<string, ProviderConfig> {
  const result: Record<string, ProviderConfig> = {};
  for (const [key, provider] of Object.entries(providers)) {
    result[key] = {
      ...provider,
      models: provider.models.map((model) => ({
        ...model,
        // 确保数字字段是数字类型
        maxTokens: toNumberOrUndefined(model.maxTokens),
        contextWindow: toNumberOrUndefined(model.contextWindow),
        cost: model.cost ? {
          input: toNumberOrUndefined(model.cost.input) ?? 0,
          output: toNumberOrUndefined(model.cost.output) ?? 0,
          cacheRead: toNumberOrUndefined(model.cost.cacheRead),
          cacheWrite: toNumberOrUndefined(model.cost.cacheWrite),
        } : undefined,
        // 清理 compat 字段
        compat: model.compat ? sanitizeCompat(model.compat) : undefined,
      })),
    };
  }
  return result;
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
    state.lastError = "加载配置失败: " + String(err);
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

  // 更新 models.providers（清理数字字段类型）
  if (!updatedConfig.models) {
    updatedConfig.models = {};
  }
  (updatedConfig.models as Record<string, unknown>).providers = sanitizeProviders(state.modelConfigProviders);

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

  // 更新 channels（深度合并而不是浅合并）
  if (state.modelConfigChannelsConfig) {
    if (!updatedConfig.channels) {
      updatedConfig.channels = {};
    }
    const channelsConfig = updatedConfig.channels as Record<string, unknown>;
    for (const [channelId, channelSettings] of Object.entries(state.modelConfigChannelsConfig)) {
      if (channelId === "defaults") {
        channelsConfig.defaults = channelSettings;
      } else if (channelSettings && typeof channelSettings === "object") {
        // 使用深度合并以正确处理嵌套配置（如 markdown.mode, tools.doc 等）
        channelsConfig[channelId] = deepMerge(
          (channelsConfig[channelId] as Record<string, unknown>) ?? {},
          channelSettings as Record<string, unknown>,
        );
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

  // 清理 skills.entries 中的无效条目（字符串值应该是对象）
  // Sanitize skills.entries - entries must be objects, not strings
  if (updatedConfig.skills && typeof updatedConfig.skills === "object") {
    const skillsConfig = updatedConfig.skills as Record<string, unknown>;
    if (skillsConfig.entries && typeof skillsConfig.entries === "object") {
      const entries = skillsConfig.entries as Record<string, unknown>;
      const sanitizedEntries: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(entries)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          // 有效的对象条目，保留
          sanitizedEntries[key] = value;
        } else if (typeof value === "string") {
          // 字符串值转换为对象格式 { enabled: true }
          // 或者如果是空字符串则跳过
          if (value.trim()) {
            sanitizedEntries[key] = { enabled: true };
          }
        }
        // 其他无效值（null, undefined, array）直接跳过
      }
      if (Object.keys(sanitizedEntries).length > 0) {
        skillsConfig.entries = sanitizedEntries;
      } else {
        delete skillsConfig.entries;
      }
    }
  }

  return JSON.stringify(updatedConfig, null, 2).trimEnd() + "\n";
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

  if (currentJson !== originalJson) return true;

  // 检查 Agent 模型配置是否有更改
  if (state.modelConfigAgentsList && state.modelConfigAgentsListOriginal) {
    const agentsJson = JSON.stringify(state.modelConfigAgentsList);
    const agentsOriginalJson = JSON.stringify(state.modelConfigAgentsListOriginal);
    if (agentsJson !== agentsOriginalJson) return true;
  }

  return false;
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
 * 从错误对象中提取详细信息
 * Extract detailed information from error object
 */
function extractErrorDetails(err: unknown): string {
  if (err && typeof err === "object") {
    const errObj = err as Record<string, unknown>;
    // 检查是否有 details 字段（来自 GatewayRequestError）
    if (errObj.details && typeof errObj.details === "object") {
      const details = errObj.details as Record<string, unknown>;
      if (Array.isArray(details.issues) && details.issues.length > 0) {
        const issueMessages = details.issues.map((issue: unknown) => {
          if (issue && typeof issue === "object") {
            const i = issue as Record<string, unknown>;
            const path = Array.isArray(i.path) ? i.path.join(".") : String(i.path ?? "");
            const message = String(i.message ?? "");
            return path ? path + ": " + message : message;
          }
          return String(issue);
        });
        return issueMessages.join("; ");
      }
    }
    // 检查 message 字段
    if (typeof errObj.message === "string") {
      return errObj.message;
    }
  }
  return String(err);
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
    // 提取详细的验证错误信息
    const errorDetails = extractErrorDetails(err);
    state.lastError = "保存配置失败: " + errorDetails;
  } finally {
    state.modelConfigSaving = false;
  }
}

/**
 * 保存并应用模型配置（保存 + 重启服务）
 */
export async function applyModelConfig(state: ModelConfigState): Promise<void> {
  if (!state.client || !state.connected) return;

  // 防止重复调用
  if (state.modelConfigApplying) {
    console.warn("[applyModelConfig] 已在应用中，跳过重复调用");
    return;
  }

  console.log("[applyModelConfig] 开始应用配置");
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
        console.log("[applyModelConfig] 调用 config.apply");
        await state.client.request("config.apply", {
          raw,
          baseHash: state.modelConfigHash,
          // 立即触发重启，避免与配置文件监听器的重启冲突
          // 配置文件监听器会在检测到文件变化后也触发重启
          // 如果延迟触发，会导致两次重启
          restartDelayMs: 0,
        });
        console.log("[applyModelConfig] config.apply 完成，Gateway 将重启");
        // config.apply 会触发 Gateway 重启，不需要手动重新加载配置
        // Gateway 重启后 UI 会自动重连并重新加载数据
        // 这里直接返回，避免在重启过程中执行额外操作
        return;
      }
    }

    // 只有在没有主配置更改时才重新加载权限配置
    if (state.execApprovalsSnapshot) {
      await loadPermissions(state);
    }

  } catch (err) {
    // 提取详细的验证错误信息
    const errorDetails = extractErrorDetails(err);
    state.lastError = "应用配置失败: " + errorDetails;
  } finally {
    state.modelConfigApplying = false;
  }
}
