/**
 * 定时任务控制器
 * Cron job controller
 */
import type { CronJob, CronRunLogEntry, GatewayBrowserClient } from "../../ui/types";
import type { CronFormState } from "../types/cron-config";

/**
 * Cron 状态类型
 */
export interface CronConfigState {
  client: GatewayBrowserClient | null;
  connected: boolean;
  cronLoading: boolean;
  cronBusy: boolean;
  cronError: string | null;
  cronStatus: { enabled: boolean; nextRun?: string } | null;
  cronJobs: CronJob[];
  cronForm: CronFormState;
  cronRunsJobId: string | null;
  cronRuns: CronRunLogEntry[];
  cronExpandedJobId: string | null;
  cronDeleteConfirmJobId: string | null;
  cronShowCreateModal: boolean;
  cronEditJobId: string | null;
  cronChannels: string[];
  cronChannelLabels: Record<string, string>;
  cronChannelMeta: Array<{ id: string; label: string; detailLabel: string; systemImage?: string }>;
}

/**
 * 默认 Cron 表单
 */
export const DEFAULT_CRON_FORM: CronFormState = {
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
  payloadKind: "systemEvent",
  payloadText: "",
  deliveryMode: "none",
  deliveryChannel: "last",
  deliveryTo: "",
  timeoutSeconds: "",
  sessionTarget: "main",
  wakeMode: "next-heartbeat",
};

/**
 * 创建初始 Cron 状态
 */
export function createInitialCronState(): CronConfigState {
  return {
    client: null,
    connected: false,
    cronLoading: false,
    cronBusy: false,
    cronError: null,
    cronStatus: null,
    cronJobs: [],
    cronForm: { ...DEFAULT_CRON_FORM },
    cronRunsJobId: null,
    cronRuns: [],
    cronExpandedJobId: null,
    cronDeleteConfirmJobId: null,
    cronShowCreateModal: false,
    cronEditJobId: null,
    cronChannels: [],
    cronChannelLabels: {},
    cronChannelMeta: [],
  };
}

/**
 * 加载定时任务列表
 */
export async function loadCronJobs(state: CronConfigState): Promise<void> {
  if (!state.client || !state.connected) return;

  state.cronLoading = true;
  state.cronError = null;

  try {
    const [statusRes, jobsRes] = await Promise.all([
      state.client.request<{ enabled: boolean; nextRun?: string }>("cron.status", {}),
      state.client.request<{ jobs?: CronJob[] }>("cron.list", { includeDisabled: true }),
    ]);
    state.cronStatus = statusRes;
    state.cronJobs = jobsRes?.jobs ?? [];
  } catch (err) {
    state.cronError = `加载定时任务失败: ${String(err)}`;
  } finally {
    state.cronLoading = false;
  }
}

/**
 * 构建调度配置
 */
export function buildCronSchedule(form: CronFormState): { kind: "at"; at: string } | { kind: "every"; everyMs: number } | { kind: "cron"; expr: string; tz?: string } {
  if (form.scheduleKind === "at") {
    const ms = Date.parse(form.scheduleAt);
    if (!Number.isFinite(ms)) throw new Error("无效的运行时间");
    return { kind: "at", at: new Date(ms).toISOString() };
  }
  if (form.scheduleKind === "every") {
    const amount = parseInt(form.everyAmount, 10) || 0;
    if (amount <= 0) throw new Error("无效的间隔时间");
    const unit = form.everyUnit;
    const mult = unit === "minutes" ? 60_000 : unit === "hours" ? 3_600_000 : 86_400_000;
    return { kind: "every", everyMs: amount * mult };
  }
  const expr = form.cronExpr.trim();
  if (!expr) throw new Error("需要 Cron 表达式");
  return { kind: "cron", expr, tz: form.cronTz.trim() || undefined };
}

/**
 * 构建负载配置
 */
export function buildCronPayload(form: CronFormState): { kind: "systemEvent"; text: string } | { kind: "agentTurn"; message: string; timeoutSeconds?: number } {
  if (form.payloadKind === "systemEvent") {
    const text = form.payloadText.trim();
    if (!text) throw new Error("需要系统事件文本");
    return { kind: "systemEvent", text };
  }
  const message = form.payloadText.trim();
  if (!message) throw new Error("需要 Agent 消息");
  const payload: { kind: "agentTurn"; message: string; timeoutSeconds?: number } = {
    kind: "agentTurn",
    message,
  };
  const timeoutSeconds = parseInt(form.timeoutSeconds, 10) || 0;
  if (timeoutSeconds > 0) payload.timeoutSeconds = timeoutSeconds;
  return payload;
}

/**
 * 构建投递配置
 */
export function buildCronDelivery(form: CronFormState): { mode: "none" } | { mode: "announce"; channel: string; to?: string } {
  if (form.deliveryMode === "announce") {
    return {
      mode: "announce",
      channel: form.deliveryChannel || "last",
      to: form.deliveryTo || undefined,
    };
  }
  return { mode: "none" };
}

/**
 * 添加定时任务
 */
export async function addCronJob(state: CronConfigState): Promise<void> {
  if (!state.client || !state.connected || state.cronBusy) return;
  state.cronBusy = true;
  state.cronError = null;

  try {
    const schedule = buildCronSchedule(state.cronForm);
    const payload = buildCronPayload(state.cronForm);
    const delivery = buildCronDelivery(state.cronForm);
    const form = state.cronForm;

    const job = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      agentId: form.agentId?.trim() || undefined,
      enabled: form.enabled,
      schedule,
      sessionTarget: form.sessionTarget,
      wakeMode: form.wakeMode,
      payload,
      delivery,
    };
    if (!job.name) throw new Error("需要任务名称");

    await state.client.request("cron.add", job);
    state.cronShowCreateModal = false;
    state.cronForm = { ...DEFAULT_CRON_FORM };
    await loadCronJobs(state);
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronBusy = false;
  }
}

/**
 * 更新定时任务
 */
export async function updateCronJob(state: CronConfigState): Promise<void> {
  const jobId = state.cronEditJobId;
  if (!state.client || !state.connected || state.cronBusy || !jobId) return;
  state.cronBusy = true;
  state.cronError = null;

  try {
    const schedule = buildCronSchedule(state.cronForm);
    const payload = buildCronPayload(state.cronForm);
    const delivery = buildCronDelivery(state.cronForm);
    const form = state.cronForm;

    const patch = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      agentId: form.agentId?.trim() || undefined,
      enabled: form.enabled,
      schedule,
      sessionTarget: form.sessionTarget,
      wakeMode: form.wakeMode,
      payload,
      delivery,
    };
    if (!patch.name) throw new Error("需要任务名称");

    await state.client.request("cron.update", { id: jobId, patch });
    state.cronShowCreateModal = false;
    state.cronEditJobId = null;
    await loadCronJobs(state);
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronBusy = false;
  }
}

/**
 * 切换定时任务启用状态
 */
export async function toggleCronJob(state: CronConfigState, job: CronJob, enabled: boolean): Promise<void> {
  if (!state.client || !state.connected || state.cronBusy) return;
  state.cronBusy = true;
  state.cronError = null;

  try {
    await state.client.request("cron.update", { id: job.id, patch: { enabled } });
    await loadCronJobs(state);
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronBusy = false;
  }
}

/**
 * 立即运行定时任务
 */
export async function runCronJob(state: CronConfigState, job: CronJob): Promise<void> {
  if (!state.client || !state.connected || state.cronBusy) return;
  state.cronBusy = true;
  state.cronError = null;

  try {
    await state.client.request("cron.run", { id: job.id, mode: "force" });
    await loadCronRuns(state, job.id);
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronBusy = false;
  }
}

/**
 * 删除定时任务
 */
export async function removeCronJob(state: CronConfigState, job: CronJob): Promise<void> {
  if (!state.client || !state.connected || state.cronBusy) return;
  state.cronBusy = true;
  state.cronError = null;

  try {
    await state.client.request("cron.remove", { id: job.id });
    if (state.cronRunsJobId === job.id) {
      state.cronRunsJobId = null;
      state.cronRuns = [];
    }
    state.cronDeleteConfirmJobId = null;
    await loadCronJobs(state);
  } catch (err) {
    state.cronError = String(err);
  } finally {
    state.cronBusy = false;
  }
}

/**
 * 加载任务运行记录
 */
export async function loadCronRuns(state: CronConfigState, jobId: string): Promise<void> {
  if (!state.client || !state.connected) return;

  try {
    const res = await state.client.request<{ entries?: CronRunLogEntry[] }>("cron.runs", {
      id: jobId,
      limit: 50,
    });
    state.cronRunsJobId = jobId;
    state.cronRuns = res?.entries ?? [];
  } catch (err) {
    state.cronError = String(err);
  }
}

/**
 * 从任务填充编辑表单
 */
export function populateCronFormFromJob(state: CronConfigState, job: CronJob): void {
  const schedule = job.schedule;
  let scheduleKind: "at" | "every" | "cron" = "every";
  let scheduleAt = "";
  let everyAmount = "30";
  let everyUnit: "minutes" | "hours" | "days" = "minutes";
  let cronExpr = "0 7 * * *";
  let cronTz = "";

  if (schedule.kind === "at") {
    scheduleKind = "at";
    scheduleAt = schedule.at;
  } else if (schedule.kind === "every") {
    scheduleKind = "every";
    const ms = schedule.everyMs;
    if (ms % 86_400_000 === 0) {
      everyAmount = String(ms / 86_400_000);
      everyUnit = "days";
    } else if (ms % 3_600_000 === 0) {
      everyAmount = String(ms / 3_600_000);
      everyUnit = "hours";
    } else {
      everyAmount = String(ms / 60_000);
      everyUnit = "minutes";
    }
  } else if (schedule.kind === "cron") {
    scheduleKind = "cron";
    cronExpr = schedule.expr;
    cronTz = schedule.tz ?? "";
  }

  const payload = job.payload;
  const payloadKind = payload.kind === "systemEvent" ? "systemEvent" : "agentTurn";
  const payloadText = payload.kind === "systemEvent" ? payload.text : payload.message;

  // 解析 delivery 字段
  const delivery = job.delivery;
  const deliveryMode = delivery?.mode === "announce" ? "announce" : "none";
  const deliveryChannel = delivery?.channel ?? "last";
  const deliveryTo = delivery?.to ?? "";

  state.cronForm = {
    ...DEFAULT_CRON_FORM,
    name: job.name ?? "",
    description: job.description ?? "",
    agentId: job.agentId ?? "",
    enabled: job.enabled ?? true,
    scheduleKind,
    scheduleAt,
    everyAmount,
    everyUnit,
    cronExpr,
    cronTz,
    payloadKind,
    payloadText,
    deliveryMode,
    deliveryChannel,
    deliveryTo,
    sessionTarget: job.sessionTarget ?? "main",
    wakeMode: job.wakeMode ?? "next-heartbeat",
    timeoutSeconds: payload.timeoutSeconds ? String(payload.timeoutSeconds) : "",
  };

  state.cronEditJobId = job.id;
  state.cronShowCreateModal = true;
}
