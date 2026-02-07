/**
 * 技能配置控制器 - UI 状态更新
 * Skills config controller - UI state updates
 */
import type { SkillsConfigState, SkillSourceFilter, SkillStatusFilter } from "./types";

// ─── 筛选器更新 / Filter updates ────────────────────────────────────────────

export function updateSkillsFilter(state: SkillsConfigState, filter: string) {
  state.skillsConfigFilter = filter;
}

export function updateSkillsSourceFilter(
  state: SkillsConfigState,
  source: SkillSourceFilter,
) {
  state.skillsConfigSourceFilter = source;
}

export function updateSkillsStatusFilter(
  state: SkillsConfigState,
  status: SkillStatusFilter,
) {
  state.skillsConfigStatusFilter = status;
}

// ─── 分组切换 / Group toggle ────────────────────────────────────────────────

export function toggleSkillsGroup(state: SkillsConfigState, group: string) {
  // 标签页模式：只保留一个激活的分组（单选）
  const groups = new Set<string>();
  groups.add(group);
  state.skillsConfigExpandedGroups = groups;
}

// ─── 技能选择 / Skill selection ─────────────────────────────────────────────

export function selectSkill(state: SkillsConfigState, skillKey: string | null) {
  state.skillsConfigSelectedSkill = skillKey;
}

// ─── 编辑状态管理 / Edit state management ───────────────────────────────────

export function updateSkillApiKeyEdit(
  state: SkillsConfigState,
  skillKey: string,
  apiKey: string,
) {
  const edits = { ...state.skillsConfigEdits };
  if (!edits[skillKey]) edits[skillKey] = {};
  edits[skillKey].apiKey = apiKey;
  state.skillsConfigEdits = edits;
}

export function updateSkillEnabledEdit(
  state: SkillsConfigState,
  skillKey: string,
  enabled: boolean,
) {
  const edits = { ...state.skillsConfigEdits };
  if (!edits[skillKey]) edits[skillKey] = {};
  edits[skillKey].enabled = enabled;
  state.skillsConfigEdits = edits;
}

// ─── 环境变量编辑 / Environment variable editing ─────────────────────────────

export function updateSkillEnv(
  state: SkillsConfigState,
  skillKey: string,
  envKey: string,
  value: string,
) {
  const edits = { ...state.skillsConfigEdits };
  if (!edits[skillKey]) edits[skillKey] = {};
  if (!edits[skillKey].env) edits[skillKey].env = {};
  edits[skillKey].env![envKey] = value;
  state.skillsConfigEdits = edits;
}

export function removeSkillEnv(
  state: SkillsConfigState,
  skillKey: string,
  envKey: string,
) {
  const edits = { ...state.skillsConfigEdits };
  if (edits[skillKey]?.env) {
    delete edits[skillKey].env![envKey];
    // 如果 env 为空，清除它
    if (Object.keys(edits[skillKey].env!).length === 0) {
      delete edits[skillKey].env;
    }
    // 如果整个编辑状态为空，清除它
    if (Object.keys(edits[skillKey]).length === 0) {
      delete edits[skillKey];
    }
  }
  state.skillsConfigEdits = edits;
}

// ─── 自定义配置编辑 / Custom config editing ──────────────────────────────────

export function updateSkillConfig(
  state: SkillsConfigState,
  skillKey: string,
  config: Record<string, unknown>,
) {
  const edits = { ...state.skillsConfigEdits };
  if (!edits[skillKey]) edits[skillKey] = {};
  edits[skillKey].config = config;
  state.skillsConfigEdits = edits;
}

// ─── 白名单管理 / Allowlist management ──────────────────────────────────────

export function setAllowlistMode(
  state: SkillsConfigState,
  mode: "all" | "whitelist",
) {
  state.skillsConfigAllowlistMode = mode;

  // 如果切换到白名单模式，初始化草稿（如果为空）
  if (mode === "whitelist" && state.skillsConfigAllowlistDraft.size === 0) {
    // 可以选择默认添加一些技能，或保持为空让用户选择
    state.skillsConfigAllowlistDraft = new Set();
  }
}

export function toggleAllowlistEntry(
  state: SkillsConfigState,
  skillKey: string,
  inList: boolean,
) {
  const draft = new Set(state.skillsConfigAllowlistDraft);
  if (inList) {
    draft.add(skillKey);
  } else {
    draft.delete(skillKey);
  }
  state.skillsConfigAllowlistDraft = draft;

  // 也更新编辑状态
  const edits = { ...state.skillsConfigEdits };
  if (!edits[skillKey]) edits[skillKey] = {};
  edits[skillKey].inAllowlist = inList;
  state.skillsConfigEdits = edits;
}
