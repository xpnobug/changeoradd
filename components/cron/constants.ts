/**
 * Cron 组件常量和标签
 * Cron component constants and labels
 */
import type { CronFormState } from "../../types/cron-config";
import {
  clockIcon,
  plusIcon,
  editIcon,
  playIcon,
  trashIcon,
  chevronDownIcon,
  checkIcon,
  xIcon,
  alertCircleIcon,
  refreshIcon,
} from "../icons";

// ─── 中文标签 / Chinese labels ──────────────────────────────────────────────

export const LABELS = {
  // 页面标题
  title: "定时任务",
  desc: "配置和管理 Gateway 定时任务调度",

  // 状态卡片
  schedulerStatus: "调度器状态",
  enabled: "已启用",
  disabled: "已禁用",
  jobCount: "任务数量",
  nextWake: "下次唤醒",
  nJobs: (n: number) => `${n} 个任务`,

  // 操作按钮
  refresh: "刷新",
  refreshing: "刷新中...",

  // 表单
  newJob: "新建任务",
  name: "任务名称",
  namePlaceholder: "输入任务名称",
  description: "任务描述",
  descriptionPlaceholder: "可选：描述任务用途",
  agentId: "Agent ID",
  agentIdPlaceholder: "留空使用默认 Agent",
  enabledLabel: "启用任务",

  // 调度类型
  schedule: "调度方式",
  scheduleAt: "指定时间",
  scheduleEvery: "循环间隔",
  scheduleCron: "Cron 表达式",
  runAt: "运行时间",
  every: "每隔",
  everyUnit: "时间单位",
  minutes: "分钟",
  hours: "小时",
  days: "天",
  cronExpr: "Cron 表达式",
  cronExprPlaceholder: "0 7 * * *",
  cronTz: "时区",
  cronTzPlaceholder: "如: Asia/Shanghai",

  // 会话和唤醒
  sessionTarget: "会话类型",
  sessionMain: "主会话",
  sessionIsolated: "隔离会话",
  wakeMode: "唤醒方式",
  wakeModeNextHeartbeat: "下次心跳",
  wakeModeNow: "立即执行",

  // 负载类型
  payloadKind: "任务类型",
  payloadSystemEvent: "系统事件",
  payloadAgentTurn: "Agent 执行",
  payloadText: "消息内容",
  payloadTextPlaceholder: "输入要执行的消息或命令",

  // Agent 执行选项
  deliver: "投递消息",
  channel: "投递通道",
  channelLast: "上次活跃通道",
  to: "接收者",
  toPlaceholder: "+1555... 或 chat id",
  timeoutSeconds: "超时时间（秒）",
  postToMainPrefix: "回写前缀",
  postToMainPrefixPlaceholder: "隔离会话结果回写到主会话的前缀",

  // 提交
  addJob: "添加任务",
  adding: "添加中...",
  editJob: "编辑任务",
  updateJob: "保存修改",
  updating: "保存中...",

  // 任务列表
  jobsList: "任务列表",
  noJobs: "暂无定时任务",
  noJobsHint: "点击右上方「新建任务」按钮创建第一个定时任务",

  // 任务卡片
  enableJob: "启用",
  disableJob: "禁用",
  runNow: "立即运行",
  viewRuns: "运行记录",
  deleteJob: "删除",

  // 任务详情
  lastStatus: "上次状态",
  nextRun: "下次运行",
  lastRun: "上次运行",
  statusOk: "成功",
  statusError: "失败",
  statusSkipped: "跳过",
  statusNA: "无",

  // 运行历史
  runHistory: "运行历史",
  selectJobToViewRuns: "选择任务查看运行历史",
  noRuns: "暂无运行记录",
  duration: "耗时",

  // 删除确认
  deleteConfirmTitle: "确认删除",
  deleteConfirmDesc: (name: string) => `确定要删除任务 "${name}" 吗？此操作不可撤销。`,
  cancel: "取消",
  confirm: "确认删除",

  // 错误
  error: "错误",
};

// ─── 图标映射 / Icon mapping ────────────────────────────────────────────────

export const icons = {
  clock: clockIcon,
  plus: plusIcon,
  edit: editIcon,
  play: playIcon,
  trash: trashIcon,
  chevronDown: chevronDownIcon,
  check: checkIcon,
  x: xIcon,
  alertCircle: alertCircleIcon,
  refresh: refreshIcon,
};

// ─── 默认表单状态 / Default form state ──────────────────────────────────────

export const DEFAULT_FORM: CronFormState = {
  name: "",
  description: "",
  agentId: "",
  enabled: true,
  scheduleKind: "every",
  scheduleAt: "",
  everyAmount: "30",
  everyUnit: "minutes",
  cronExpr: "0 7 * * *",
  cronTz: "",
  sessionTarget: "main",
  wakeMode: "next-heartbeat",
  payloadKind: "systemEvent",
  payloadText: "",
  deliveryMode: "none",
  deliveryChannel: "last",
  deliveryTo: "",
  timeoutSeconds: "",
};
