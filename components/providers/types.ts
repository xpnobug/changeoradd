/**
 * 供应商配置 Props 类型
 * Provider config props types
 */
import type { ProviderConfig, ProviderFormState } from "./constants";

export type ProvidersContentProps = {
  providers: Record<string, ProviderConfig>;
  expandedProviders: Set<string>;
  // 新建供应商弹窗状态
  showAddModal?: boolean;
  addForm?: ProviderFormState;
  addError?: string | null;
  // 回调函数
  onProviderToggle: (key: string) => void;
  onProviderAdd: () => void;
  onProviderRemove: (key: string) => void;
  onProviderRename: (oldKey: string, newKey: string) => void;
  onProviderUpdate: (key: string, field: string, value: unknown) => void;
  onModelAdd: (providerKey: string) => void;
  onModelRemove: (providerKey: string, modelIndex: number) => void;
  onModelUpdate: (providerKey: string, modelIndex: number, field: string, value: unknown) => void;
  // 弹窗回调
  onShowAddModal?: (show: boolean) => void;
  onAddFormChange?: (patch: Partial<ProviderFormState>) => void;
  onAddConfirm?: () => void;
};
