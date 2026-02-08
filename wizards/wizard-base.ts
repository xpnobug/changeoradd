/**
 * 向导基础组件和工具函数
 */
import { html, nothing, type TemplateResult } from "lit";
import type { WizardStep, WizardState } from "./types.js";

/** 创建初始状态 */
export function createWizardState<T>(initialData?: Partial<T>): WizardState<T> {
  return {
    currentStep: 0,
    data: initialData ?? {},
    errors: {},
    touched: new Set(),
  };
}

/** 更新数据 */
export function updateData<T>(
  state: WizardState<T>,
  field: string,
  value: unknown,
): WizardState<T> {
  const touched = new Set(state.touched);
  touched.add(field);
  return {
    ...state,
    data: { ...state.data, [field]: value } as Partial<T>,
    touched,
  };
}

/** 设置错误 */
export function setErrors<T>(
  state: WizardState<T>,
  errors: Record<string, string[]>,
): WizardState<T> {
  return { ...state, errors };
}

/** 下一步 */
export function nextStep<T>(state: WizardState<T>, totalSteps: number): WizardState<T> {
  if (state.currentStep >= totalSteps - 1) return state;
  return { ...state, currentStep: state.currentStep + 1 };
}

/** 上一步 */
export function prevStep<T>(state: WizardState<T>): WizardState<T> {
  if (state.currentStep <= 0) return state;
  return { ...state, currentStep: state.currentStep - 1 };
}

/** 跳转到指定步骤 */
export function goToStep<T>(
  state: WizardState<T>,
  step: number,
  totalSteps: number,
): WizardState<T> {
  if (step < 0 || step >= totalSteps) return state;
  return { ...state, currentStep: step };
}

/** 渲染步骤指示器 */
export function renderStepIndicator(
  steps: WizardStep[],
  currentStep: number,
  onStepClick?: (index: number) => void,
): TemplateResult {
  return html`
    <div class="wizard__steps">
      ${steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        const classes = [
          "wizard__step",
          isActive ? "wizard__step--active" : "",
          isCompleted ? "wizard__step--completed" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return html`
          <button
            class=${classes}
            @click=${() => onStepClick?.(i)}
            ?disabled=${!onStepClick}
          >
            <span class="wizard__step-number">${isCompleted ? "✓" : i + 1}</span>
            <span class="wizard__step-title">${step.title}</span>
          </button>
        `;
      })}
    </div>
  `;
}

/** 渲染向导底部按钮 */
export function renderWizardFooter(opts: {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onCancel: () => void;
  onComplete: () => void;
  canProceed?: boolean;
  nextLabel?: string;
}): TemplateResult {
  const isFirst = opts.currentStep === 0;
  const isLast = opts.currentStep === opts.totalSteps - 1;
  const canProceed = opts.canProceed ?? true;

  return html`
    <div class="wizard__footer">
      <button class="wizard__btn wizard__btn--secondary" @click=${opts.onCancel}>
        取消
      </button>
      <div class="wizard__footer-right">
        ${
          isFirst
            ? nothing
            : html`
          <button class="wizard__btn wizard__btn--secondary" @click=${opts.onPrev}>
            上一步
          </button>
        `
        }
        ${
          isLast
            ? html`
              <button
                class="wizard__btn wizard__btn--primary"
                @click=${opts.onComplete}
                ?disabled=${!canProceed}
              >
                完成
              </button>
            `
            : html`
              <button
                class="wizard__btn wizard__btn--primary"
                @click=${opts.onNext}
                ?disabled=${!canProceed}
              >
                ${opts.nextLabel ?? "下一步"}
              </button>
            `
        }
      </div>
    </div>
  `;
}

/** 渲染表单字段 */
export function renderField(opts: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  content: TemplateResult;
}): TemplateResult {
  return html`
    <div class="wizard__field ${opts.error ? "wizard__field--error" : ""}">
      <label class="wizard__label">
        ${opts.label}
        ${
          opts.required
            ? html`
                <span class="wizard__required">*</span>
              `
            : nothing
        }
      </label>
      ${opts.content}
      ${opts.error ? html`<span class="wizard__error">${opts.error}</span>` : nothing}
      ${opts.hint && !opts.error ? html`<span class="wizard__hint">${opts.hint}</span>` : nothing}
    </div>
  `;
}
