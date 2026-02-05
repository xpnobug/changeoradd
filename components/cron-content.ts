/**
 * Cron 定时任务内容组件
 * Cron scheduled task content component
 */
import { html, nothing } from "lit";
import type { CronJob } from "../../ui/types";
import type { CronContentProps, CronFormState } from "../types/cron-config";
import { formatMs } from "../../ui/format";
import {
  formatCronPayload,
  formatCronSchedule,
  formatCronState,
  formatNextRun,
} from "../../ui/presenter";

// 中文标签 / Chinese labels
const LABELS = {
  // 页面标题
  title: "定时任务",
  desc: "配置和管理 Gateway 定时任务调度",

  // 状态卡片
  schedulerStatus: "调度器状态",
  enabled: "已启用",
  disabled: "已禁用",
  jobCount: "任务数量",
  nextWake: "下次唤醒",
  nJobs: (n: number) => `${n} 个任务`,

  // 操作按钮
  refresh: "刷新",
  refreshing: "刷新中...",

  // 表单
  newJob: "新建任务",
  name: "任务名称",
  namePlaceholder: "输入任务名称",
  description: "任务描述",
  descriptionPlaceholder: "可选：描述任务用途",
  agentId: "Agent ID",
  agentIdPlaceholder: "留空使用默认 Agent",
  enabledLabel: "启用任务",

  // 调度类型
  schedule: "调度方式",
  scheduleAt: "指定时间",
  scheduleEvery: "循环间隔",
  scheduleCron: "Cron 表达式",
  runAt: "运行时间",
  every: "每隔",
  everyUnit: "时间单位",
  minutes: "分钟",
  hours: "小时",
  days: "天",
  cronExpr: "Cron 表达式",
  cronExprPlaceholder: "0 7 * * *",
  cronTz: "时区",
  cronTzPlaceholder: "如: Asia/Shanghai",

  // 会话和唤醒
  sessionTarget: "会话类型",
  sessionMain: "主会话",
  sessionIsolated: "隔离会话",
  wakeMode: "唤醒方式",
  wakeModeNextHeartbeat: "下次心跳",
  wakeModeNow: "立即执行",

  // 负载类型
  payloadKind: "任务类型",
  payloadSystemEvent: "系统事件",
  payloadAgentTurn: "Agent 执行",
  payloadText: "消息内容",
  payloadTextPlaceholder: "输入要执行的消息或命令",

  // Agent 执行选项
  deliver: "投递消息",
  channel: "投递通道",
  channelLast: "上次活跃通道",
  to: "接收者",
  toPlaceholder: "+1555... 或 chat id",
  timeoutSeconds: "超时时间（秒）",
  postToMainPrefix: "回写前缀",
  postToMainPrefixPlaceholder: "隔离会话结果回写到主会话的前缀",

  // 提交
  addJob: "添加任务",
  adding: "添加中...",
  editJob: "编辑任务",
  updateJob: "保存修改",
  updating: "保存中...",

  // 任务列表
  jobsList: "任务列表",
  noJobs: "暂无定时任务",
  noJobsHint: "点击右上方「新建任务」按钮创建第一个定时任务",

  // 任务卡片
  enableJob: "启用",
  disableJob: "禁用",
  runNow: "立即运行",
  viewRuns: "运行记录",
  deleteJob: "删除",

  // 任务详情
  lastStatus: "上次状态",
  nextRun: "下次运行",
  lastRun: "上次运行",
  statusOk: "成功",
  statusError: "失败",
  statusSkipped: "跳过",
  statusNA: "无",

  // 运行历史
  runHistory: "运行历史",
  selectJobToViewRuns: "选择任务查看运行历史",
  noRuns: "暂无运行记录",
  duration: "耗时",

  // 删除确认
  deleteConfirmTitle: "确认删除",
  deleteConfirmDesc: (name: string) => `确定要删除任务 "${name}" 吗？此操作不可撤销。`,
  cancel: "取消",
  confirm: "确认删除",

  // 错误
  error: "错误",
};

// 图标
const icons = {
  clock: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  plus: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  edit: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  play: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  trash: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  chevronDown: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  check: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  x: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  alertCircle: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  refresh: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
};

/**
 * 默认表单状态
 */
const DEFAULT_FORM: CronFormState = {
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
  sessionTarget: "main",
  wakeMode: "next-heartbeat",
  payloadKind: "systemEvent",
  payloadText: "",
  deliveryMode: "none",
  deliveryChannel: "last",
  deliveryTo: "",
  timeoutSeconds: "",
};

// 空函数，用于回调默认值
const noop = () => {};

/**
 * 获取安全的回调函数
 */
function getSafeCallbacks(props: CronContentProps) {
  return {
    onFormChange: props.onFormChange ?? noop,
    onRefresh: props.onRefresh ?? noop,
    onAdd: props.onAdd ?? noop,
    onUpdate: props.onUpdate ?? noop,
    onToggle: props.onToggle ?? noop,
    onRun: props.onRun ?? noop,
    onRemove: props.onRemove ?? noop,
    onLoadRuns: props.onLoadRuns ?? noop,
    onExpandJob: props.onExpandJob ?? noop,
    onDeleteConfirm: props.onDeleteConfirm ?? noop,
    onShowCreateModal: props.onShowCreateModal ?? noop,
    onEdit: props.onEdit ?? noop,
  };
}

/**
 * 构建通道选项列表
 */
function buildChannelOptions(props: CronContentProps): string[] {
  const channels = props.channels ?? [];
  const options = ["last", ...channels.filter(Boolean)];
  const form = props.form ?? DEFAULT_FORM;
  const current = form.deliveryChannel?.trim();
  if (current && !options.includes(current)) {
    options.push(current);
  }
  const seen = new Set<string>();
  return options.filter((value) => {
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * 解析通道显示标签
 */
function resolveChannelLabel(props: CronContentProps, channel: string): string {
  if (channel === "last") return LABELS.channelLast;
  const meta = props.channelMeta?.find((entry) => entry.id === channel);
  if (meta?.label) return meta.label;
  return props.channelLabels?.[channel] ?? channel;
}

/**
 * 渲染调度器状态卡片
 */
function renderStatusCard(props: CronContentProps) {
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

/**
 * 渲染调度类型字段
 */
function renderScheduleFields(props: CronContentProps) {
  const form = props.form ?? DEFAULT_FORM;
  const { onFormChange } = getSafeCallbacks(props);

  return html`
    <!-- 调度类型切换 -->
    <div class="cron-schedule-tabs">
      <button
        class="cron-schedule-tab ${form.scheduleKind === "every" ? "cron-schedule-tab--active" : ""}"
        @click=${() => onFormChange({ scheduleKind: "every" })}
      >
        ${LABELS.scheduleEvery}
      </button>
      <button
        class="cron-schedule-tab ${form.scheduleKind === "at" ? "cron-schedule-tab--active" : ""}"
        @click=${() => onFormChange({ scheduleKind: "at" })}
      >
        ${LABELS.scheduleAt}
      </button>
      <button
        class="cron-schedule-tab ${form.scheduleKind === "cron" ? "cron-schedule-tab--active" : ""}"
        @click=${() => onFormChange({ scheduleKind: "cron" })}
      >
        ${LABELS.scheduleCron}
      </button>
    </div>

    <!-- 调度参数 -->
    ${form.scheduleKind === "at"
      ? html`
          <div class="mc-field">
            <label class="mc-field__label">${LABELS.runAt}</label>
            <input
              type="datetime-local"
              class="mc-input"
              .value=${form.scheduleAt}
              @input=${(e: Event) =>
                onFormChange({ scheduleAt: (e.target as HTMLInputElement).value })}
            />
          </div>
        `
      : form.scheduleKind === "every"
        ? html`
            <div class="cron-form-grid">
              <div class="mc-field">
                <label class="mc-field__label">${LABELS.every}</label>
                <input
                  type="number"
                  class="mc-input"
                  min="1"
                  .value=${form.everyAmount}
                  @input=${(e: Event) =>
                    onFormChange({ everyAmount: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="mc-field">
                <label class="mc-field__label">${LABELS.everyUnit}</label>
                <select
                  class="mc-select"
                  .value=${form.everyUnit}
                  @change=${(e: Event) =>
                    onFormChange({
                      everyUnit: (e.target as HTMLSelectElement).value as CronFormState["everyUnit"],
                    })}
                >
                  <option value="minutes">${LABELS.minutes}</option>
                  <option value="hours">${LABELS.hours}</option>
                  <option value="days">${LABELS.days}</option>
                </select>
              </div>
            </div>
          `
        : html`
            <div class="cron-form-grid">
              <div class="mc-field">
                <label class="mc-field__label">${LABELS.cronExpr}</label>
                <input
                  type="text"
                  class="mc-input"
                  placeholder=${LABELS.cronExprPlaceholder}
                  .value=${form.cronExpr}
                  @input=${(e: Event) =>
                    onFormChange({ cronExpr: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="mc-field">
                <label class="mc-field__label">${LABELS.cronTz}</label>
                <input
                  type="text"
                  class="mc-input"
                  placeholder=${LABELS.cronTzPlaceholder}
                  .value=${form.cronTz}
                  @input=${(e: Event) =>
                    onFormChange({ cronTz: (e.target as HTMLInputElement).value })}
                />
              </div>
            </div>
          `}
  `;
}

/**
 * 渲染新建/编辑任务弹窗
 */
function renderCreateModal(props: CronContentProps) {
  if (!props.showCreateModal) return nothing;

  const isEditMode = !!props.editJobId;
  const form = props.form ?? DEFAULT_FORM;
  const channelOptions = buildChannelOptions(props);
  const { onFormChange, onAdd, onUpdate, onShowCreateModal } = getSafeCallbacks(props);

  const handleClose = () => {
    onShowCreateModal(false);
  };

  const handleSubmit = async () => {
    if (isEditMode) {
      await onUpdate();
    } else {
      await onAdd();
    }
    // 成功后关闭弹窗（如果没有错误）
    if (!props.error) {
      onShowCreateModal(false);
    }
  };

  const modalTitle = isEditMode ? LABELS.editJob : LABELS.newJob;
  const submitLabel = isEditMode
    ? (props.busy ? LABELS.updating : LABELS.updateJob)
    : (props.busy ? LABELS.adding : LABELS.addJob);

  return html`
    <div class="cron-confirm-modal" @click=${handleClose}>
      <div class="cron-create-modal__content" @click=${(e: Event) => e.stopPropagation()}>
        <div class="cron-create-modal__header">
          <div class="cron-create-modal__title">
            ${isEditMode ? icons.edit : icons.clock}
            <span>${modalTitle}</span>
          </div>
          <button class="cron-create-modal__close" @click=${handleClose}>
            ${icons.x}
          </button>
        </div>

        <div class="cron-create-modal__body">
          <!-- 基本信息 -->
          <div class="cron-form-grid" style="margin-bottom: 16px;">
            <div class="mc-field">
              <label class="mc-field__label">${LABELS.name}</label>
              <input
                type="text"
                class="mc-input"
                placeholder=${LABELS.namePlaceholder}
                .value=${form.name}
                @input=${(e: Event) =>
                  onFormChange({ name: (e.target as HTMLInputElement).value })}
              />
            </div>
            <div class="mc-field">
              <label class="mc-field__label">${LABELS.description}</label>
              <input
                type="text"
                class="mc-input"
                placeholder=${LABELS.descriptionPlaceholder}
                .value=${form.description}
                @input=${(e: Event) =>
                  onFormChange({ description: (e.target as HTMLInputElement).value })}
              />
            </div>
          </div>

          <div class="cron-form-grid" style="margin-bottom: 16px;">
            <div class="mc-field">
              <label class="mc-field__label">${LABELS.agentId}</label>
              <select
                class="mc-select"
                .value=${form.agentId || props.defaultAgentId || ""}
                @change=${(e: Event) =>
                  onFormChange({ agentId: (e.target as HTMLSelectElement).value })}
              >
                <option value="">${LABELS.agentIdPlaceholder}</option>
                ${(props.agents ?? []).map(
                  (agent) =>
                    html`<option value=${agent.id}>
                      ${agent.name ?? agent.identity?.name ?? agent.id}${agent.default ? " (默认)" : ""}
                    </option>`,
                )}
              </select>
            </div>
            <div class="mc-field" style="justify-content: center;">
              <label class="mc-toggle-field">
                <span class="mc-toggle-field__label">${LABELS.enabledLabel}</span>
                <div class="mc-toggle">
                  <input
                    type="checkbox"
                    .checked=${form.enabled}
                    @change=${(e: Event) =>
                      onFormChange({ enabled: (e.target as HTMLInputElement).checked })}
                  />
                  <span class="mc-toggle__track"></span>
                </div>
              </label>
            </div>
          </div>

          <!-- 调度类型 -->
          ${renderScheduleFields(props)}

          <!-- 会话和唤醒方式 -->
          <div class="cron-form-grid" style="margin-top: 16px; margin-bottom: 16px;">
            <div class="mc-field">
              <label class="mc-field__label">${LABELS.sessionTarget}</label>
              <select
                class="mc-select"
                .value=${form.sessionTarget}
                @change=${(e: Event) => {
                  const newTarget = (e.target as HTMLSelectElement).value as CronFormState["sessionTarget"];
                  // main 会话只能使用 systemEvent 类型
                  if (newTarget === "main" && form.payloadKind === "agentTurn") {
                    onFormChange({
                      sessionTarget: newTarget,
                      payloadKind: "systemEvent",
                    });
                  } else {
                    onFormChange({ sessionTarget: newTarget });
                  }
                }}
              >
                <option value="main">${LABELS.sessionMain}</option>
                <option value="isolated">${LABELS.sessionIsolated}</option>
              </select>
            </div>
            <div class="mc-field">
              <label class="mc-field__label">${LABELS.wakeMode}</label>
              <select
                class="mc-select"
                .value=${form.wakeMode}
                @change=${(e: Event) =>
                  onFormChange({
                    wakeMode: (e.target as HTMLSelectElement).value as CronFormState["wakeMode"],
                  })}
              >
                <option value="next-heartbeat">${LABELS.wakeModeNextHeartbeat}</option>
                <option value="now">${LABELS.wakeModeNow}</option>
              </select>
            </div>
          </div>

          <!-- 任务类型 -->
          <div class="mc-field" style="margin-bottom: 16px;">
            <label class="mc-field__label">${LABELS.payloadKind}</label>
            <select
              class="mc-select"
              .value=${form.payloadKind}
              @change=${(e: Event) =>
                onFormChange({
                  payloadKind: (e.target as HTMLSelectElement).value as CronFormState["payloadKind"],
                })}
            >
              <option value="systemEvent">${LABELS.payloadSystemEvent}</option>
              <option value="agentTurn" ?disabled=${form.sessionTarget === "main"}>
                ${LABELS.payloadAgentTurn}${form.sessionTarget === "main" ? " (仅限隔离会话)" : ""}
              </option>
            </select>
          </div>

          <!-- 消息内容 -->
          <div class="mc-field" style="margin-bottom: 16px;">
            <label class="mc-field__label">${LABELS.payloadText}</label>
            <textarea
              class="mc-textarea"
              rows="3"
              placeholder=${LABELS.payloadTextPlaceholder}
              .value=${form.payloadText}
              @input=${(e: Event) =>
                onFormChange({ payloadText: (e.target as HTMLTextAreaElement).value })}
            ></textarea>
          </div>

          <!-- Agent 执行选项 -->
          ${form.payloadKind === "agentTurn"
            ? html`
                <div class="cron-form-grid" style="margin-bottom: 16px;">
                  <div class="mc-field" style="justify-content: center;">
                    <label class="mc-toggle-field">
                      <span class="mc-toggle-field__label">${LABELS.deliver}</span>
                      <div class="mc-toggle">
                        <input
                          type="checkbox"
                          ?checked=${form.deliveryMode === "announce"}
                          @change=${(e: Event) =>
                            onFormChange({ deliveryMode: (e.target as HTMLInputElement).checked ? "announce" : "none" })}
                        />
                        <span class="mc-toggle__track"></span>
                      </div>
                    </label>
                  </div>
                  <div class="mc-field">
                    <label class="mc-field__label">${LABELS.channel}</label>
                    <select
                      class="mc-select"
                      @change=${(e: Event) =>
                        onFormChange({
                          deliveryChannel: (e.target as HTMLSelectElement).value,
                        })}
                    >
                      ${channelOptions.map(
                        (channel) =>
                          html`<option value=${channel} ?selected=${(form.deliveryChannel || "last") === channel}>${resolveChannelLabel(props, channel)}</option>`,
                      )}
                    </select>
                  </div>
                </div>

                <div class="cron-form-grid" style="margin-bottom: 16px;">
                  <div class="mc-field">
                    <label class="mc-field__label">${LABELS.to}</label>
                    <input
                      type="text"
                      class="mc-input"
                      placeholder=${LABELS.toPlaceholder}
                      .value=${form.deliveryTo}
                      @input=${(e: Event) =>
                        onFormChange({ deliveryTo: (e.target as HTMLInputElement).value })}
                    />
                  </div>
                  <div class="mc-field">
                    <label class="mc-field__label">${LABELS.timeoutSeconds}</label>
                    <input
                      type="number"
                      class="mc-input"
                      min="0"
                      .value=${form.timeoutSeconds}
                      @input=${(e: Event) =>
                        onFormChange({ timeoutSeconds: (e.target as HTMLInputElement).value })}
                    />
                  </div>
                </div>
              `
            : nothing}

          <!-- 错误提示 -->
          ${props.error
            ? html`
                <div class="cron-error-banner">
                  ${icons.alertCircle}
                  <span>${props.error}</span>
                </div>
              `
            : nothing}
        </div>

        <div class="cron-create-modal__footer">
          <button class="mc-btn" @click=${handleClose}>
            ${LABELS.cancel}
          </button>
          <button
            class="mc-btn mc-btn--primary"
            ?disabled=${props.busy}
            @click=${handleSubmit}
          >
            ${submitLabel}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染任务状态徽章
 */
function renderJobBadge(job: CronJob) {
  if (job.state?.runningAtMs) {
    return html`<span class="cron-job-card__badge cron-job-card__badge--running">运行中</span>`;
  }
  if (job.enabled) {
    return html`<span class="cron-job-card__badge cron-job-card__badge--enabled">${LABELS.enabled}</span>`;
  }
  return html`<span class="cron-job-card__badge cron-job-card__badge--disabled">${LABELS.disabled}</span>`;
}

/**
 * 渲染任务详情
 */
function renderJobDetails(job: CronJob, props: CronContentProps) {
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
        ${job.agentId
          ? html`
              <div class="cron-job-card__meta-item">
                <span class="cron-job-card__meta-label">Agent</span>
                <span class="cron-job-card__meta-value">${job.agentId}</span>
              </div>
            `
          : nothing}
        ${job.description
          ? html`
              <div class="cron-job-card__meta-item" style="grid-column: 1 / -1;">
                <span class="cron-job-card__meta-label">${LABELS.description}</span>
                <span class="cron-job-card__meta-value">${job.description}</span>
              </div>
            `
          : nothing}
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
 */
function renderJobCard(job: CronJob, props: CronContentProps) {
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
 */
function renderJobsList(props: CronContentProps) {
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

/**
 * 渲染运行历史
 */
function renderRunHistory(props: CronContentProps) {
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
      ${runs.length === 0
        ? html`
            <div class="cron-empty" style="padding: 24px;">
              <div style="font-size: 13px; color: var(--muted);">${LABELS.noRuns}</div>
            </div>
          `
        : html`
            <div class="cron-runs-list">
              ${runs.map((entry) => renderRunItem(entry))}
            </div>
          `}
    </div>
  `;
}

/**
 * 渲染运行记录项
 */
function renderRunItem(entry: { ts: number; status: string; durationMs?: number; error?: string; summary?: string }) {
  const statusIcon =
    entry.status === "ok"
      ? icons.check
      : entry.status === "error"
        ? icons.x
        : icons.alertCircle;
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
        ${entry.durationMs != null
          ? html`<div style="font-size: 12px; color: var(--muted);">${LABELS.duration}: ${entry.durationMs}ms</div>`
          : nothing}
        ${entry.error
          ? html`<div style="font-size: 12px; color: var(--danger); margin-top: 4px;">${entry.error}</div>`
          : nothing}
      </div>
    </div>
  `;
}

/**
 * 渲染删除确认弹窗
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
