/**
 * Cron 运行历史组件
 * Cron run history components
 */
import { html, nothing } from "lit";
import type { CronContentProps } from "../../types/cron-config";
import { formatMs } from "../../../ui/format";
import { LABELS, icons } from "./constants";

/**
 * 渲染运行记录项
 * Render run item
 */
function renderRunItem(entry: {
  ts: number;
  status: string;
  durationMs?: number;
  error?: string;
  summary?: string;
}) {
  const dotClass =
    entry.status === "ok"
      ? "cron-run-item__dot--ok"
      : entry.status === "error"
        ? "cron-run-item__dot--error"
        : "cron-run-item__dot--skipped";

  return html`
    <div class="cron-run-item">
      <div class="cron-run-item__status">
        <span class="cron-run-item__dot ${dotClass}"></span>
        <span style="font-weight: 500;">${entry.status}</span>
        ${entry.summary ? html`<span style="color: var(--muted); margin-left: 8px;">${entry.summary}</span>` : nothing}
      </div>
      <div style="text-align: right;">
        <div style="font-size: 13px;">${formatMs(entry.ts)}</div>
        ${
          entry.durationMs != null
            ? html`<div style="font-size: 12px; color: var(--muted);">${LABELS.duration}: ${entry.durationMs}ms</div>`
            : nothing
        }
        ${
          entry.error
            ? html`<div style="font-size: 12px; color: var(--danger); margin-top: 4px;">${entry.error}</div>`
            : nothing
        }
      </div>
    </div>
  `;
}

/**
 * 渲染运行历史
 * Render run history
 */
export function renderRunHistory(props: CronContentProps) {
  if (!props.runsJobId) {
    return html`
      <div class="cron-form-section">
        <div class="cron-form-section__title">
          <span>${LABELS.runHistory}</span>
        </div>
        <div class="cron-empty" style="padding: 24px;">
          <div style="font-size: 13px; color: var(--muted);">${LABELS.selectJobToViewRuns}</div>
        </div>
      </div>
    `;
  }

  const jobs = props.jobs ?? [];
  const runs = props.runs ?? [];
  const selectedJob = jobs.find((j) => j.id === props.runsJobId);
  const jobName = selectedJob?.name ?? props.runsJobId;

  return html`
    <div class="cron-form-section">
      <div class="cron-form-section__title">
        <span>${LABELS.runHistory}: ${jobName}</span>
      </div>
      ${
        runs.length === 0
          ? html`
            <div class="cron-empty" style="padding: 24px;">
              <div style="font-size: 13px; color: var(--muted);">${LABELS.noRuns}</div>
            </div>
          `
          : html`
            <div class="cron-runs-list">
              ${runs.map((entry) => renderRunItem(entry))}
            </div>
          `
      }
    </div>
  `;
}
