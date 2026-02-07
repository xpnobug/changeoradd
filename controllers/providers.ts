/**
 * 模型供应商管理控制器
 * Model provider management controller
 *
 * 处理供应商的增删改查操作
 * Handles provider CRUD operations
 */
import type { ModelConfigState } from "./state";
import type { ProviderConfig, ModelConfig } from "../views/model-config";
import type { ProviderFormState } from "../components/providers-content";

/**
 * 默认添加供应商表单
 */
const DEFAULT_ADD_PROVIDER_FORM: ProviderFormState = {
  name: "",
  baseUrl: "",
  apiKey: "",
  api: "openai-completions",
  auth: "api-key",
};

/**
 * 切换供应商展开状态
 */
export function toggleProviderExpanded(state: ModelConfigState, key: string): void {
  const expanded = new Set(state.modelConfigExpandedProviders);
  if (expanded.has(key)) {
    expanded.delete(key);
  } else {
    expanded.add(key);
  }
  state.modelConfigExpandedProviders = expanded;
}

/**
 * 添加新供应商（快速添加）
 */
export function addProvider(state: ModelConfigState): void {
  // 生成唯一的供应商名称
  let baseName = "new-provider";
  let counter = 1;
  while (state.modelConfigProviders[baseName]) {
    baseName = `new-provider-${counter}`;
    counter++;
  }

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [baseName]: {
      baseUrl: "",
      apiKey: "",
      api: "openai-completions",
      models: [],
    },
  };

  // 展开新添加的供应商
  state.modelConfigExpandedProviders = new Set([
    ...state.modelConfigExpandedProviders,
    baseName,
  ]);
}

/**
 * 显示/隐藏添加供应商弹窗
 */
export function showAddProviderModal(state: ModelConfigState, show: boolean): void {
  state.addProviderModalShow = show;
  if (show) {
    // 打开弹窗时重置表单
    state.addProviderForm = { ...DEFAULT_ADD_PROVIDER_FORM };
    state.addProviderError = null;
  }
}

/**
 * 更新添加供应商表单
 */
export function updateAddProviderForm(
  state: ModelConfigState,
  patch: Partial<ProviderFormState>,
): void {
  state.addProviderForm = {
    ...state.addProviderForm,
    ...patch,
  };
  // 清除之前的错误
  state.addProviderError = null;
}

/**
 * 确认添加供应商
 */
export function confirmAddProvider(state: ModelConfigState): void {
  const form = state.addProviderForm;
  const name = form.name.trim();

  // 验证名称
  if (!name) {
    state.addProviderError = "请输入供应商名称";
    return;
  }

  // 检查名称是否已存在
  if (state.modelConfigProviders[name]) {
    state.addProviderError = `供应商名称 "${name}" 已存在`;
    return;
  }

  // 创建新供应商
  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [name]: {
      baseUrl: form.baseUrl,
      apiKey: form.apiKey || undefined,
      auth: form.auth,
      api: form.api,
      models: [],
    },
  };

  // 展开新添加的供应商
  state.modelConfigExpandedProviders = new Set([
    ...state.modelConfigExpandedProviders,
    name,
  ]);

  // 关闭弹窗
  state.addProviderModalShow = false;
  state.addProviderForm = { ...DEFAULT_ADD_PROVIDER_FORM };
  state.addProviderError = null;
}

/**
 * 删除供应商
 */
export function removeProvider(state: ModelConfigState, key: string): void {
  const { [key]: _, ...rest } = state.modelConfigProviders;
  state.modelConfigProviders = rest;

  // 从展开列表中移除
  const expanded = new Set(state.modelConfigExpandedProviders);
  expanded.delete(key);
  state.modelConfigExpandedProviders = expanded;
}

/**
 * 重命名供应商
 */
export function renameProvider(
  state: ModelConfigState,
  oldKey: string,
  newKey: string,
): void {
  // 验证新名称
  const trimmedKey = newKey.trim();
  if (!trimmedKey) {
    state.lastError = "供应商名称不能为空";
    return;
  }
  if (oldKey === trimmedKey) return;
  if (state.modelConfigProviders[trimmedKey]) {
    state.lastError = `供应商名称 "${trimmedKey}" 已存在`;
    return;
  }

  // 获取旧配置
  const provider = state.modelConfigProviders[oldKey];
  if (!provider) return;

  // 创建新的 providers 对象，保持顺序
  const newProviders: Record<string, ProviderConfig> = {};
  for (const [key, value] of Object.entries(state.modelConfigProviders)) {
    if (key === oldKey) {
      newProviders[trimmedKey] = value;
    } else {
      newProviders[key] = value;
    }
  }
  state.modelConfigProviders = newProviders;

  // 更新展开状态
  const expanded = new Set(state.modelConfigExpandedProviders);
  if (expanded.has(oldKey)) {
    expanded.delete(oldKey);
    expanded.add(trimmedKey);
  }
  state.modelConfigExpandedProviders = expanded;

  // 清除可能的旧错误
  if (state.lastError?.includes("供应商名称")) {
    state.lastError = null;
  }
}

/**
 * 更新供应商字段
 */
export function updateProviderField(
  state: ModelConfigState,
  key: string,
  field: string,
  value: unknown,
): void {
  const provider = state.modelConfigProviders[key];
  if (!provider) return;

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [key]: {
      ...provider,
      [field]: value,
    },
  };
}

/**
 * 添加模型到供应商
 */
export function addModel(state: ModelConfigState, providerKey: string): void {
  const provider = state.modelConfigProviders[providerKey];
  if (!provider) return;

  const newModel: ModelConfig = {
    id: "new-model",
    name: "New Model",
    reasoning: false,
    input: ["text"],
    contextWindow: 128000,
    maxTokens: 4096,
  };

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [providerKey]: {
      ...provider,
      models: [...provider.models, newModel],
    },
  };
}

/**
 * 删除模型
 */
export function removeModel(
  state: ModelConfigState,
  providerKey: string,
  modelIndex: number,
): void {
  const provider = state.modelConfigProviders[providerKey];
  if (!provider) return;

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [providerKey]: {
      ...provider,
      models: provider.models.filter((_, idx) => idx !== modelIndex),
    },
  };
}

/**
 * 更新模型字段
 */
export function updateModelField(
  state: ModelConfigState,
  providerKey: string,
  modelIndex: number,
  field: string,
  value: unknown,
): void {
  const provider = state.modelConfigProviders[providerKey];
  if (!provider || !provider.models[modelIndex]) return;

  const updatedModels = [...provider.models];
  updatedModels[modelIndex] = {
    ...updatedModels[modelIndex],
    [field]: value,
  };

  state.modelConfigProviders = {
    ...state.modelConfigProviders,
    [providerKey]: {
      ...provider,
      models: updatedModels,
    },
  };
}

/**
 * 获取可用模型列表
 */
export function getAvailableModels(
  providers: Record<string, ProviderConfig>,
): Array<{ id: string; name: string; provider: string }> {
  const models: Array<{ id: string; name: string; provider: string }> = [];

  for (const [providerKey, provider] of Object.entries(providers)) {
    for (const model of provider.models) {
      models.push({
        id: `${providerKey}/${model.id}`,
        name: model.name,
        provider: providerKey,
      });
    }
  }

  return models;
}
