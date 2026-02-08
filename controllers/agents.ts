/**
 * Agent 管理控制器
 * Agent management controller
 *
 * 处理 Agent 身份、模型配置等操作
 * Handles agent identity, model config operations
 */
import type { ModelConfigState, AgentIdentityConfig, AgentIdentityEntry } from "./state";

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
 * 更新 Agent 的主模型配置
 * Update agent's primary model config
 */
export function updateAgentModel(
  state: ModelConfigState,
  agentId: string,
  modelId: string | null,
): void {
  if (!state.modelConfigFullSnapshot) {
    console.warn("[updateAgentModel] modelConfigFullSnapshot 为空");
    return;
  }

  // 深度复制配置
  const config = JSON.parse(JSON.stringify(state.modelConfigFullSnapshot)) as Record<string, unknown>;
  const agents = (config.agents ?? {}) as Record<string, unknown>;
  const list = (agents.list ?? []) as Array<Record<string, unknown>>;

  // 查找目标 agent
  const agentIndex = list.findIndex((a) => a.id === agentId);
  if (agentIndex === -1) {
    console.warn("[updateAgentModel] 未找到 agent:", agentId);
    return;
  }

  const agent = list[agentIndex];

  if (!modelId) {
    // 清除模型配置，使用默认值
    delete agent.model;
  } else {
    // 保留 fallbacks 如果有的话
    const existing = agent.model;
    if (existing && typeof existing === "object" && !Array.isArray(existing)) {
      const record = existing as Record<string, unknown>;
      const fallbacks = record.fallbacks;
      if (Array.isArray(fallbacks) && fallbacks.length > 0) {
        agent.model = { primary: modelId, fallbacks };
      } else {
        agent.model = modelId;
      }
    } else {
      agent.model = modelId;
    }
  }

  // 更新配置快照（触发 UI 重新渲染）
  state.modelConfigFullSnapshot = config;

  // 同步更新 modelConfigAgentsList 以便正确检测变更
  state.modelConfigAgentsList = list.map((a) => ({
    id: a.id as string,
    name: a.name as string | undefined,
    default: a.default as boolean | undefined,
    workspace: a.workspace as string | undefined,
    identity: a.identity as AgentIdentityConfig | undefined,
    model: a.model as string | { primary?: string; fallbacks?: string[] } | undefined,
  }));

  console.log("[updateAgentModel] 已更新 agent", agentId, "模型为", modelId);
}

/**
 * 更新 Agent 的备选模型配置
 * Update agent's fallback models config
 */
export function updateAgentModelFallbacks(
  state: ModelConfigState,
  agentId: string,
  fallbacks: string[],
): void {
  if (!state.modelConfigFullSnapshot) return;

  // 深度复制配置
  const config = JSON.parse(JSON.stringify(state.modelConfigFullSnapshot)) as Record<string, unknown>;
  const agents = (config.agents ?? {}) as Record<string, unknown>;
  const list = (agents.list ?? []) as Array<Record<string, unknown>>;

  // 查找目标 agent
  const agentIndex = list.findIndex((a) => a.id === agentId);
  if (agentIndex === -1) return;

  const agent = list[agentIndex];

  // 获取当前主模型
  const existing = agent.model;
  let primary: string | null = null;

  if (typeof existing === "string") {
    primary = existing.trim() || null;
  } else if (existing && typeof existing === "object" && !Array.isArray(existing)) {
    const record = existing as Record<string, unknown>;
    if (typeof record.primary === "string") {
      primary = record.primary.trim() || null;
    }
  }

  if (fallbacks.length === 0) {
    // 没有备选模型，使用简单字符串或清除
    if (primary) {
      agent.model = primary;
    } else {
      delete agent.model;
    }
  } else {
    // 有备选模型，使用对象格式
    if (primary) {
      agent.model = { primary, fallbacks };
    } else {
      agent.model = { fallbacks };
    }
  }

  // 更新配置快照
  state.modelConfigFullSnapshot = config;
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
 * 设置默认 Agent
 * Set default agent
 *
 * 将指定的 Agent 设为默认，其他 Agent 取消默认标记
 * Set the specified agent as default, remove default flag from others
 */
export function setDefaultAgent(
  state: ModelConfigState,
  agentId: string,
): void {
  if (!state.modelConfigFullSnapshot) {
    console.warn("[setDefaultAgent] modelConfigFullSnapshot 为空");
    return;
  }

  // 深度复制配置
  const config = JSON.parse(JSON.stringify(state.modelConfigFullSnapshot)) as Record<string, unknown>;
  const agents = (config.agents ?? {}) as Record<string, unknown>;
  const list = (agents.list ?? []) as Array<Record<string, unknown>>;

  // 查找目标 agent
  const targetIndex = list.findIndex((a) => a.id === agentId);
  if (targetIndex === -1) {
    console.warn("[setDefaultAgent] 未找到 agent:", agentId);
    return;
  }

  // 遍历所有 agent，设置/取消 default 标记
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === agentId) {
      list[i].default = true;
    } else {
      delete list[i].default;
    }
  }

  // 更新配置
  agents.list = list;
  config.agents = agents;
  state.modelConfigFullSnapshot = config;

  // 同步更新 modelConfigAgentsList
  state.modelConfigAgentsList = list.map((a) => ({
    id: (a.id as string) ?? "",
    name: a.name as string | undefined,
    default: a.default as boolean | undefined,
    workspace: a.workspace as string | undefined,
    identity: a.identity as AgentIdentityConfig | undefined,
    model: a.model as string | { primary?: string; fallbacks?: string[] } | undefined,
  }));
}

/**
 * 从配置快照中提取 Agent 列表（含身份信息）
 * 如果配置中没有 agents.list，则创建一个默认的 "main" agent
 */
export function extractAgentsList(config: Record<string, unknown>): AgentIdentityEntry[] {
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
          model: entry.model as string | { primary?: string; fallbacks?: string[] } | undefined,
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
 * 复制 Agent 配置
 * Duplicate agent configuration
 */
export function duplicateAgent(
  state: ModelConfigState,
  agentId: string,
): string | null {
  if (!state.modelConfigFullSnapshot) {
    console.warn("[duplicateAgent] modelConfigFullSnapshot 为空");
    return null;
  }

  const config = JSON.parse(JSON.stringify(state.modelConfigFullSnapshot)) as Record<string, unknown>;
  const agents = (config.agents ?? {}) as Record<string, unknown>;
  const list = (agents.list ?? []) as Array<Record<string, unknown>>;

  const sourceIndex = list.findIndex((a) => a.id === agentId);
  if (sourceIndex === -1) {
    console.warn("[duplicateAgent] 未找到 agent:", agentId);
    return null;
  }

  const source = list[sourceIndex];
  const newId = `${agentId}-copy-${Date.now().toString(36)}`;
  const newAgent = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    name: `${source.name || agentId} (副本)`,
  };
  delete newAgent.default;

  list.push(newAgent);
  agents.list = list;
  config.agents = agents;
  state.modelConfigFullSnapshot = config;

  state.modelConfigAgentsList = list.map((a) => ({
    id: (a.id as string) ?? "",
    name: a.name as string | undefined,
    default: a.default as boolean | undefined,
    workspace: a.workspace as string | undefined,
    identity: a.identity as AgentIdentityConfig | undefined,
    model: a.model as string | { primary?: string; fallbacks?: string[] } | undefined,
  }));

  console.log("[duplicateAgent] 已复制 agent", agentId, "为", newId);
  return newId;
}

/**
 * 导出 Agent 配置为 JSON
 * Export agent configuration as JSON
 */
export function exportAgent(
  state: ModelConfigState,
  agentId: string,
): void {
  if (!state.modelConfigFullSnapshot) {
    console.warn("[exportAgent] modelConfigFullSnapshot 为空");
    return;
  }

  const config = state.modelConfigFullSnapshot as Record<string, unknown>;
  const agents = (config.agents ?? {}) as Record<string, unknown>;
  const list = (agents.list ?? []) as Array<Record<string, unknown>>;

  const agent = list.find((a) => a.id === agentId);
  if (!agent) {
    console.warn("[exportAgent] 未找到 agent:", agentId);
    return;
  }

  const exportData = JSON.parse(JSON.stringify(agent));
  delete exportData.default;

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `agent-${agentId}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log("[exportAgent] 已导出 agent", agentId);
}

/**
 * 删除 Agent
 * Delete agent
 */
export function deleteAgent(
  state: ModelConfigState,
  agentId: string,
): boolean {
  if (!state.modelConfigFullSnapshot) {
    console.warn("[deleteAgent] modelConfigFullSnapshot 为空");
    return false;
  }

  const config = JSON.parse(JSON.stringify(state.modelConfigFullSnapshot)) as Record<string, unknown>;
  const agents = (config.agents ?? {}) as Record<string, unknown>;
  const list = (agents.list ?? []) as Array<Record<string, unknown>>;

  const index = list.findIndex((a) => a.id === agentId);
  if (index === -1) {
    console.warn("[deleteAgent] 未找到 agent:", agentId);
    return false;
  }

  const wasDefault = list[index].default;
  list.splice(index, 1);

  // 如果删除的是默认 agent，将第一个设为默认
  if (wasDefault && list.length > 0) {
    list[0].default = true;
  }

  agents.list = list;
  config.agents = agents;
  state.modelConfigFullSnapshot = config;

  state.modelConfigAgentsList = list.map((a) => ({
    id: (a.id as string) ?? "",
    name: a.name as string | undefined,
    default: a.default as boolean | undefined,
    workspace: a.workspace as string | undefined,
    identity: a.identity as AgentIdentityConfig | undefined,
    model: a.model as string | { primary?: string; fallbacks?: string[] } | undefined,
  }));

  console.log("[deleteAgent] 已删除 agent", agentId);
  return true;
}
