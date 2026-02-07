/**
 * Headers 编辑器组件
 * Headers editor component
 */
import { html } from "lit";
import type { ProvidersContentProps } from "./types";
import { icons, LABELS } from "./constants";

/**
 * 渲染 Headers 编辑器
 * Render headers editor
 */
export function renderHeadersEditor(
  providerKey: string,
  headers: Record<string, string> | undefined,
  props: ProvidersContentProps,
) {
  const entries = Object.entries(headers ?? {});

  const handleAddHeader = () => {
    const newHeaders = { ...(headers ?? {}), "": "" };
    props.onProviderUpdate(providerKey, "headers", newHeaders);
  };

  const handleRemoveHeader = (key: string) => {
    const newHeaders = { ...(headers ?? {}) };
    delete newHeaders[key];
    props.onProviderUpdate(
      providerKey,
      "headers",
      Object.keys(newHeaders).length > 0 ? newHeaders : undefined,
    );
  };

  const handleHeaderChange = (oldKey: string, newKey: string, value: string) => {
    const newHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers ?? {})) {
      if (k === oldKey) {
        if (newKey) newHeaders[newKey] = value;
      } else {
        newHeaders[k] = v;
      }
    }
    props.onProviderUpdate(
      providerKey,
      "headers",
      Object.keys(newHeaders).length > 0 ? newHeaders : undefined,
    );
  };

  return html`
    <div class="mc-headers-section">
      <div class="mc-headers-section__header">
        <span class="mc-headers-section__title">${LABELS.providerHeaders}</span>
        <button class="mc-btn mc-btn--sm" @click=${handleAddHeader}>
          ${icons.add} ${LABELS.addHeader}
        </button>
      </div>
      ${entries.length === 0
        ? html`<div class="mc-headers-section__hint">${LABELS.headersHint}</div>`
        : html`
            <div class="mc-headers-list">
              ${entries.map(
                ([key, value]) => html`
                  <div class="mc-header-row">
                    <input
                      type="text"
                      class="mc-input mc-input--sm"
                      placeholder=${LABELS.headerKey}
                      .value=${key}
                      @input=${(e: Event) =>
                        handleHeaderChange(key, (e.target as HTMLInputElement).value, value)}
                    />
                    <input
                      type="text"
                      class="mc-input mc-input--sm"
                      placeholder=${LABELS.headerValue}
                      .value=${value}
                      @input=${(e: Event) =>
                        handleHeaderChange(key, key, (e.target as HTMLInputElement).value)}
                    />
                    <button
                      class="mc-icon-btn mc-icon-btn--danger mc-icon-btn--sm"
                      @click=${() => handleRemoveHeader(key)}
                    >
                      ${icons.trash}
                    </button>
                  </div>
                `,
              )}
            </div>
          `}
    </div>
  `;
}
