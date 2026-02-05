/**
 * 格式化工具函数
 * Format utility functions
 *
 * 本地副本，减少对 ../../ui/format 的依赖
 * Local copy to reduce dependency on ../../ui/format
 */

/**
 * 格式化时间戳为本地时间字符串
 */
export function formatMs(ms?: number | null): string {
  if (!ms && ms !== 0) {
    return "n/a";
  }
  return new Date(ms).toLocaleString();
}

/**
 * 格式化相对时间（多久之前）
 */
export function formatAgo(ms?: number | null): string {
  if (!ms && ms !== 0) {
    return "n/a";
  }
  const diff = Date.now() - ms;
  const absDiff = Math.abs(diff);
  const suffix = diff < 0 ? "后" : "前";
  const sec = Math.round(absDiff / 1000);
  if (sec < 60) {
    return diff < 0 ? "刚刚" : `${sec}秒${suffix}`;
  }
  const min = Math.round(sec / 60);
  if (min < 60) {
    return `${min}分钟${suffix}`;
  }
  const hr = Math.round(min / 60);
  if (hr < 48) {
    return `${hr}小时${suffix}`;
  }
  const day = Math.round(hr / 24);
  return `${day}天${suffix}`;
}

/**
 * 格式化持续时间
 */
export function formatDurationMs(ms?: number | null): string {
  if (!ms && ms !== 0) {
    return "n/a";
  }
  if (ms < 1000) {
    return `${ms}毫秒`;
  }
  const sec = Math.round(ms / 1000);
  if (sec < 60) {
    return `${sec}秒`;
  }
  const min = Math.round(sec / 60);
  if (min < 60) {
    return `${min}分钟`;
  }
  const hr = Math.round(min / 60);
  if (hr < 48) {
    return `${hr}小时`;
  }
  const day = Math.round(hr / 24);
  return `${day}天`;
}
