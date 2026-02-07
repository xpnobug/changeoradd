/**
 * Cron 定时任务内容组件
 * Cron scheduled task content component
 *
 * ⚠️ 此文件已重构，实际实现已拆分到 ./cron/ 目录
 * 保留此文件以保持向后兼容
 */

// 从新模块重新导出所有内容
export {
  // 主组件
  renderCronContent,
  // 子组件
  renderStatusCard,
  renderScheduleFields,
  renderCreateModal,
  renderJobCard,
  renderJobsList,
  renderDeleteConfirmModal,
  renderRunHistory,
  // 常量
  LABELS,
  icons,
  DEFAULT_FORM,
  // 工具函数
  getSafeCallbacks,
  buildChannelOptions,
  resolveChannelLabel,
} from "./cron";
