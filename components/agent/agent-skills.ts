/**
 * Agent 技能配置面板组件
 * Agent skills configuration panel component
 *
 * 复用技能管理的布局
 * Reuses the skills management layout
 */
import { html, nothing } from "lit";
import { renderSkillsContent } from "../skills-content";
import type {
  SkillsContentProps,
  SkillStatusReport,
  SkillsConfig,
  SkillSourceFilter,
  SkillStatusFilter,
  SkillMessage,
  SkillEditState,
  SkillEditorState,
  SkillCreateState,
  SkillDeleteState,
  SkillPreviewState,
  EditableSkillSource,
  SkillEditorMode,
} from "../../types/skills-config";

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// Re-export SkillInfo for backward compatibility
export type SkillInfo = {
  id: string;
  name: string;
  description?: string;
  version?: string;
  enabled?: boolean;
};

export type AgentSkillsProps = {
  // Agent 基本信息 / Agent basic info
  agentId: string;
  agentName?: string;

  // 加载状态 / Loading state
  loading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;

  // 技能数据 / Skills data
  report: SkillStatusReport | null;
  config: SkillsConfig | null;

  // UI 状态 / UI state
  filter: string;
  sourceFilter: SkillSourceFilter;
  statusFilter: SkillStatusFilter;
  expandedGroups: Set<string>;
  selectedSkill: string | null;
  busySkill: string | null;
  messages: Record<string, SkillMessage>;

  // 白名单 / Allowlist
  allowlistMode: "all" | "whitelist";
  allowlistDraft: Set<string>;

  // 编辑状态 / Edit state
  edits: Record<string, SkillEditState>;

  // 编辑器状态 / Editor state
  editorState: SkillEditorState;
  createState: SkillCreateState;
  deleteState: SkillDeleteState;
  previewState: SkillPreviewState;

  // 回调函数 / Callbacks
  onRefresh: () => void;
  onSave: () => void;
  onFilterChange: (filter: string) => void;
  onSourceFilterChange: (source: SkillSourceFilter) => void;
  onStatusFilterChange: (status: SkillStatusFilter) => void;
  onGroupToggle: (group: string) => void;
  onSkillSelect: (skillKey: string | null) => void;
  onSkillToggle: (skillKey: string, enabled: boolean) => void;
  onSkillApiKeyChange: (skillKey: string, apiKey: string) => void;
  onSkillApiKeySave: (skillKey: string) => void;
  onAllowlistModeChange: (mode: "all" | "whitelist") => void;
  onAllowlistToggle: (skillKey: string, inList: boolean) => void;
  onInstall: (skillKey: string, name: string, installId: string) => void;
  onGlobalSettingChange: (field: string, value: unknown) => void;
  onSkillEnvChange: (skillKey: string, envKey: string, value: string) => void;
  onSkillEnvRemove: (skillKey: string, envKey: string) => void;
  onSkillConfigChange: (skillKey: string, config: Record<string, unknown>) => void;
  onExtraDirsChange: (dirs: string[]) => void;

  // 编辑器回调 / Editor callbacks
  onEditorOpen: (skillKey: string, skillName: string, source: EditableSkillSource) => void;
  onEditorClose: () => void;
  onEditorContentChange: (content: string) => void;
  onEditorModeChange: (mode: SkillEditorMode) => void;
  onEditorSave: () => void;
  onCreateOpen: (source?: EditableSkillSource) => void;
  onCreateClose: () => void;
  onCreateNameChange: (name: string) => void;
  onCreateSourceChange: (source: EditableSkillSource) => void;
  onCreateConfirm: () => void;
  onDeleteOpen: (skillKey: string, skillName: string, source: EditableSkillSource) => void;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
  onPreviewOpen: (skillKey: string, skillName: string) => void;
  onPreviewClose: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// 渲染函数 / Render Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染 Agent 技能配置面板
 * Render agent skills configuration panel
 *
 * 直接复用 skills-content 布局，提供完整的技能管理体验
 * Directly reuses skills-content layout for full skills management experience
 */
export function renderAgentSkills(props: AgentSkillsProps) {
  const {
    agentId,
    agentName,
    loading,
    saving,
    error,
    hasChanges,
    report,
    config,
    filter,
    sourceFilter,
    statusFilter,
    expandedGroups,
    selectedSkill,
    busySkill,
    messages,
    allowlistMode,
    allowlistDraft,
    edits,
    editorState,
    createState,
    deleteState,
    previewState,
    onRefresh,
    onSave,
    onFilterChange,
    onSourceFilterChange,
    onStatusFilterChange,
    onGroupToggle,
    onSkillSelect,
    onSkillToggle,
    onSkillApiKeyChange,
    onSkillApiKeySave,
    onAllowlistModeChange,
    onAllowlistToggle,
    onInstall,
    onGlobalSettingChange,
    onSkillEnvChange,
    onSkillEnvRemove,
    onSkillConfigChange,
    onExtraDirsChange,
    onEditorOpen,
    onEditorClose,
    onEditorContentChange,
    onEditorModeChange,
    onEditorSave,
    onCreateOpen,
    onCreateClose,
    onCreateNameChange,
    onCreateSourceChange,
    onCreateConfirm,
    onDeleteOpen,
    onDeleteClose,
    onDeleteConfirm,
    onPreviewOpen,
    onPreviewClose,
  } = props;

  // 构建 SkillsContentProps
  // Build SkillsContentProps
  const skillsContentProps: SkillsContentProps = {
    loading,
    saving,
    error,
    report,
    config,
    hasChanges,
    filter,
    sourceFilter,
    statusFilter,
    expandedGroups,
    selectedSkill,
    busySkill,
    messages,
    allowlistMode,
    allowlistDraft,
    edits,
    editorState,
    createState,
    deleteState,
    previewState,
    onRefresh,
    onSave,
    onFilterChange,
    onSourceFilterChange,
    onStatusFilterChange,
    onGroupToggle,
    onSkillSelect,
    onSkillToggle,
    onSkillApiKeyChange,
    onSkillApiKeySave,
    onAllowlistModeChange,
    onAllowlistToggle,
    onInstall,
    onGlobalSettingChange,
    onSkillEnvChange,
    onSkillEnvRemove,
    onSkillConfigChange,
    onExtraDirsChange,
    onEditorOpen,
    onEditorClose,
    onEditorContentChange,
    onEditorModeChange,
    onEditorSave,
    onCreateOpen,
    onCreateClose,
    onCreateNameChange,
    onCreateSourceChange,
    onCreateConfirm,
    onDeleteOpen,
    onDeleteClose,
    onDeleteConfirm,
    onPreviewOpen,
    onPreviewClose,
  };

  // 使用 skills-content 布局渲染
  // Render using skills-content layout
  return renderSkillsContent(skillsContentProps);
}
