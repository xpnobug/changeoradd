/**
 * Agent 配置页面视图
 * Agent configuration page view
 *
 * ⚠️ 此文件已重构，实际实现已拆分到 ./agents/ 目录
 * 保留此文件以保持向后兼容
 */

// 从新模块重新导出所有内容
export {
  // 主组件
  renderAgentsConfig,
  // 面板渲染器
  renderActivePanel,
  renderGlobalPanel,
  // 类型
  type AgentsConfigProps,
} from "./agents";
