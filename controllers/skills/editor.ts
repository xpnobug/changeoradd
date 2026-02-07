/**
 * 技能配置控制器 - 编辑器操作
 * Skills config controller - Editor operations
 */
import type { SkillsConfigState, EditableSkillSource, SkillEditorMode } from "./types";
import { getErrorMessage } from "./state";
import { loadSkillsStatus } from "./loader";

// ─── 编辑器操作 / Editor operations ──────────────────────────────────────────

/**
 * 打开技能编辑器
 * Open skill editor
 */
export async function openSkillEditor(
  state: SkillsConfigState,
  skillKey: string,
  skillName: string,
  source: EditableSkillSource,
) {
  if (!state.client || !state.connected) return;

  // 更新编辑器状态为加载中
  state.skillsConfigEditor = {
    ...state.skillsConfigEditor,
    open: true,
    skillKey,
    skillName,
    source,
    content: "",
    original: "",
    loading: true,
    error: null,
  };

  try {
    // 调用 RPC 读取技能文件
    // 使用 skillKey（目录名）而非 skillName（显示名）
    const result = (await state.client.request("skills.file.read", {
      skillName: skillKey,
      source,
    })) as { name: string; path: string; source: string; exists: boolean; content: string };

    state.skillsConfigEditor = {
      ...state.skillsConfigEditor,
      content: result.content,
      original: result.content,
      loading: false,
    };
  } catch (err) {
    state.skillsConfigEditor = {
      ...state.skillsConfigEditor,
      loading: false,
      error: getErrorMessage(err),
    };
  }
}

/**
 * 关闭技能编辑器
 * Close skill editor
 */
export function closeSkillEditor(state: SkillsConfigState) {
  state.skillsConfigEditor = {
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
  };
}

/**
 * 更新编辑器内容
 * Update editor content
 */
export function updateEditorContent(state: SkillsConfigState, content: string) {
  state.skillsConfigEditor = {
    ...state.skillsConfigEditor,
    content,
  };
}

/**
 * 更新编辑器模式
 * Update editor mode
 */
export function updateEditorMode(state: SkillsConfigState, mode: SkillEditorMode) {
  state.skillsConfigEditor = {
    ...state.skillsConfigEditor,
    mode,
  };
}

/**
 * 保存技能文件
 * Save skill file
 */
export async function saveSkillFile(state: SkillsConfigState) {
  if (!state.client || !state.connected) return;

  const { skillKey, source, content } = state.skillsConfigEditor;
  if (!skillKey || !source) return;

  state.skillsConfigEditor = {
    ...state.skillsConfigEditor,
    saving: true,
    error: null,
  };

  try {
    // 使用 skillKey（目录名）而非 skillName（显示名）
    await state.client.request("skills.file.write", {
      skillName: skillKey,
      source,
      content,
    });

    state.skillsConfigEditor = {
      ...state.skillsConfigEditor,
      original: content,
      saving: false,
    };

    // 重新加载技能状态以反映更改
    await loadSkillsStatus(state);
  } catch (err) {
    state.skillsConfigEditor = {
      ...state.skillsConfigEditor,
      saving: false,
      error: getErrorMessage(err),
    };
  }
}
