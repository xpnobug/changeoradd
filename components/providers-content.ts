/**
 * 模型供应商配置内容组件
 * 右侧面板 - 供应商管理
 *
 * ⚠️ 此文件已重构，实际实现已拆分到 ./providers/ 目录
 * 保留此文件以保持向后兼容
 */

// 从新模块重新导出所有内容
export {
  // 主组件
  renderProvidersContent,
  // 子组件
  renderProviderCard,
  renderModelRow,
  renderModelAdvanced,
  renderHeadersEditor,
  renderAddProviderModal,
  // 类型
  type ProvidersContentProps,
  type ProviderFormState,
  // 常量
  icons,
  LABELS,
  API_PROTOCOLS,
  AUTH_MODES,
  DEFAULT_PROVIDER_FORM,
} from "./providers";
