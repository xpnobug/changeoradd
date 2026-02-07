/**
 * 工具权限配置控制器
 * Tools permission config controller
 *
 * 处理工具权限的配置操作
 * Handles tools permission configuration operations
 */
import type {
  ModelConfigState,
  ToolPolicyConfig,
  ToolProfileId,
  AgentOption,
  AgentWithTools,
} from "./state";

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

/**
 * 从配置快照中提取全局工具配置
 */
export function extractToolsConfig(config: Record<string, unknown>): ToolPolicyConfig {
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
export function extractAgentToolsConfigs(config: Record<string, unknown>): AgentWithTools[] {
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
