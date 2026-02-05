/**
 * Cron 定时任务配置类型
 * Cron scheduled task configuration types
 */
import type { CronJob, CronStatus, CronRunLogEntry, ChannelUiMetaEntry, GatewayAgentRow } from "../../ui/types";
import type { CronFormState } from "../../ui/ui-types";

export type { CronFormState };

/**
 * Cron 内容组件 Props
 */
export type CronContentProps = {
  // 加载状态 / Loading states
  loading: boolean;
  busy: boolean;
  error: string | null;

  // 数据 / Data
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

  // 展开状态 / Expansion state
  expandedJobId: string | null;

  // 删除确认 / Delete confirmation
  deleteConfirmJobId: string | null;

  // 新建弹窗状态 / Create modal state
  showCreateModal: boolean;

  // 编辑任务ID / Edit job ID
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
