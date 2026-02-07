/**
 * Skills 配置类型定义
 * Skills configuration type definitions
 */

// ─── 技能安装选项 / Skill install option ──────────────────────────────────────

export type SkillInstallOption = {
  id: string;
  kind: "brew" | "node" | "go" | "uv" | "download";
  label: string;
  bins: string[];
};

// ─── 技能状态条目 / Skill status entry ────────────────────────────────────────

export type SkillStatusEntry = {
  name: string;
  description: string;
  source: string;
  filePath: string;
  baseDir: string;
  skillKey: string;
  primaryEnv?: string;
  emoji?: string;
  homepage?: string;
  always: boolean;
  disabled: boolean;
  blockedByAllowlist: boolean;
  eligible: boolean;
  requirements: {
    bins: string[];
    anyBins: string[];
    env: string[];
    config: string[];
    os: string[];
  };
  missing: {
    bins: string[];
    anyBins: string[];
    env: string[];
    config: string[];
    os: string[];
  };
  configChecks: Array<{
    path: string;
    value: unknown;
    satisfied: boolean;
  }>;
  install: SkillInstallOption[];
};

// ─── 技能状态报告 / Skill status report ───────────────────────────────────────

export type SkillStatusReport = {
  workspaceDir: string;
  managedSkillsDir: string;
  skills: SkillStatusEntry[];
};

// ─── 单个技能配置 / Single skill config ───────────────────────────────────────

export type SkillEntryConfig = {
  enabled?: boolean;
  apiKey?: string;
  env?: Record<string, string>;
  config?: Record<string, unknown>;
};

// ─── 技能加载配置 / Skills load config ────────────────────────────────────────

export type SkillsLoadConfig = {
  extraDirs?: string[];
  watch?: boolean;
  watchDebounceMs?: number;
};

// ─── 技能安装配置 / Skills install config ─────────────────────────────────────

export type SkillsInstallConfig = {
  preferBrew?: boolean;
  nodeManager?: "npm" | "pnpm" | "yarn" | "bun";
};

// ─── 完整技能配置 / Full skills config ────────────────────────────────────────

export type SkillsConfig = {
  allowBundled?: string[];
  load?: SkillsLoadConfig;
  install?: SkillsInstallConfig;
  entries?: Record<string, SkillEntryConfig>;
};

// ─── 技能编辑状态 / Skill edit state ──────────────────────────────────────────

export type SkillEditState = {
  enabled?: boolean;
  apiKey?: string;
  env?: Record<string, string>;
  config?: Record<string, unknown>;
  inAllowlist?: boolean;
};

// ─── 技能消息 / Skill message ─────────────────────────────────────────────────

export type SkillMessage = {
  kind: "success" | "error";
  message: string;
};

// ─── 筛选类型 / Filter types ──────────────────────────────────────────────────

export type SkillSourceFilter = "all" | "bundled" | "managed" | "workspace";
export type SkillStatusFilter = "all" | "eligible" | "blocked" | "disabled";

// ─── 技能分组 / Skill group ───────────────────────────────────────────────────

export type SkillGroup = {
  id: string;
  label: string;
  skills: SkillStatusEntry[];
};

// ─── 技能文件来源 / Skill file source ─────────────────────────────────────────

/**
 * 可编辑的技能来源（仅 managed 和 workspace 可编辑）
 * Editable skill sources (only managed and workspace are editable)
 */
export type EditableSkillSource = "managed" | "workspace";

// ─── 技能文件信息 / Skill file info ───────────────────────────────────────────

/**
 * 技能文件信息（来自 skills.files.list RPC）
 * Skill file information (from skills.files.list RPC)
 */
export type SkillFileInfo = {
  name: string;              // 技能名称 / Skill name
  path: string;              // SKILL.md 完整路径 / Full path to SKILL.md
  source: EditableSkillSource; // 来源 / Source
  exists: boolean;           // 是否存在 / Whether file exists
  size: number;              // 文件大小（字节）/ File size in bytes
  modifiedAt: number | null; // 最后修改时间戳 / Last modified timestamp
};

/**
 * 列出技能文件的结果
 * Result of listing skill files
 */
export type SkillFilesListResult = {
  managedDir: string;        // managed 技能目录 / Managed skills directory
  workspaceDir: string;      // workspace 技能目录 / Workspace skills directory
  skills: SkillFileInfo[];   // 技能列表 / Skill list
};

// ─── 编辑器视图模式 / Editor view mode ────────────────────────────────────────

/**
 * 编辑器视图模式
 * Editor view mode
 */
export type SkillEditorMode = "edit" | "preview" | "split";

// ─── 编辑器状态 / Editor state ────────────────────────────────────────────────

/**
 * 技能编辑器状态
 * Skill editor state
 */
export type SkillEditorState = {
  open: boolean;                    // 编辑器是否打开 / Whether editor is open
  skillKey: string | null;          // 当前编辑的技能键 / Current editing skill key
  skillName: string | null;         // 当前编辑的技能名称 / Current editing skill name
  source: EditableSkillSource | null; // 技能来源 / Skill source
  content: string;                  // 编辑器内容 / Editor content
  original: string;                 // 原始内容（用于脏检查）/ Original content (for dirty check)
  mode: SkillEditorMode;            // 编辑模式 / Edit mode
  saving: boolean;                  // 保存中 / Saving
  loading: boolean;                 // 加载中 / Loading
  error: string | null;             // 错误信息 / Error message
};

/**
 * 创建技能弹窗状态
 * Create skill modal state
 */
export type SkillCreateState = {
  open: boolean;                    // 弹窗是否打开 / Whether modal is open
  name: string;                     // 新技能名称 / New skill name
  source: EditableSkillSource;      // 创建位置 / Create location
  template: string;                 // 模板内容 / Template content
  creating: boolean;                // 创建中 / Creating
  error: string | null;             // 错误信息 / Error message
  nameError: string | null;         // 名称验证错误 / Name validation error
};

/**
 * 删除技能确认状态
 * Delete skill confirmation state
 */
export type SkillDeleteState = {
  open: boolean;                    // 确认弹窗是否打开 / Whether confirmation is open
  skillKey: string | null;          // 待删除的技能键 / Skill key to delete
  skillName: string | null;         // 待删除的技能名称 / Skill name to delete
  source: EditableSkillSource | null; // 技能来源 / Skill source
  deleting: boolean;                // 删除中 / Deleting
  error: string | null;             // 错误信息 / Error message
};

// ─── 技能文件预览状态 / Skill file preview state ─────────────────────────────────

/**
 * 技能文件预览状态（只读查看）
 * Skill file preview state (read-only view)
 */
export type SkillPreviewState = {
  open: boolean;                    // 预览是否打开 / Whether preview is open
  skillKey: string | null;          // 技能键 / Skill key
  skillName: string | null;         // 技能名称 / Skill name
  content: string;                  // 文件内容 / File content
  loading: boolean;                 // 加载中 / Loading
  error: string | null;             // 错误信息 / Error message
};

// ─── 组件属性 / Component props ───────────────────────────────────────────────

export type SkillsContentProps = {
  // 加载状态 / Loading state
  loading: boolean;
  saving: boolean;
  error: string | null;

  // 数据 / Data
  report: SkillStatusReport | null;
  config: SkillsConfig | null;
  hasChanges: boolean;

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

  // 回调 / Callbacks
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
  // Phase 3: 环境变量和配置编辑 / Env and config editing
  onSkillEnvChange: (skillKey: string, envKey: string, value: string) => void;
  onSkillEnvRemove: (skillKey: string, envKey: string) => void;
  onSkillConfigChange: (skillKey: string, config: Record<string, unknown>) => void;
  onExtraDirsChange: (dirs: string[]) => void;

  // Phase 5-6: 编辑器相关 / Editor related
  editorState: SkillEditorState;
  createState: SkillCreateState;
  deleteState: SkillDeleteState;
  previewState: SkillPreviewState;

  // 编辑器回调 / Editor callbacks
  onEditorOpen: (skillKey: string, skillName: string, source: EditableSkillSource) => void;
  onEditorClose: () => void;
  onEditorContentChange: (content: string) => void;
  onEditorModeChange: (mode: SkillEditorMode) => void;
  onEditorSave: () => void;

  // 创建技能回调 / Create skill callbacks
  onCreateOpen: (source?: EditableSkillSource) => void;
  onCreateClose: () => void;
  onCreateNameChange: (name: string) => void;
  onCreateSourceChange: (source: EditableSkillSource) => void;
  onCreateConfirm: () => void;

  // 删除技能回调 / Delete skill callbacks
  onDeleteOpen: (skillKey: string, skillName: string, source: EditableSkillSource) => void;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;

  // 文件预览回调 / File preview callbacks
  onPreviewOpen: (skillKey: string, skillName: string) => void;
  onPreviewClose: () => void;
};
