/**
 * Cron 状态卡片组件
 * Cron status card component
 */
import { html } from "lit";
import type { CronContentProps } from "../../types/cron-config";
import { formatNextRun } from "../../../ui/presenter";
import { LABELS } from "./constants";

/**
 * 渲染调度器状态卡片
 * Render scheduler status card
 */
export function renderStatusCard(props: CronContentProps) {
  const status = props.status;
  return html`
    <div class="cron-status-card">
      <div class="cron-status-card__item">
        <div class="cron-status-card__label">${LABELS.schedulerStatus}</div>
        <div class="cron-status-card__value ${status?.enabled ? "cron-status-card__value--ok" : ""}">
          ${status ? (status.enabled ? LABELS.enabled : LABELS.disabled) : "—"}
        </div>
      </div>
      <div class="cron-status-card__item">
        <div class="cron-status-card__label">${LABELS.jobCount}</div>
        <div class="cron-status-card__value">
          ${status ? LABELS.nJobs(status.jobs ?? 0) : "—"}
        </div>
      </div>
      <div class="cron-status-card__item">
        <div class="cron-status-card__label">${LABELS.nextWake}</div>
        <div class="cron-status-card__value" style="font-size: 14px;">
          ${formatNextRun(status?.nextWakeAtMs ?? null)}
        </div>
      </div>
    </div>
  `;
}
