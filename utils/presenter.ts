/**
 * Presenter 工具函数
 * Presenter utility functions
 *
 * 本地副本，减少对 ../../ui/presenter 的依赖
 * Local copy to reduce dependency on ../../ui/presenter
 */

import { formatMs, formatAgo, formatDurationMs } from "./format";

// 定义本地 CronJob 类型（避免依赖 ../../ui/types）
export type CronJobLocal = {
  id: string;
  name: string;
  enabled: boolean;
  schedule:
    | { kind: "at"; at: string }
    | { kind: "every"; everyMs: number }
    | { kind: "cron"; expr: string; tz?: string };
  payload:
    | { kind: "systemEvent"; text: string }
    | { kind: "agentTurn"; message: string };
  delivery?: {
    mode: "none" | "deliver" | "reply";
    channel?: string;
    to?: string;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
  };
};

/**
 * 格式化下次运行时间
 */
export function formatNextRun(ms?: number | null) {
  if (!ms) {
    return "n/a";
  }
  return `${formatMs(ms)} (${formatAgo(ms)})`;
}

/**
 * 格式化 Cron 任务状态
 */
export function formatCronState(job: CronJobLocal) {
  const state = job.state ?? {};
  const next = state.nextRunAtMs ? formatMs(state.nextRunAtMs) : "n/a";
  const last = state.lastRunAtMs ? formatMs(state.lastRunAtMs) : "n/a";
  const status = state.lastStatus ?? "n/a";
  return `${status} · 下次 ${next} · 上次 ${last}`;
}

/**
 * 格式化 Cron 调度规则
 */
export function formatCronSchedule(job: CronJobLocal) {
  const s = job.schedule;
  if (s.kind === "at") {
    const atMs = Date.parse(s.at);
    return Number.isFinite(atMs) ? `定时 ${formatMs(atMs)}` : `定时 ${s.at}`;
  }
  if (s.kind === "every") {
    return `每隔 ${formatDurationMs(s.everyMs)}`;
  }
  return `Cron ${s.expr}${s.tz ? ` (${s.tz})` : ""}`;
}

/**
 * 格式化 Cron 任务载荷
 */
export function formatCronPayload(job: CronJobLocal) {
  const p = job.payload;
  if (p.kind === "systemEvent") {
    return `系统: ${p.text}`;
  }
  const base = `Agent: ${p.message}`;
  const delivery = job.delivery;
  if (delivery && delivery.mode !== "none") {
    const target =
      delivery.channel || delivery.to
        ? ` (${delivery.channel ?? "上次"}${delivery.to ? ` -> ${delivery.to}` : ""})`
        : "";
    return `${base} · ${delivery.mode}${target}`;
  }
  return base;
}
