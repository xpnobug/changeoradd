/**
 * 通用表单字段组件
 * 提供统一的表单字段渲染函数
 */
import { html, nothing, type TemplateResult } from "lit";

// ============================================
// 类型定义
// ============================================

export type FormFieldType =
  | "text"
  | "password"
  | "number"
  | "select"
  | "toggle"
  | "textarea"
  | "array";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

export type FormFieldConfig = {
  key: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: SelectOption[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export type FormFieldProps = {
  field: FormFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  className?: string;
};

// ============================================
// 渲染函数
// ============================================

/**
 * 渲染文本输入框
 */
export function renderTextField(
  label: string,
  value: string | undefined,
  onChange: (value: string) => void,
  options?: {
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    description?: string;
    className?: string;
  },
): TemplateResult {
  return html`
    <label class="mc-field ${options?.className ?? ""}">
      <span class="mc-field__label">${label}${options?.required ? " *" : ""}</span>
      ${options?.description ? html`<span class="mc-field__desc">${options.description}</span>` : nothing}
      <input
        type="text"
        class="mc-input"
        .value=${value ?? ""}
        placeholder=${options?.placeholder ?? ""}
        ?disabled=${options?.disabled}
        @input=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
      />
    </label>
  `;
}

/**
 * 渲染密码输入框
 */
export function renderPasswordField(
  label: string,
  value: string | undefined,
  onChange: (value: string) => void,
  options?: {
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    description?: string;
    className?: string;
  },
): TemplateResult {
  return html`
    <label class="mc-field ${options?.className ?? ""}">
      <span class="mc-field__label">${label}${options?.required ? " *" : ""}</span>
      ${options?.description ? html`<span class="mc-field__desc">${options.description}</span>` : nothing}
      <input
        type="password"
        class="mc-input"
        .value=${value ?? ""}
        placeholder=${options?.placeholder ?? ""}
        ?disabled=${options?.disabled}
        @input=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
      />
    </label>
  `;
}

/**
 * 渲染数字输入框
 */
export function renderNumberField(
  label: string,
  value: number | undefined,
  onChange: (value: number | undefined) => void,
  options?: {
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    description?: string;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
  },
): TemplateResult {
  return html`
    <label class="mc-field ${options?.className ?? ""}">
      <span class="mc-field__label">${label}${options?.required ? " *" : ""}</span>
      ${options?.description ? html`<span class="mc-field__desc">${options.description}</span>` : nothing}
      <input
        type="number"
        class="mc-input"
        .value=${value != null ? String(value) : ""}
        placeholder=${options?.placeholder ?? ""}
        ?disabled=${options?.disabled}
        min=${options?.min ?? nothing}
        max=${options?.max ?? nothing}
        step=${options?.step ?? nothing}
        @input=${(e: Event) => {
          const val = (e.target as HTMLInputElement).value;
          onChange(val ? Number(val) : undefined);
        }}
      />
    </label>
  `;
}

/**
 * 渲染下拉选择框
 */
export function renderSelectField(
  label: string,
  value: string | undefined,
  options: SelectOption[],
  onChange: (value: string) => void,
  config?: {
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    description?: string;
    className?: string;
    emptyLabel?: string;
  },
): TemplateResult {
  return html`
    <label class="mc-field ${config?.className ?? ""}">
      <span class="mc-field__label">${label}${config?.required ? " *" : ""}</span>
      ${config?.description ? html`<span class="mc-field__desc">${config.description}</span>` : nothing}
      <select
        class="mc-select"
        ?disabled=${config?.disabled}
        @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}
      >
        <option value="" ?selected=${!value}>${config?.emptyLabel ?? "-- 选择 --"}</option>
        ${options.map(
          (opt) => html`
            <option value=${opt.value} ?selected=${value === opt.value}>${opt.label}</option>
          `,
        )}
      </select>
    </label>
  `;
}

/**
 * 渲染开关切换
 */
export function renderToggleField(
  label: string,
  value: boolean | undefined,
  onChange: (value: boolean) => void,
  options?: {
    disabled?: boolean;
    description?: string;
    className?: string;
  },
): TemplateResult {
  return html`
    <label class="mc-toggle-field ${options?.className ?? ""}">
      <span class="mc-toggle-field__label">${label}</span>
      ${options?.description ? html`<span class="mc-toggle-field__desc">${options.description}</span>` : nothing}
      <div class="mc-toggle">
        <input
          type="checkbox"
          .checked=${Boolean(value)}
          ?disabled=${options?.disabled}
          @change=${(e: Event) => onChange((e.target as HTMLInputElement).checked)}
        />
        <span class="mc-toggle__track"></span>
      </div>
    </label>
  `;
}

/**
 * 渲染多行文本框
 */
export function renderTextareaField(
  label: string,
  value: string | undefined,
  onChange: (value: string | undefined) => void,
  options?: {
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    description?: string;
    rows?: number;
    className?: string;
  },
): TemplateResult {
  return html`
    <label class="mc-field ${options?.className ?? ""}">
      <span class="mc-field__label">${label}${options?.required ? " *" : ""}</span>
      ${options?.description ? html`<span class="mc-field__desc">${options.description}</span>` : nothing}
      <textarea
        class="mc-textarea"
        rows=${options?.rows ?? 5}
        placeholder=${options?.placeholder ?? ""}
        ?disabled=${options?.disabled}
        .value=${value ?? ""}
        @input=${(e: Event) => {
          const text = (e.target as HTMLTextAreaElement).value;
          onChange(text || undefined);
        }}
      ></textarea>
    </label>
  `;
}

/**
 * 渲染数组输入框（每行一个值）
 */
export function renderArrayField(
  label: string,
  value: string[] | undefined,
  onChange: (value: string[] | undefined) => void,
  options?: {
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    description?: string;
    rows?: number;
    className?: string;
  },
): TemplateResult {
  const arrayValue = Array.isArray(value) ? value : [];
  const textValue = arrayValue.join("\n");

  return html`
    <label class="mc-field ${options?.className ?? ""}">
      <span class="mc-field__label">${label}${options?.required ? " *" : ""}</span>
      ${options?.description ? html`<span class="mc-field__desc">${options.description}</span>` : nothing}
      <textarea
        class="mc-textarea"
        rows=${options?.rows ?? 3}
        placeholder=${options?.placeholder ?? ""}
        ?disabled=${options?.disabled}
        .value=${textValue}
        @input=${(e: Event) => {
          const text = (e.target as HTMLTextAreaElement).value;
          const items = text
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          onChange(items.length > 0 ? items : undefined);
        }}
      ></textarea>
    </label>
  `;
}

/**
 * 通用字段渲染器 - 根据字段配置自动选择渲染函数
 */
export function renderFormField(props: FormFieldProps): TemplateResult {
  const { field, value, onChange, className } = props;

  switch (field.type) {
    case "text":
      return renderTextField(field.label, value as string | undefined, (v) => onChange(v || undefined), {
        placeholder: field.placeholder,
        required: field.required,
        disabled: field.disabled,
        description: field.description,
        className,
      });

    case "password":
      return renderPasswordField(field.label, value as string | undefined, (v) => onChange(v || undefined), {
        placeholder: field.placeholder,
        required: field.required,
        disabled: field.disabled,
        description: field.description,
        className,
      });

    case "number":
      return renderNumberField(field.label, value as number | undefined, onChange, {
        placeholder: field.placeholder,
        required: field.required,
        disabled: field.disabled,
        description: field.description,
        min: field.min,
        max: field.max,
        step: field.step,
        className,
      });

    case "select":
      return renderSelectField(
        field.label,
        value as string | undefined,
        field.options ?? [],
        (v) => onChange(v || undefined),
        {
          placeholder: field.placeholder,
          required: field.required,
          disabled: field.disabled,
          description: field.description,
          className,
        },
      );

    case "toggle":
      return renderToggleField(field.label, value as boolean | undefined, onChange, {
        disabled: field.disabled,
        description: field.description,
        className,
      });

    case "textarea":
      return renderTextareaField(field.label, value as string | undefined, onChange, {
        placeholder: field.placeholder,
        required: field.required,
        disabled: field.disabled,
        description: field.description,
        rows: field.rows,
        className,
      });

    case "array":
      return renderArrayField(field.label, value as string[] | undefined, onChange, {
        placeholder: field.placeholder,
        required: field.required,
        disabled: field.disabled,
        description: field.description,
        rows: field.rows,
        className,
      });

    default:
      return renderTextField(field.label, String(value ?? ""), (v) => onChange(v || undefined), {
        placeholder: field.placeholder,
        required: field.required,
        disabled: field.disabled,
        description: field.description,
        className,
      });
  }
}
