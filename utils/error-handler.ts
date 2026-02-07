/**
 * 统一错误处理工具函数
 * Unified error handling utility functions
 */

import { GatewayRequestError } from "../../ui/gateway";

/**
 * 错误上下文类型
 * Error context types
 */
export type ErrorContext =
  | "config.load"
  | "config.save"
  | "config.apply"
  | "sessions.load"
  | "sessions.create"
  | "workspace.read"
  | "workspace.write"
  | "skills.load"
  | "skills.save"
  | "skills.install"
  | "cron.load"
  | "cron.create"
  | "cron.update"
  | "cron.remove"
  | "permissions.load"
  | "permissions.save"
  | "agent.identity"
  | "channels.status";

/**
 * 错误消息映射
 * Error message mapping
 */
const ERROR_MESSAGES: Record<ErrorContext, string> = {
  "config.load": "加载配置失败",
  "config.save": "保存配置失败",
  "config.apply": "应用配置失败",
  "sessions.load": "加载会话列表失败",
  "sessions.create": "创建会话失败",
  "workspace.read": "读取文件失败",
  "workspace.write": "保存文件失败",
  "skills.load": "加载技能状态失败",
  "skills.save": "保存技能配置失败",
  "skills.install": "安装技能依赖失败",
  "cron.load": "加载定时任务失败",
  "cron.create": "创建定时任务失败",
  "cron.update": "更新定时任务失败",
  "cron.remove": "删除定时任务失败",
  "permissions.load": "加载权限配置失败",
  "permissions.save": "保存权限配置失败",
  "agent.identity": "加载 Agent 身份失败",
  "channels.status": "加载通道状态失败",
};

/**
 * 格式化错误消息
 * Format error message
 *
 * @param context - 错误上下文
 * @param error - 错误对象
 * @returns 格式化后的错误消息
 */
export function formatError(context: ErrorContext, error: unknown): string {
  const baseMessage = ERROR_MESSAGES[context];
  const errorDetail = extractErrorMessage(error);
  return `${baseMessage}: ${errorDetail}`;
}

/**
 * 从错误对象中提取错误消息
 * Extract error message from error object
 *
 * @param error - 错误对象
 * @returns 错误消息字符串
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * 从 GatewayRequestError 中提取详细错误信息
 * Extract detailed error info from GatewayRequestError
 *
 * @param error - 错误对象
 * @returns 详细错误信息或 null
 */
export function extractErrorDetails(error: unknown): string | null {
  if (!(error instanceof GatewayRequestError)) {
    return null;
  }

  const details = error.details;
  if (!details || typeof details !== "object") {
    return null;
  }

  // 处理 Zod 验证错误格式
  const zodErrors = details as { issues?: Array<{ path?: unknown[]; message?: string }> };
  if (Array.isArray(zodErrors.issues)) {
    const messages = zodErrors.issues.map((issue) => {
      const path = Array.isArray(issue.path) ? issue.path.join(".") : "";
      const msg = issue.message ?? "Unknown error";
      return path ? `${path}: ${msg}` : msg;
    });
    return messages.join("\n");
  }

  // 尝试 JSON 序列化
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return null;
  }
}

/**
 * 格式化带详细信息的错误消息
 * Format error message with details
 *
 * @param context - 错误上下文
 * @param error - 错误对象
 * @returns 格式化后的错误消息（包含详细信息）
 */
export function formatErrorWithDetails(context: ErrorContext, error: unknown): string {
  const baseMessage = formatError(context, error);
  const details = extractErrorDetails(error);

  if (details) {
    return `${baseMessage}\n\n详细信息:\n${details}`;
  }

  return baseMessage;
}
