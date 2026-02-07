/**
 * 模型行组件
 * Model row component
 */
import { html } from "lit";
import type { ModelConfig } from "./constants";
import type { ProvidersContentProps } from "./types";
import { icons, LABELS } from "./constants";
import { renderModelAdvanced } from "./model-advanced";

/**
 * 渲染模型行
 * Render model row
 */
export function renderModelRow(
  providerKey: string,
  index: number,
  model: ModelConfig,
  props: ProvidersContentProps,
) {
  const hasText = model.input?.includes("text") ?? true;
  const hasImage = model.input?.includes("image") ?? false;

  const handleInputChange = (type: "text" | "image", checked: boolean) => {
    const currentInput = model.input ?? ["text"];
    let newInput: Array<"text" | "image">;
    if (checked) {
      newInput = [...new Set([...currentInput, type])];
    } else {
      newInput = currentInput.filter((t) => t !== type);
      if (newInput.length === 0) newInput = ["text"]; // 至少保留文本
    }
    props.onModelUpdate(providerKey, index, "input", newInput);
  };

  return html`
    <div class="mc-model-row">
      <div class="mc-model-row__main">
        <div class="mc-model-row__field mc-model-row__field--id">
          <label class="mc-field mc-field--sm">
            <span class="mc-field__label">${LABELS.modelId}</span>
            <input
              type="text"
              class="mc-input mc-input--sm"
              .value=${model.id}
              @input=${(e: Event) =>
                props.onModelUpdate(providerKey, index, "id", (e.target as HTMLInputElement).value)}
            />
          </label>
        </div>
        <div class="mc-model-row__field mc-model-row__field--name">
          <label class="mc-field mc-field--sm">
            <span class="mc-field__label">${LABELS.modelName}</span>
            <input
              type="text"
              class="mc-input mc-input--sm"
              .value=${model.name}
              @input=${(e: Event) =>
                props.onModelUpdate(providerKey, index, "name", (e.target as HTMLInputElement).value)}
            />
          </label>
        </div>
        <div class="mc-model-row__field mc-model-row__field--context">
          <label class="mc-field mc-field--sm">
            <span class="mc-field__label">${LABELS.modelContext}</span>
            <input
              type="number"
              class="mc-input mc-input--sm"
              .value=${String(model.contextWindow)}
              @input=${(e: Event) =>
                props.onModelUpdate(providerKey, index, "contextWindow", Number((e.target as HTMLInputElement).value))}
            />
          </label>
        </div>
        <div class="mc-model-row__field mc-model-row__field--tokens">
          <label class="mc-field mc-field--sm">
            <span class="mc-field__label">${LABELS.modelMaxTokens}</span>
            <input
              type="number"
              class="mc-input mc-input--sm"
              .value=${String(model.maxTokens)}
              @input=${(e: Event) =>
                props.onModelUpdate(providerKey, index, "maxTokens", Number((e.target as HTMLInputElement).value))}
            />
          </label>
        </div>
        <div class="mc-model-row__field mc-model-row__field--input">
          <div class="mc-field mc-field--sm">
            <span class="mc-field__label">${LABELS.modelInput}</span>
            <div class="mc-checkbox-group">
              <label class="mc-checkbox">
                <input
                  type="checkbox"
                  .checked=${hasText}
                  @change=${(e: Event) => handleInputChange("text", (e.target as HTMLInputElement).checked)}
                />
                <span>${LABELS.inputText}</span>
              </label>
              <label class="mc-checkbox">
                <input
                  type="checkbox"
                  .checked=${hasImage}
                  @change=${(e: Event) => handleInputChange("image", (e.target as HTMLInputElement).checked)}
                />
                <span>${LABELS.inputImage}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="mc-model-row__field mc-model-row__field--reasoning">
          <label class="mc-toggle-field">
            <span class="mc-toggle-field__label">${LABELS.modelReasoning}</span>
            <div class="mc-toggle">
              <input
                type="checkbox"
                .checked=${model.reasoning}
                @change=${(e: Event) =>
                  props.onModelUpdate(providerKey, index, "reasoning", (e.target as HTMLInputElement).checked)}
              />
              <span class="mc-toggle__track"></span>
            </div>
          </label>
        </div>
      </div>
      <button
        class="mc-icon-btn mc-icon-btn--danger mc-model-row__remove"
        title="删除模型"
        @click=${() => props.onModelRemove(providerKey, index)}
      >
        ${icons.trash}
      </button>
    </div>
    ${renderModelAdvanced(providerKey, index, model, props)}
  `;
}
