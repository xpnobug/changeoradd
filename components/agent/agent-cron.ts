/**
 * Agent 定时任务配置面板组件
 * Agent cron jobs configuration panel component
 *
 * 复用定时任务管理布局：任务列表 + 表单 + 运行历史
 * Reuses cron management layout: job list + form + run history
 */
import { html, nothing } from "lit";
import { renderCronContent } from "../cron-content";
import type { CronContentProps } from "../../types/cron-config";
import type { CronJob, CronStatus, CronRunLogEntry, ChannelUiMetaEntry, GatewayAgentRow } from "../../../ui/types";
import type { CronFormState } from "../../../ui/ui-types";

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// Re-export CronJob for backward compatibility (simplified version)
export type { CronJob };

export type AgentCronProps = {
  // Agent 基本信息 / Agent basic info
  agentId: string;
  agentName?: string;

  // 加载状态 / Loading state
  loading: boolean;
  busy: boolean;
  error: string | null;

  // Cron 数据 / Cron data
  status: CronStatus | null;
  jobs: CronJob[];
  form: CronFormState;

  // Agent 列表 / Agent list
  agents: GatewayAgentRow[];
  defaultAgentId: string;

  // 通道关联 / Channel association
  channels: string[];
  channelLabels?: Record<string, string>;
  channelMeta?: ChannelUiMetaEntry[];

  // 运行历史 / Run history
  runsJobId: string | null;
  runs: CronRunLogEntry[];

  // UI 状态 / UI state
  expandedJobId: string | null;
  deleteConfirmJobId: string | null;
  showCreateModal: boolean;
  editJobId: string | null;

  // 回调函数 / Callbacks
  onFormChange: (patch: Partial<CronFormState>) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onUpdate: () => void;
  onToggle: (job: CronJob, enabled: boolean) => void;
  onRun: (job: CronJob) => void;
  onRemove: (job: CronJob) => void;
  onLoadRuns: (jobId: string) => void;
  onExpandJob: (jobId: string | null) => void;
  onDeleteConfirm: (jobId: string | null) => void;
  onShowCreateModal: (show: boolean) => void;
  onEdit: (job: CronJob) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// 渲染函数 / Render Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染 Agent 定时任务配置面板
 * Render agent cron jobs configuration panel
 *
 * 直接复用 cron-content 布局，提供完整的定时任务管理体验
 * Directly reuses cron-content layout for full cron management experience
 */
export function renderAgentCron(props: AgentCronProps) {
  const {
    agentId,
    agentName,
    loading,
    busy,
    error,
    status,
    jobs,
    form,
    agents,
    defaultAgentId,
    channels,
    channelLabels,
    channelMeta,
    runsJobId,
    runs,
    expandedJobId,
    deleteConfirmJobId,
    showCreateModal,
    editJobId,
    onFormChange,
    onRefresh,
    onAdd,
    onUpdate,
    onToggle,
    onRun,
    onRemove,
    onLoadRuns,
    onExpandJob,
    onDeleteConfirm,
    onShowCreateModal,
    onEdit,
  } = props;

  // 构建 CronContentProps
  // Build CronContentProps
  const cronContentProps: CronContentProps = {
    loading,
    busy,
    error,
    status,
    jobs,
    form,
    agents,
    defaultAgentId,
    channels,
    channelLabels,
    channelMeta,
    runsJobId,
    runs,
    expandedJobId,
    deleteConfirmJobId,
    showCreateModal,
    editJobId,
    onFormChange,
    onRefresh,
    onAdd,
    onUpdate,
    onToggle,
    onRun,
    onRemove,
    onLoadRuns,
    onExpandJob,
    onDeleteConfirm,
    onShowCreateModal,
    onEdit,
  };

  // 使用 cron-content 布局渲染
  // Render using cron-content layout
  return renderCronContent(cronContentProps);
}
