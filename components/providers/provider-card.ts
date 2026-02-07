/**
 * 供应商卡片组件
 * Provider card component
 */
import { html, nothing } from "lit";
import type { ProviderConfig, ModelApi } from "./constants";
import type { ProvidersContentProps } from "./types";
import { icons, LABELS, API_PROTOCOLS, AUTH_MODES } from "./constants";
import { renderModelRow } from "./model-row";
import { renderHeadersEditor } from "./headers-editor";

/**
 * 获取协议标签
 * Get protocol label
 */
function getProtocolLabel(api: ModelApi): string {
  const protocol = API_PROTOCOLS.find((p) => p.value === api);
  return protocol?.label ?? api;
}

/**
 * 渲染供应商卡片
 * Render provider card
 */
export function renderProviderCard(
  key: string,
  provider: ProviderConfig,
  expanded: boolean,
  props: ProvidersContentProps,
) {
  const protocolLabel = getProtocolLabel(provider.api);
  const authMode = provider.auth ?? "api-key";
  const showApiKey = authMode === "api-key" || authMode === "token";

  return html`
    <div class="mc-provider-card ${expanded ? "mc-provider-card--expanded" : ""}">
      <div
        class="mc-provider-card__header"
        @click=${() => props.onProviderToggle(key)}
      >
        <div class="mc-provider-card__info">
          <div class="mc-provider-card__icon">${icons.provider}</div>
          <div class="mc-provider-card__details">
            <div class="mc-provider-card__name">${key}</div>
            <div class="mc-provider-card__meta">
              <span class="mc-provider-card__protocol">${protocolLabel}</span>
              <span class="mc-provider-card__count">${provider.models.length} ${LABELS.modelCount}</span>
            </div>
          </div>
        </div>
        <div class="mc-provider-card__actions">
          <button
            class="mc-icon-btn mc-icon-btn--danger"
            title="删除供应商"
            @click=${(e: Event) => {
              e.stopPropagation();
              props.onProviderRemove(key);
            }}
          >
            ${icons.trash}
          </button>
          <span class="mc-provider-card__chevron ${expanded ? "mc-provider-card__chevron--open" : ""}">
            ${icons.chevron}
          </span>
        </div>
      </div>

      ${expanded
        ? html`
            <div class="mc-provider-card__content">
              <div class="mc-form-section">
                <div class="mc-form-row">
                  <label class="mc-field">
                    <span class="mc-field__label">${LABELS.providerName}</span>
                    <input
                      type="text"
                      class="mc-input"
                      .value=${key}
                      @blur=${(e: Event) => {
                        const newKey = (e.target as HTMLInputElement).value.trim();
                        if (newKey && newKey !== key) {
                          props.onProviderRename(key, newKey);
                        }
                      }}
                      @keydown=${(e: KeyboardEvent) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </label>
                </div>
                <div class="mc-form-row">
                  <label class="mc-field">
                    <span class="mc-field__label">${LABELS.providerBaseUrl}</span>
                    <input
                      type="text"
                      class="mc-input"
                      .value=${provider.baseUrl}
                      placeholder="https://api.example.com/v1"
                      @input=${(e: Event) =>
                        props.onProviderUpdate(key, "baseUrl", (e.target as HTMLInputElement).value)}
                    />
                  </label>
                </div>
                <div class="mc-form-row mc-form-row--2col">
                  <label class="mc-field">
                    <span class="mc-field__label">${LABELS.providerProtocol}</span>
                    <select
                      class="mc-select"
                      @change=${(e: Event) =>
                        props.onProviderUpdate(key, "api", (e.target as HTMLSelectElement).value)}
                    >
                      ${API_PROTOCOLS.map(
                        (p) =>
                          html`<option value=${p.value} title=${p.hint} .selected=${provider.api === p.value}>${p.label}</option>`,
                      )}
                    </select>
                  </label>
                  <label class="mc-field">
                    <span class="mc-field__label">${LABELS.providerAuth}</span>
                    <select
                      class="mc-select"
                      @change=${(e: Event) =>
                        props.onProviderUpdate(key, "auth", (e.target as HTMLSelectElement).value)}
                    >
                      ${AUTH_MODES.map(
                        (a) =>
                          html`<option value=${a.value} title=${a.hint} .selected=${(provider.auth ?? "api-key") === a.value}>${a.label}</option>`,
                      )}
                    </select>
                  </label>
                </div>
                ${showApiKey
                  ? html`
                      <div class="mc-form-row">
                        <label class="mc-field">
                          <span class="mc-field__label">${LABELS.providerApiKey}</span>
                          <input
                            type="password"
                            class="mc-input"
                            .value=${provider.apiKey ?? ""}
                            placeholder="sk-... 或 \${ENV_VAR}"
                            @input=${(e: Event) =>
                              props.onProviderUpdate(key, "apiKey", (e.target as HTMLInputElement).value)}
                          />
                        </label>
                      </div>
                    `
                  : nothing}
                ${renderHeadersEditor(key, provider.headers, props)}
              </div>

              <div class="mc-models-section">
                <div class="mc-models-header">
                  <span class="mc-models-title">模型列表</span>
                  <button
                    class="mc-btn mc-btn--sm"
                    @click=${() => props.onModelAdd(key)}
                  >
                    ${icons.add}
                    <span>${LABELS.addModel}</span>
                  </button>
                </div>
                <div class="mc-models-list">
                  ${provider.models.map((model, idx) => renderModelRow(key, idx, model, props))}
                </div>
              </div>
            </div>
          `
        : nothing}
    </div>
  `;
}
