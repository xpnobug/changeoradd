/**
 * 添加供应商弹窗组件
 * Add provider modal component
 */
import { html, nothing } from "lit";
import type { ModelApi, AuthMode } from "./constants";
import type { ProvidersContentProps } from "./types";
import { icons, LABELS, API_PROTOCOLS, AUTH_MODES, DEFAULT_PROVIDER_FORM } from "./constants";

/**
 * 渲染添加供应商弹窗
 * Render add provider modal
 */
export function renderAddProviderModal(props: ProvidersContentProps) {
  if (!props.showAddModal) return nothing;

  const form = props.addForm ?? DEFAULT_PROVIDER_FORM;
  const onFormChange = props.onAddFormChange ?? (() => {});
  const onShowAddModal = props.onShowAddModal ?? (() => {});
  const onAddConfirm = props.onAddConfirm ?? (() => {});
  const showApiKey = form.auth === "api-key" || form.auth === "token";

  const handleClose = () => {
    onShowAddModal(false);
  };

  const handleSubmit = () => {
    onAddConfirm();
  };

  return html`
    <div class="cron-confirm-modal" @click=${handleClose}>
      <div class="cron-create-modal__content" @click=${(e: Event) => e.stopPropagation()}>
        <div class="cron-create-modal__header">
          <div class="cron-create-modal__title">
            ${icons.provider}
            <span>${LABELS.createProvider}</span>
          </div>
          <button class="cron-create-modal__close" @click=${handleClose}>
            ${icons.close}
          </button>
        </div>

        <div class="cron-create-modal__body">
          <!-- 供应商名称 -->
          <div class="mc-field" style="margin-bottom: 16px;">
            <label class="mc-field__label">${LABELS.providerName}</label>
            <input
              type="text"
              class="mc-input"
              placeholder=${LABELS.providerNamePlaceholder}
              .value=${form.name}
              @input=${(e: Event) => onFormChange({ name: (e.target as HTMLInputElement).value })}
            />
          </div>

          <!-- API 地址 -->
          <div class="mc-field" style="margin-bottom: 16px;">
            <label class="mc-field__label">${LABELS.providerBaseUrl}</label>
            <input
              type="text"
              class="mc-input"
              placeholder=${LABELS.providerBaseUrlPlaceholder}
              .value=${form.baseUrl}
              @input=${(e: Event) =>
                onFormChange({ baseUrl: (e.target as HTMLInputElement).value })}
            />
          </div>

          <!-- API 协议和认证方式 -->
          <div class="cron-form-grid" style="margin-bottom: 16px;">
            <div class="mc-field">
              <label class="mc-field__label">${LABELS.providerProtocol}</label>
              <select
                class="mc-select"
                @change=${(e: Event) =>
                  onFormChange({ api: (e.target as HTMLSelectElement).value as ModelApi })}
              >
                ${API_PROTOCOLS.map(
                  (p) =>
                    html`<option value=${p.value} title=${p.hint} .selected=${form.api === p.value}>${p.label}</option>`,
                )}
              </select>
            </div>
            <div class="mc-field">
              <label class="mc-field__label">${LABELS.providerAuth}</label>
              <select
                class="mc-select"
                @change=${(e: Event) =>
                  onFormChange({ auth: (e.target as HTMLSelectElement).value as AuthMode })}
              >
                ${AUTH_MODES.map(
                  (a) =>
                    html`<option value=${a.value} title=${a.hint} .selected=${form.auth === a.value}>${a.label}</option>`,
                )}
              </select>
            </div>
          </div>

          <!-- API 密钥 -->
          ${showApiKey
            ? html`
                <div class="mc-field" style="margin-bottom: 16px;">
                  <label class="mc-field__label">${LABELS.providerApiKey}</label>
                  <input
                    type="password"
                    class="mc-input"
                    placeholder=${LABELS.providerApiKeyPlaceholder}
                    .value=${form.apiKey}
                    @input=${(e: Event) =>
                      onFormChange({ apiKey: (e.target as HTMLInputElement).value })}
                  />
                </div>
              `
            : nothing}

          <!-- 错误提示 -->
          ${props.addError
            ? html`
                <div class="cron-error-banner">
                  ${icons.info}
                  <span>${props.addError}</span>
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
            ?disabled=${!form.name.trim()}
            @click=${handleSubmit}
          >
            ${LABELS.confirm}
          </button>
        </div>
      </div>
    </div>
  `;
}
