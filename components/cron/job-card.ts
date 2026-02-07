/**
 * Cron 任务卡片组件
 * Cron job card component
 */
import { html, nothing } from "lit";
import type { CronJob } from "../../../ui/types";
import type { CronContentProps } from "../../types/cron-config";
import { formatMs } from "../../../ui/format";
import { formatCronPayload, formatCronSchedule } from "../../../ui/presenter";
import { LABELS, icons } from "./constants";
import { getSafeCallbacks } from "./utils";

/**
 * 渲染任务状态徽章
 * Render job status badge
 */
export function renderJobBadge(job: CronJob) {
  if (job.state?.runningAtMs) {
    return html`
      <span class="cron-job-card__badge cron-job-card__badge--running">运行中</span>
    `;
  }
  if (job.enabled) {
    return html`<span class="cron-job-card__badge cron-job-card__badge--enabled">${LABELS.enabled}</span>`;
  }
  return html`<span class="cron-job-card__badge cron-job-card__badge--disabled">${LABELS.disabled}</span>`;
}

/**
 * 渲染任务详情
 * Render job details
 */
export function renderJobDetails(job: CronJob, props: CronContentProps) {
  const state = job.state;
  const lastStatusText =
    state?.lastStatus === "ok"
      ? LABELS.statusOk
      : state?.lastStatus === "error"
        ? LABELS.statusError
        : state?.lastStatus === "skipped"
          ? LABELS.statusSkipped
          : LABELS.statusNA;
  const { onToggle, onRun, onLoadRuns, onDeleteConfirm, onEdit } = getSafeCallbacks(props);

  return html`
    <div class="cron-job-card__details">
      <div class="cron-job-card__meta">
        <div class="cron-job-card__meta-item">
          <span class="cron-job-card__meta-label">${LABELS.sessionTarget}</span>
          <span class="cron-job-card__meta-value">
            ${job.sessionTarget === "main" ? LABELS.sessionMain : LABELS.sessionIsolated}
          </span>
        </div>
        <div class="cron-job-card__meta-item">
          <span class="cron-job-card__meta-label">${LABELS.wakeMode}</span>
          <span class="cron-job-card__meta-value">
            ${job.wakeMode === "now" ? LABELS.wakeModeNow : LABELS.wakeModeNextHeartbeat}
          </span>
        </div>
        <div class="cron-job-card__meta-item">
          <span class="cron-job-card__meta-label">${LABELS.lastStatus}</span>
          <span class="cron-job-card__meta-value">${lastStatusText}</span>
        </div>
        <div class="cron-job-card__meta-item">
          <span class="cron-job-card__meta-label">${LABELS.nextRun}</span>
          <span class="cron-job-card__meta-value">
            ${state?.nextRunAtMs ? formatMs(state.nextRunAtMs) : "—"}
          </span>
        </div>
        ${
          job.agentId
            ? html`
              <div class="cron-job-card__meta-item">
                <span class="cron-job-card__meta-label">Agent</span>
                <span class="cron-job-card__meta-value">${job.agentId}</span>
              </div>
            `
            : nothing
        }
        ${
          job.description
            ? html`
              <div class="cron-job-card__meta-item" style="grid-column: 1 / -1;">
                <span class="cron-job-card__meta-label">${LABELS.description}</span>
                <span class="cron-job-card__meta-value">${job.description}</span>
              </div>
            `
            : nothing
        }
      </div>

      <div class="cron-job-card__actions">
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${props.busy}
          @click=${(e: Event) => {
            e.stopPropagation();
            onEdit(job);
          }}
        >
          ${icons.edit}
          ${LABELS.editJob}
        </button>
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${props.busy}
          @click=${(e: Event) => {
            e.stopPropagation();
            onToggle(job, !job.enabled);
          }}
        >
          ${job.enabled ? LABELS.disableJob : LABELS.enableJob}
        </button>
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${props.busy}
          @click=${(e: Event) => {
            e.stopPropagation();
            onRun(job);
          }}
        >
          ${icons.play}
          ${LABELS.runNow}
        </button>
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${props.busy}
          @click=${(e: Event) => {
            e.stopPropagation();
            onLoadRuns(job.id);
          }}
        >
          ${LABELS.viewRuns}
        </button>
        <button
          class="mc-btn mc-btn--sm mc-btn--danger"
          ?disabled=${props.busy}
          @click=${(e: Event) => {
            e.stopPropagation();
            onDeleteConfirm(job.id);
          }}
        >
          ${icons.trash}
          ${LABELS.deleteJob}
        </button>
      </div>
    </div>
  `;
}

/**
 * 渲染单个任务卡片
 * Render single job card
 */
export function renderJobCard(job: CronJob, props: CronContentProps) {
  const isExpanded = props.expandedJobId === job.id;
  const isSelected = props.runsJobId === job.id;
  const { onExpandJob } = getSafeCallbacks(props);

  return html`
    <div
      class="cron-job-card ${isSelected ? "cron-job-card--selected" : ""}"
    >
      <div
        class="cron-job-card__header"
        @click=${() => onExpandJob(isExpanded ? null : job.id)}
      >
        <div class="cron-job-card__info">
          <div class="cron-job-card__name">${job.name}</div>
          <div class="cron-job-card__schedule">${formatCronSchedule(job)}</div>
          <div class="cron-job-card__payload" style="font-size: 12px; color: var(--muted); margin-top: 4px;">
            ${formatCronPayload(job)}
          </div>
        </div>
        <div class="cron-job-card__status">
          ${renderJobBadge(job)}
          <span class="cron-job-card__chevron" style="transform: rotate(${isExpanded ? "180deg" : "0deg"}); transition: transform 0.2s ease;">
            ${icons.chevronDown}
          </span>
        </div>
      </div>
      ${isExpanded ? renderJobDetails(job, props) : nothing}
    </div>
  `;
}

/**
 * 渲染任务列表
 * Render jobs list
 */
export function renderJobsList(props: CronContentProps) {
  const jobs = props.jobs ?? [];
  if (jobs.length === 0) {
    return html`
      <div class="cron-empty">
        <div class="cron-empty__icon">${icons.clock}</div>
        <div class="cron-empty__text">${LABELS.noJobs}</div>
        <div style="font-size: 13px;">${LABELS.noJobsHint}</div>
      </div>
    `;
  }

  return html`
    <div class="cron-jobs-list">
      ${jobs.map((job) => renderJobCard(job, props))}
    </div>
  `;
}
