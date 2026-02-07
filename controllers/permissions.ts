/**
 * 权限管理控制器
 * Permissions management controller
 *
 * 处理执行权限的加载、保存操作
 * Handles exec approvals loading and saving operations
 */
import type {
  ModelConfigState,
  ExecApprovalsSnapshot,
  ExecApprovalsFile,
  AgentOption,
  PermissionsTabId,
} from "./state";

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
        ? displayName + " · " + nodeId
        : nodeId;
      return { id: nodeId, label };
    });
}

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
    state.lastError = "加载权限配置失败: " + String(err);
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
    state.lastError = "保存权限配置失败: " + String(err);
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
