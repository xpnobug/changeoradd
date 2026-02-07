/**
 * Cron 组件辅助函数
 * Cron component utility functions
 */
import type { CronContentProps } from "../../types/cron-config";
import { DEFAULT_FORM, LABELS } from "./constants";

// 空函数，用于回调默认值
const noop = () => {};

/**
 * 获取安全的回调函数
 * Get safe callback functions
 */
export function getSafeCallbacks(props: CronContentProps) {
  return {
    onFormChange: props.onFormChange ?? noop,
    onRefresh: props.onRefresh ?? noop,
    onAdd: props.onAdd ?? noop,
    onUpdate: props.onUpdate ?? noop,
    onToggle: props.onToggle ?? noop,
    onRun: props.onRun ?? noop,
    onRemove: props.onRemove ?? noop,
    onLoadRuns: props.onLoadRuns ?? noop,
    onExpandJob: props.onExpandJob ?? noop,
    onDeleteConfirm: props.onDeleteConfirm ?? noop,
    onShowCreateModal: props.onShowCreateModal ?? noop,
    onEdit: props.onEdit ?? noop,
  };
}

/**
 * 构建通道选项列表
 * Build channel options list
 */
export function buildChannelOptions(props: CronContentProps): string[] {
  const channels = props.channels ?? [];
  const options = ["last", ...channels.filter(Boolean)];
  const form = props.form ?? DEFAULT_FORM;
  const current = form.deliveryChannel?.trim();
  if (current && !options.includes(current)) {
    options.push(current);
  }
  const seen = new Set<string>();
  return options.filter((value) => {
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * 解析通道显示标签
 * Resolve channel display label
 */
export function resolveChannelLabel(props: CronContentProps, channel: string): string {
  if (channel === "last") return LABELS.channelLast;
  const meta = props.channelMeta?.find((entry) => entry.id === channel);
  if (meta?.label) return meta.label;
  return props.channelLabels?.[channel] ?? channel;
}
