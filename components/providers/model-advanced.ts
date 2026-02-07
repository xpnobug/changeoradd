/**
 * 模型高级配置组件
 * Model advanced config component
 */
import { html } from "lit";
import type { ModelConfig } from "./constants";
import type { ProvidersContentProps } from "./types";
import { icons, LABELS } from "./constants";

/**
 * 渲染模型高级配置（成本和兼容性）
 * Render model advanced config (cost and compatibility)
 */
export function renderModelAdvanced(
  providerKey: string,
  index: number,
  model: ModelConfig,
  props: ProvidersContentProps,
) {
  const cost = model.cost ?? { input: 0, output: 0 };
  const compat = model.compat ?? {};

  return html`
    <div class="mc-model-advanced">
      <details class="mc-model-advanced__details">
        <summary class="mc-model-advanced__summary">
          ${icons.settings}
          <span>${LABELS.advancedConfig}</span>
        </summary>
        <div class="mc-model-advanced__content">
          <!-- 成本配置 -->
          <div class="mc-model-advanced__section">
            <div class="mc-model-advanced__section-title">${LABELS.modelCost}</div>
            <div class="mc-model-advanced__grid">
              <label class="mc-field mc-field--sm">
                <span class="mc-field__label">${LABELS.costInput}</span>
                <div class="mc-input-with-unit">
                  <input
                    type="number"
                    class="mc-input mc-input--sm"
                    step="0.01"
                    .value=${String(cost.input ?? 0)}
                    @input=${(e: Event) =>
                      props.onModelUpdate(providerKey, index, "cost", {
                        ...cost,
                        input: Number((e.target as HTMLInputElement).value),
                      })}
                  />
                  <span class="mc-input-unit">${LABELS.costUnit}</span>
                </div>
              </label>
              <label class="mc-field mc-field--sm">
                <span class="mc-field__label">${LABELS.costOutput}</span>
                <div class="mc-input-with-unit">
                  <input
                    type="number"
                    class="mc-input mc-input--sm"
                    step="0.01"
                    .value=${String(cost.output ?? 0)}
                    @input=${(e: Event) =>
                      props.onModelUpdate(providerKey, index, "cost", {
                        ...cost,
                        output: Number((e.target as HTMLInputElement).value),
                      })}
                  />
                  <span class="mc-input-unit">${LABELS.costUnit}</span>
                </div>
              </label>
              <label class="mc-field mc-field--sm">
                <span class="mc-field__label">${LABELS.costCacheRead}</span>
                <div class="mc-input-with-unit">
                  <input
                    type="number"
                    class="mc-input mc-input--sm"
                    step="0.01"
                    .value=${String(cost.cacheRead ?? 0)}
                    @input=${(e: Event) =>
                      props.onModelUpdate(providerKey, index, "cost", {
                        ...cost,
                        cacheRead: Number((e.target as HTMLInputElement).value),
                      })}
                  />
                  <span class="mc-input-unit">${LABELS.costUnit}</span>
                </div>
              </label>
              <label class="mc-field mc-field--sm">
                <span class="mc-field__label">${LABELS.costCacheWrite}</span>
                <div class="mc-input-with-unit">
                  <input
                    type="number"
                    class="mc-input mc-input--sm"
                    step="0.01"
                    .value=${String(cost.cacheWrite ?? 0)}
                    @input=${(e: Event) =>
                      props.onModelUpdate(providerKey, index, "cost", {
                        ...cost,
                        cacheWrite: Number((e.target as HTMLInputElement).value),
                      })}
                  />
                  <span class="mc-input-unit">${LABELS.costUnit}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- 兼容性配置 -->
          <div class="mc-model-advanced__section">
            <div class="mc-model-advanced__section-title">${LABELS.modelCompat}</div>
            <div class="mc-model-advanced__compat">
              <label class="mc-checkbox">
                <input
                  type="checkbox"
                  .checked=${compat.supportsStore ?? false}
                  @change=${(e: Event) =>
                    props.onModelUpdate(providerKey, index, "compat", {
                      ...compat,
                      supportsStore: (e.target as HTMLInputElement).checked,
                    })}
                />
                <span>${LABELS.compatStore}</span>
              </label>
              <label class="mc-checkbox">
                <input
                  type="checkbox"
                  .checked=${compat.supportsDeveloperRole ?? false}
                  @change=${(e: Event) =>
                    props.onModelUpdate(providerKey, index, "compat", {
                      ...compat,
                      supportsDeveloperRole: (e.target as HTMLInputElement).checked,
                    })}
                />
                <span>${LABELS.compatDeveloper}</span>
              </label>
              <label class="mc-checkbox">
                <input
                  type="checkbox"
                  .checked=${compat.supportsReasoningEffort ?? false}
                  @change=${(e: Event) =>
                    props.onModelUpdate(providerKey, index, "compat", {
                      ...compat,
                      supportsReasoningEffort: (e.target as HTMLInputElement).checked,
                    })}
                />
                <span>${LABELS.compatReasoning}</span>
              </label>
              <div class="mc-compat-select">
                <span class="mc-compat-select__label">${LABELS.compatMaxTokens}:</span>
                <select
                  class="mc-select mc-select--sm"
                  @change=${(e: Event) =>
                    props.onModelUpdate(providerKey, index, "compat", {
                      ...compat,
                      maxTokensField: (e.target as HTMLSelectElement).value as
                        | "max_tokens"
                        | "max_completion_tokens",
                    })}
                >
                  <option value="max_tokens" .selected=${(compat.maxTokensField ?? "max_tokens") === "max_tokens"}>${LABELS.maxTokensField}</option>
                  <option value="max_completion_tokens" .selected=${compat.maxTokensField === "max_completion_tokens"}>${LABELS.maxCompletionTokensField}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  `;
}
