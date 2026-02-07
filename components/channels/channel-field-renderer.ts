/**
 * 通道配置字段渲染器
 */
import { html, nothing } from "lit";
import type { ChannelMeta, ChannelConfigField } from "../../types/channel-config";

/**
 * 解析嵌套路径值，支持 "polling.pollingIntervalMs" 形式的 key
 */
export function resolveNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * 渲染配置字段
 */
export function renderConfigField(
  channel: ChannelMeta,
  field: ChannelConfigField,
  value: unknown,
  onUpdate: (channelId: string, field: string, value: unknown) => void,
) {
  const handleChange = (newValue: unknown) => {
    onUpdate(channel.id, field.key, newValue);
  };

  switch (field.type) {
    case "toggle":
      return html`
        <label class="mc-toggle-field">
          <span class="mc-toggle-field__label">${field.label}</span>
          <div class="mc-toggle">
            <input
              type="checkbox"
              .checked=${Boolean(value)}
              @change=${(e: Event) => handleChange((e.target as HTMLInputElement).checked)}
            />
            <span class="mc-toggle__track"></span>
          </div>
        </label>
      `;

    case "array":
      // 数组类型：用 textarea，每行一个值
      const arrayValue = Array.isArray(value) ? value : [];
      const textValue = arrayValue.join("\n");
      return html`
        <label class="mc-field">
          <span class="mc-field__label">${field.label}</span>
          ${field.description ? html`<span class="mc-field__desc">${field.description}</span>` : nothing}
          <textarea
            class="mc-textarea"
            rows="3"
            placeholder=${field.placeholder ?? ""}
            .value=${textValue}
            @input=${(e: Event) => {
              const text = (e.target as HTMLTextAreaElement).value;
              const items = text
                .split("\n")
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
              handleChange(items.length > 0 ? items : undefined);
            }}
          ></textarea>
        </label>
      `;

    case "select":
      return html`
        <label class="mc-field">
          <span class="mc-field__label">${field.label}</span>
          <select
            class="mc-select"
            @change=${(e: Event) => handleChange((e.target as HTMLSelectElement).value)}
          >
            <option value="" ?selected=${!value}>-- 选择 --</option>
            ${field.options?.map(
              (opt: { value: string; label: string }) =>
                html`<option value=${opt.value} ?selected=${String(value) === opt.value}>${opt.label}</option>`,
            )}
          </select>
        </label>
      `;

    case "password":
      return html`
        <label class="mc-field">
          <span class="mc-field__label">${field.label}${field.required ? " *" : ""}</span>
          <input
            type="password"
            class="mc-input"
            .value=${String(value ?? "")}
            placeholder=${field.placeholder ?? ""}
            @input=${(e: Event) => handleChange((e.target as HTMLInputElement).value)}
          />
        </label>
      `;

    case "number":
      return html`
        <label class="mc-field">
          <span class="mc-field__label">${field.label}</span>
          <input
            type="number"
            class="mc-input"
            .value=${String(value ?? "")}
            placeholder=${field.placeholder ?? ""}
            @input=${(e: Event) => handleChange(Number((e.target as HTMLInputElement).value) || undefined)}
          />
        </label>
      `;

    case "textarea":
      return html`
        <label class="mc-field">
          <span class="mc-field__label">${field.label}</span>
          ${field.description ? html`<span class="mc-field__desc">${field.description}</span>` : nothing}
          <textarea
            class="mc-textarea"
            rows="5"
            placeholder=${field.placeholder ?? ""}
            .value=${String(value ?? "")}
            @input=${(e: Event) => {
              const text = (e.target as HTMLTextAreaElement).value;
              handleChange(text || undefined);
            }}
          ></textarea>
        </label>
      `;

    default:
      return html`
        <label class="mc-field">
          <span class="mc-field__label">${field.label}${field.required ? " *" : ""}</span>
          <input
            type="text"
            class="mc-input"
            .value=${String(value ?? "")}
            placeholder=${field.placeholder ?? ""}
            @input=${(e: Event) => handleChange((e.target as HTMLInputElement).value)}
          />
        </label>
      `;
  }
}
