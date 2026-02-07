/**
 * 定时任务控制器
 * Cron job controller
 *
 * 处理定时任务的加载、创建、更新操作
 * Handles cron job loading, creation, and update operations
 */
import type { CronJob, ChannelUiMetaEntry } from "../../ui/types";
import type { CronFormState } from "../../ui/ui-types";
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
import type { ModelConfigState } from "./state";

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
