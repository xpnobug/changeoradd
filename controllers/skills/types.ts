/**
 * 技能配置控制器 - 类型定义
 * Skills config controller - Type definitions
 */
import type { GatewayBrowserClient } from "../../../ui/gateway";
import type {
  SkillStatusReport,
  SkillsConfig,
  SkillSourceFilter,
  SkillStatusFilter,
  SkillEditState,
  SkillMessage,
  SkillEditorState,
  SkillCreateState,
  SkillDeleteState,
  SkillPreviewState,
} from "../../types/skills-config";

// ─── 状态类型 / State type ──────────────────────────────────────────────────

export type SkillsConfigState = {
  client: GatewayBrowserClient | null;
  connected: boolean;

  // 技能数据 (使用 skillsConfig 前缀匹配 app.ts 状态)
  skillsConfigLoading: boolean;
  skillsConfigSaving: boolean;
  skillsConfigError: string | null;
  skillsConfigReport: SkillStatusReport | null;
  skillsConfig: SkillsConfig | null;
  skillsConfigOriginal: SkillsConfig | null;
  skillsConfigBaseHash: string | null;

  // UI 状态
  skillsConfigFilter: string;
  skillsConfigSourceFilter: SkillSourceFilter;
  skillsConfigStatusFilter: SkillStatusFilter;
  skillsConfigExpandedGroups: Set<string>;
  skillsConfigSelectedSkill: string | null;
  skillsConfigBusySkill: string | null;
  skillsConfigMessages: Record<string, SkillMessage>;

  // 白名单状态
  skillsConfigAllowlistMode: "all" | "whitelist";
  skillsConfigAllowlistDraft: Set<string>;

  // 编辑状态
  skillsConfigEdits: Record<string, SkillEditState>;

  // 编辑器/创建/删除状态 (Phase 5-6)
  skillsConfigEditor: SkillEditorState;
  skillsConfigCreate: SkillCreateState;
  skillsConfigDelete: SkillDeleteState;
  skillsConfigPreview: SkillPreviewState;
};

// ─── 重新导出依赖类型 / Re-export dependent types ───────────────────────────

export type {
  SkillStatusReport,
  SkillsConfig,
  SkillSourceFilter,
  SkillStatusFilter,
  SkillEditState,
  SkillMessage,
  SkillEditorState,
  SkillCreateState,
  SkillDeleteState,
  SkillPreviewState,
  EditableSkillSource,
  SkillEditorMode,
} from "../../types/skills-config";

export type { GatewayBrowserClient } from "../../../ui/gateway";
