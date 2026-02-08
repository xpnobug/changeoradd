/**
 * 工具权限共享常量
 * Shared constants for tools permissions
 */
import type { ToolGroupDef, StandaloneToolDef, ToolProfileOption } from "./types";

/**
 * 工具描述定义
 */
export const TOOL_DESCRIPTIONS: Record<string, string> = {
  // 文件操作
  read: "读取文件内容（文本或图片），支持分页读取大文件",
  write: "创建或覆盖文件，自动创建父目录",
  edit: "精确替换文件中的文本内容",
  apply_patch: "应用补丁文件修改",
  // 命令执行
  exec: "执行 Shell 命令，支持后台运行和交互式终端",
  process: "管理运行中的进程（列表/状态/日志/终止）",
  // 网络访问
  web_search: "使用 Brave 搜索 API 进行网络搜索",
  web_fetch: "抓取 URL 内容并转换为 Markdown",
  browser: "控制浏览器（打开/导航/截图/操作）",
  // 设备与展示
  nodes: "管理配对设备（通知/拍照/录制/定位）",
  canvas: "展示内容到画布（演示/截图/执行JS）",
  // 定时任务
  cron: "管理定时任务（添加/修改/删除/执行）",
  // 消息通信
  message: "发送消息到指定目标或广播",
  tts: "文字转语音，返回音频文件",
  // 图像分析
  image: "使用视觉模型分析图片内容",
  // 系统管理
  gateway: "系统管理（重启/配置/更新）",
  // 会话管理
  sessions_list: "列出所有会话",
  sessions_history: "获取会话的消息历史",
  sessions_send: "向其他会话发送消息",
  sessions_spawn: "启动子代理执行任务",
  session_status: "查看/设置会话状态",
  agents_list: "列出可用于 spawn 的代理",
  // 记忆系统
  memory_search: "语义搜索记忆文件",
  memory_get: "读取记忆文件指定行",
};

/**
 * 工具分组定义
 */
export const TOOL_GROUPS: Record<string, ToolGroupDef> = {
  "group:fs": {
    label: "文件系统",
    desc: "文件读写和编辑操作",
    tools: ["read", "write", "edit", "apply_patch"],
  },
  "group:runtime": {
    label: "运行时",
    desc: "命令执行和进程管理",
    tools: ["exec", "process"],
  },
  "group:web": {
    label: "网络",
    desc: "网络搜索和内容抓取",
    tools: ["web_search", "web_fetch"],
  },
  "group:ui": {
    label: "界面",
    desc: "浏览器和画布控制",
    tools: ["browser", "canvas"],
  },
  "group:sessions": {
    label: "会话",
    desc: "会话和子代理管理",
    tools: ["sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"],
  },
  "group:memory": {
    label: "记忆",
    desc: "记忆搜索和读取",
    tools: ["memory_search", "memory_get"],
  },
  "group:automation": {
    label: "自动化",
    desc: "定时任务和系统管理",
    tools: ["cron", "gateway"],
  },
  "group:messaging": {
    label: "消息",
    desc: "消息发送和广播",
    tools: ["message"],
  },
  "group:nodes": {
    label: "设备",
    desc: "配对设备控制",
    tools: ["nodes"],
  },
};

/**
 * 独立工具列表（不属于任何分组）
 */
export const STANDALONE_TOOLS: StandaloneToolDef[] = [
  { id: "tts", label: "语音合成" },
  { id: "image", label: "图像分析" },
  { id: "agents_list", label: "代理列表" },
];

/**
 * 工具配置档案选项
 */
export const TOOL_PROFILES: ToolProfileOption[] = [
  { value: "minimal", label: "最小", description: "仅 session_status" },
  { value: "coding", label: "编程", description: "文件+运行时+会话+记忆+image" },
  { value: "messaging", label: "消息", description: "消息+部分会话工具" },
  { value: "full", label: "完整", description: "所有工具" },
];

/**
 * 计算工具总数
 */
export function getTotalToolsCount(): number {
  return (
    Object.values(TOOL_GROUPS).reduce((sum, group) => sum + group.tools.length, 0) +
    STANDALONE_TOOLS.length
  );
}

/**
 * 检查工具是否被禁用
 */
export function isToolDenied(toolId: string, denyList: string[]): boolean {
  // 直接禁用
  if (denyList.includes(toolId)) return true;
  // 通过分组禁用
  for (const [groupId, group] of Object.entries(TOOL_GROUPS)) {
    if (group.tools.includes(toolId) && denyList.includes(groupId)) {
      return true;
    }
  }
  return false;
}

/**
 * 检查分组是否被禁用
 */
export function isGroupDenied(groupId: string, denyList: string[]): boolean {
  return denyList.includes(groupId);
}
