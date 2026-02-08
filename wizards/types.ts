/**
 * 向导类型定义
 */

/** 向导步骤 */
export type WizardStep = {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
};

/** 向导状态 */
export type WizardState<T = Record<string, unknown>> = {
  currentStep: number;
  data: Partial<T>;
  errors: Record<string, string[]>;
  touched: Set<string>;
};

/** 向导 Props 基类 */
export type WizardBaseProps<T = Record<string, unknown>> = {
  onComplete: (data: T) => void;
  onCancel: () => void;
  initialData?: Partial<T>;
};
