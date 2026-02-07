/**
 * 技能配置控制器 - 初始状态和辅助函数
 * Skills config controller - Initial state and helper functions
 */
import type { SkillsConfigState, SkillMessage } from "./types";

// ─── 初始状态 / Initial state ───────────────────────────────────────────────

export function createInitialSkillsConfigState(): Partial<SkillsConfigState> {
  return {
    skillsConfigLoading: false,
    skillsConfigSaving: false,
    skillsConfigError: null,
    skillsConfigReport: null,
    skillsConfig: null,
    skillsConfigOriginal: null,
    skillsConfigBaseHash: null,
    skillsConfigFilter: "",
    skillsConfigSourceFilter: "all",
    skillsConfigStatusFilter: "all",
    skillsConfigExpandedGroups: new Set(["bundled"]),
    skillsConfigSelectedSkill: null,
    skillsConfigBusySkill: null,
    skillsConfigMessages: {},
    skillsConfigAllowlistMode: "all",
    skillsConfigAllowlistDraft: new Set(),
    skillsConfigEdits: {},
    // 编辑器初始状态 / Editor initial state
    skillsConfigEditor: {
      open: false,
      skillKey: null,
      skillName: null,
      source: null,
      content: "",
      original: "",
      mode: "edit",
      saving: false,
      loading: false,
      error: null,
    },
    // 创建弹窗初始状态 / Create modal initial state
    skillsConfigCreate: {
      open: false,
      name: "",
      source: "workspace",
      template: "",
      creating: false,
      error: null,
      nameError: null,
    },
    // 删除确认初始状态 / Delete confirmation initial state
    skillsConfigDelete: {
      open: false,
      skillKey: null,
      skillName: null,
      source: null,
      deleting: false,
      error: null,
    },
    // 文件预览初始状态 / File preview initial state
    skillsConfigPreview: {
      open: false,
      skillKey: null,
      skillName: null,
      content: "",
      loading: false,
      error: null,
    },
  };
}

// ─── 辅助函数 / Helper functions ────────────────────────────────────────────

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function setSkillMessage(
  state: SkillsConfigState,
  key: string,
  message?: SkillMessage,
) {
  if (!key.trim()) return;
  const next = { ...state.skillsConfigMessages };
  if (message) next[key] = message;
  else delete next[key];
  state.skillsConfigMessages = next;
}

/**
 * 检测是否有未保存的更改
 * Check if there are unsaved changes
 */
export function hasSkillsConfigChanges(state: SkillsConfigState): boolean {
  // 检查编辑状态
  if (Object.keys(state.skillsConfigEdits).length > 0) {
    for (const edit of Object.values(state.skillsConfigEdits)) {
      if (edit.enabled !== undefined || edit.apiKey !== undefined || edit.inAllowlist !== undefined) {
        return true;
      }
      // 检查环境变量变更
      if (edit.env && Object.keys(edit.env).length > 0) {
        return true;
      }
      // 检查自定义配置变更
      if (edit.config && Object.keys(edit.config).length > 0) {
        return true;
      }
    }
  }

  // 检查白名单草稿与原配置的差异
  const originalAllowBundled = state.skillsConfigOriginal?.allowBundled ?? [];
  const currentAllowBundled = Array.from(state.skillsConfigAllowlistDraft);

  if (state.skillsConfigAllowlistMode === "whitelist") {
    if (originalAllowBundled.length !== currentAllowBundled.length) return true;
    for (const key of currentAllowBundled) {
      if (!originalAllowBundled.includes(key)) return true;
    }
  }

  return false;
}

/**
 * 检测编辑器是否有未保存的更改
 * Check if editor has unsaved changes
 */
export function hasEditorChanges(state: SkillsConfigState): boolean {
  const { content, original } = state.skillsConfigEditor;
  return content !== original;
}
