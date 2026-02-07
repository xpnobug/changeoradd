/**
 * Cron 表单字段组件
 * Cron form fields components
 */
import { html, nothing } from "lit";
import type { CronContentProps, CronFormState } from "../../types/cron-config";
import { DEFAULT_FORM, LABELS, icons } from "./constants";
import { getSafeCallbacks, buildChannelOptions, resolveChannelLabel } from "./utils";

/**
 * 渲染调度类型字段
 * Render schedule type fields
 */
export function renderScheduleFields(props: CronContentProps) {
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
 * Render create/edit job modal
 */
export function renderCreateModal(props: CronContentProps) {
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
    if (!props.error) {
      onShowCreateModal(false);
    }
  };

  const modalTitle = isEditMode ? LABELS.editJob : LABELS.newJob;
  const submitLabel = isEditMode
    ? props.busy ? LABELS.updating : LABELS.updateJob
    : props.busy ? LABELS.adding : LABELS.addJob;

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
                @input=${(e: Event) => onFormChange({ name: (e.target as HTMLInputElement).value })}
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
                  if (newTarget === "main" && form.payloadKind === "agentTurn") {
                    onFormChange({ sessionTarget: newTarget, payloadKind: "systemEvent" });
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
                  onFormChange({ wakeMode: (e.target as HTMLSelectElement).value as CronFormState["wakeMode"] })}
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
                onFormChange({ payloadKind: (e.target as HTMLSelectElement).value as CronFormState["payloadKind"] })}
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
                            onFormChange({
                              deliveryMode: (e.target as HTMLInputElement).checked ? "announce" : "none",
                            })}
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
                        onFormChange({ deliveryChannel: (e.target as HTMLSelectElement).value })}
                    >
                      ${channelOptions.map(
                        (channel) =>
                          html`<option value=${channel} ?selected=${(form.deliveryChannel || "last") === channel}>
                            ${resolveChannelLabel(props, channel)}
                          </option>`,
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
          <button class="mc-btn" @click=${handleClose}>${LABELS.cancel}</button>
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
