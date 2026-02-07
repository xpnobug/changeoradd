/**
 * 会话管理控制器
 * Session management controller
 *
 * 处理会话的加载、创建、更新操作
 * Handles session loading, creation, and update operations
 */
import type { ModelConfigState, SessionsListResult } from "./state";

/**
 * 加载会话列表
 * @param state 状态对象
 * @param agentId 可选的 Agent ID，用于过滤会话
 */
export async function loadAgentSessions(state: ModelConfigState, agentId?: string): Promise<void> {
  if (!state.client || !state.connected) return;
  if (state.agentSessionsLoading) return;

  state.agentSessionsLoading = true;
  state.agentSessionsError = null;

  try {
    const params: Record<string, unknown> = {
      limit: 50,
      includeGlobal: false,
      includeUnknown: false,
    };

    // 如果指定了 agentId，添加过滤条件
    if (agentId) {
      params.agentId = agentId;
    }

    const res = (await state.client.request("sessions.list", params)) as SessionsListResult | undefined;

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
 * 更新会话模型 - 通过 sessions.patch API 直接修改
 * Update session model via sessions.patch API
 */
export async function patchSessionModel(
  state: ModelConfigState,
  sessionKey: string,
  model: string | null,
  agentId?: string,
): Promise<void> {
  if (!state.client || !state.connected) return;

  try {
    // 使用 sessions.patch API 直接修改模型
    await state.client.request("sessions.patch", {
      key: sessionKey,
      model: model || null,  // null 表示清除模型覆盖，使用默认值
    });
    // 刷新会话列表
    await loadAgentSessions(state, agentId);
  } catch (err) {
    state.agentSessionsError = `切换模型失败: ${String(err)}`;
  }
}

/**
 * 创建新会话 - 通过 sessions.patch API 创建
 * Create new session via sessions.patch API
 *
 * @param state 状态对象
 * @param agentId Agent ID
 * @param sessionName 会话名称（将作为 label）
 * @param model 可选的模型 ID
 */
export async function createSession(
  state: ModelConfigState,
  agentId: string,
  sessionName: string,
  model?: string | null,
): Promise<{ ok: boolean; key?: string; error?: string }> {
  if (!state.client || !state.connected) {
    return { ok: false, error: "未连接到 Gateway" };
  }

  // 生成会话 key: agent:<agentId>:<sessionName>
  // 将 sessionName 转换为合法的 key（移除空格和特殊字符）
  const sanitizedName = sessionName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!sanitizedName) {
    return { ok: false, error: "会话名称无效" };
  }

  const sessionKey = `agent:${agentId}:${sanitizedName}`;

  try {
    // 使用 sessions.patch API 创建会话
    const params: Record<string, unknown> = {
      key: sessionKey,
      label: sessionName.trim(),
    };

    if (model) {
      params.model = model;
    }

    await state.client.request("sessions.patch", params);

    // 刷新会话列表
    await loadAgentSessions(state, agentId);

    return { ok: true, key: sessionKey };
  } catch (err) {
    const errorMsg = `创建会话失败: ${String(err)}`;
    state.agentSessionsError = errorMsg;
    return { ok: false, error: errorMsg };
  }
}

/**
 * 删除会话
 * Delete session via sessions.delete API
 *
 * @param state 状态对象
 * @param sessionKey 会话 key
 * @param agentId 可选的 Agent ID，用于刷新列表
 * @param skipConfirm 跳过确认对话框（默认 false）
 */
export async function deleteSession(
  state: ModelConfigState,
  sessionKey: string,
  agentId?: string,
  skipConfirm = false,
): Promise<{ ok: boolean; error?: string }> {
  if (!state.client || !state.connected) {
    return { ok: false, error: "未连接到 Gateway" };
  }

  if (state.agentSessionsLoading) {
    return { ok: false, error: "正在加载中，请稍后" };
  }

  // 确认删除
  if (!skipConfirm) {
    const confirmed = window.confirm(
      `确定要删除会话 "${sessionKey}" 吗？\n\n此操作将删除会话记录并归档其对话历史。`,
    );
    if (!confirmed) {
      return { ok: false, error: "用户取消" };
    }
  }

  state.agentSessionsLoading = true;
  state.agentSessionsError = null;

  try {
    await state.client.request("sessions.delete", {
      key: sessionKey,
      deleteTranscript: true,
    });

    // 刷新会话列表
    await loadAgentSessions(state, agentId);

    return { ok: true };
  } catch (err) {
    const errorMsg = `删除会话失败: ${String(err)}`;
    state.agentSessionsError = errorMsg;
    return { ok: false, error: errorMsg };
  } finally {
    state.agentSessionsLoading = false;
  }
}
