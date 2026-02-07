/**
 * Cron 定时任务内容组件 - 主入口
 * Cron scheduled task content component - Main entry
 */
import { html, nothing } from "lit";
import type { CronContentProps } from "../../types/cron-config";
import { LABELS, icons } from "./constants";
import { getSafeCallbacks } from "./utils";
import { renderStatusCard } from "./status-card";
import { renderCreateModal } from "./form-fields";
import { renderJobsList } from "./job-card";
import { renderRunHistory } from "./run-history";

/**
 * 渲染删除确认弹窗
 * Render delete confirmation modal
 */
function renderDeleteConfirmModal(props: CronContentProps) {
  if (!props.deleteConfirmJobId) return nothing;

  const jobs = props.jobs ?? [];
  const job = jobs.find((j) => j.id === props.deleteConfirmJobId);
  if (!job) return nothing;

  const { onDeleteConfirm, onRemove } = getSafeCallbacks(props);

  return html`
    <div class="cron-confirm-modal" @click=${() => onDeleteConfirm(null)}>
      <div class="cron-confirm-modal__content" @click=${(e: Event) => e.stopPropagation()}>
        <div class="cron-confirm-modal__title">${LABELS.deleteConfirmTitle}</div>
        <div class="cron-confirm-modal__desc">${LABELS.deleteConfirmDesc(job.name)}</div>
        <div class="cron-confirm-modal__actions">
          <button class="mc-btn" @click=${() => onDeleteConfirm(null)}>
            ${LABELS.cancel}
          </button>
          <button
            class="mc-btn mc-btn--danger"
            ?disabled=${props.busy}
            @click=${() => {
              onRemove(job);
              onDeleteConfirm(null);
            }}
          >
            ${LABELS.confirm}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染 Cron 内容主组件
 * Render Cron content main component
 */
export function renderCronContent(props: CronContentProps) {
  const jobs = props.jobs ?? [];
  const { onRefresh, onShowCreateModal } = getSafeCallbacks(props);

  return html`
    <div class="config-content">
      <!-- 页面头部 -->
      <div class="config-content__header">
        <span class="config-content__icon">${icons.clock}</span>
        <div class="config-content__titles">
          <h2 class="config-content__title">${LABELS.title}</h2>
          <p class="config-content__desc">${LABELS.desc}</p>
        </div>
        <div style="margin-left: auto; display: flex; gap: 8px;">
          <button
            class="mc-btn"
            ?disabled=${props.loading}
            @click=${onRefresh}
          >
            ${icons.refresh}
            ${props.loading ? LABELS.refreshing : LABELS.refresh}
          </button>
          <button
            class="mc-btn mc-btn--primary"
            @click=${() => onShowCreateModal(true)}
          >
            ${icons.plus}
            ${LABELS.newJob}
          </button>
        </div>
      </div>

      <!-- 状态卡片 -->
      ${renderStatusCard(props)}

      <!-- 使用提示 -->
      <div class="cron-tip-card">
        <div class="cron-tip-card__title">${icons.alertCircle} 字段说明</div>
        <table class="cron-tip-card__table">
          <tbody>
            <tr>
              <td class="cron-tip-card__term">会话类型</td>
              <td class="cron-tip-card__def"><b>主会话</b> 在 Agent 主对话中执行，仅支持系统事件；<b>隔离会话</b> 在独立临时会话中执行，支持 Agent 执行</td>
            </tr>
            <tr>
              <td class="cron-tip-card__term">唤醒方式</td>
              <td class="cron-tip-card__def"><b>下次心跳</b> 等待下一个调度周期执行；<b>立即执行</b> 触发后马上运行</td>
            </tr>
            <tr>
              <td class="cron-tip-card__term">任务类型</td>
              <td class="cron-tip-card__def"><b>系统事件</b> 发送系统级消息；<b>Agent 执行</b> 让 Agent 处理并可投递到通道（仅隔离会话可用）</td>
            </tr>
            <tr>
              <td class="cron-tip-card__term">投递消息</td>
              <td class="cron-tip-card__def">开启后 Agent 回复将发送到选定的通道和接收者</td>
            </tr>
            <tr>
              <td class="cron-tip-card__term">回写前缀</td>
              <td class="cron-tip-card__def">隔离会话完成后将结果写回主会话时添加的前缀文本</td>
            </tr>
            <tr>
              <td class="cron-tip-card__term">调度方式</td>
              <td class="cron-tip-card__def"><b>循环间隔</b> 按固定间隔重复；<b>指定时间</b> 某时间点执行一次；<b>Cron</b> 用 cron 语法灵活定义</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 任务列表 -->
      <div class="cron-form-section">
        <div class="cron-form-section__title">
          <span>${LABELS.jobsList}</span>
          <span style="margin-left: auto; font-size: 12px; font-weight: 400; color: var(--muted);">
            ${jobs.length} 个任务
          </span>
        </div>
        ${renderJobsList(props)}
      </div>

      <!-- 运行历史 -->
      ${renderRunHistory(props)}

      <!-- 新建任务弹窗 -->
      ${renderCreateModal(props)}

      <!-- 删除确认弹窗 -->
      ${renderDeleteConfirmModal(props)}
    </div>
  `;
}
