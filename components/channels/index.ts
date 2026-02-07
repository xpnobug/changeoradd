/**
 * 通道配置组件导出入口
 */

// 元数据
export { CHANNEL_METADATA } from "./channel-metadata";

// 图标工具
export { icons, getChannelIcon } from "./channel-icons";

// 字段渲染
export { renderConfigField, resolveNestedValue } from "./channel-field-renderer";

// 列表组件
export { renderChannelList, type ChannelListProps } from "./channel-list";

// 详情组件
export { renderChannelDetail, type ChannelDetailProps } from "./channel-detail";
