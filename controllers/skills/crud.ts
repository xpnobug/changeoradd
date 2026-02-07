/**
 * 技能配置控制器 - 创建/删除/预览操作
 * Skills config controller - Create/Delete/Preview operations
 */
import type { SkillsConfigState, EditableSkillSource } from "./types";
import { getErrorMessage } from "./state";
import { loadSkillsStatus } from "./loader";
import { openSkillEditor } from "./editor";

// ─── 常量 / Constants ───────────────────────────────────────────────────────

/**
 * 默认技能模板
 * Default skill template
 */
const DEFAULT_SKILL_TEMPLATE = `---
name: "{{SKILL_NAME}}"
emoji:
description: 在此描述技能的功能
homepage:
requirements:
  bins: []
  env: []
  config: []
  os: []
  anyBins: []
install: []
---

# {{SKILL_NAME}}

在此编写技能的详细说明，指导 Agent 如何使用此技能。

## 用法

描述典型的使用场景和命令。

## 示例

提供具体的示例。
`;

/**
 * 技能名称验证正则（只允许小写字母、数字和连字符）
 * Skill name validation regex (only lowercase letters, numbers and hyphens)
 */
const SKILL_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

/**
 * 验证技能名称
 * Validate skill name
 */
function validateSkillName(name: string): string | null {
  if (!name.trim()) {
    return "技能名称不能为空";
  }
  if (name.includes("/") || name.includes("\\") || name.includes("..")) {
    return "技能名称包含非法字符";
  }
  if (!SKILL_NAME_PATTERN.test(name)) {
    return "技能名称只能包含小写字母、数字和连字符，且不能以连字符开头或结尾";
  }
  return null;
}

// ─── 创建技能操作 / Create skill operations ──────────────────────────────────

/**
 * 打开创建技能弹窗
 * Open create skill modal
 */
export function openCreateSkill(state: SkillsConfigState, source?: EditableSkillSource) {
  state.skillsConfigCreate = {
    open: true,
    name: "",
    source: source ?? "workspace",
    template: "",
    creating: false,
    error: null,
    nameError: null,
  };
}

/**
 * 关闭创建技能弹窗
 * Close create skill modal
 */
export function closeCreateSkill(state: SkillsConfigState) {
  state.skillsConfigCreate = {
    open: false,
    name: "",
    source: "workspace",
    template: "",
    creating: false,
    error: null,
    nameError: null,
  };
}

/**
 * 更新创建技能名称
 * Update create skill name
 */
export function updateCreateSkillName(state: SkillsConfigState, name: string) {
  const nameError = validateSkillName(name);
  state.skillsConfigCreate = {
    ...state.skillsConfigCreate,
    name,
    nameError,
  };
}

/**
 * 更新创建技能来源
 * Update create skill source
 */
export function updateCreateSkillSource(state: SkillsConfigState, source: EditableSkillSource) {
  state.skillsConfigCreate = {
    ...state.skillsConfigCreate,
    source,
  };
}

/**
 * 确认创建技能
 * Confirm create skill
 */
export async function confirmCreateSkill(state: SkillsConfigState) {
  if (!state.client || !state.connected) return;

  const { name, source } = state.skillsConfigCreate;

  // 验证名称
  const nameError = validateSkillName(name);
  if (nameError) {
    state.skillsConfigCreate = {
      ...state.skillsConfigCreate,
      nameError,
    };
    return;
  }

  state.skillsConfigCreate = {
    ...state.skillsConfigCreate,
    creating: true,
    error: null,
  };

  try {
    // 调用 RPC 创建技能
    const content = DEFAULT_SKILL_TEMPLATE.replace(/\{\{SKILL_NAME\}\}/g, name);
    await state.client.request("skills.file.create", {
      skillName: name,
      source,
      content,
    });

    // 关闭创建弹窗
    closeCreateSkill(state);

    // 重新加载技能状态
    await loadSkillsStatus(state);

    // 打开编辑器编辑新创建的技能
    await openSkillEditor(state, name, name, source);
  } catch (err) {
    state.skillsConfigCreate = {
      ...state.skillsConfigCreate,
      creating: false,
      error: getErrorMessage(err),
    };
  }
}

// ─── 删除技能操作 / Delete skill operations ──────────────────────────────────

/**
 * 打开删除确认弹窗
 * Open delete confirmation modal
 */
export function openDeleteSkill(
  state: SkillsConfigState,
  skillKey: string,
  skillName: string,
  source: EditableSkillSource,
) {
  state.skillsConfigDelete = {
    open: true,
    skillKey,
    skillName,
    source,
    deleting: false,
    error: null,
  };
}

/**
 * 关闭删除确认弹窗
 * Close delete confirmation modal
 */
export function closeDeleteSkill(state: SkillsConfigState) {
  state.skillsConfigDelete = {
    open: false,
    skillKey: null,
    skillName: null,
    source: null,
    deleting: false,
    error: null,
  };
}

/**
 * 确认删除技能
 * Confirm delete skill
 */
export async function confirmDeleteSkill(state: SkillsConfigState) {
  if (!state.client || !state.connected) return;

  const { skillKey, source } = state.skillsConfigDelete;
  if (!skillKey || !source) return;

  state.skillsConfigDelete = {
    ...state.skillsConfigDelete,
    deleting: true,
    error: null,
  };

  try {
    // 调用 RPC 删除技能
    // 使用 skillKey（目录名）而非 skillName（显示名）
    await state.client.request("skills.file.delete", {
      skillName: skillKey,
      source,
    });

    // 关闭删除弹窗
    closeDeleteSkill(state);

    // 重新加载技能状态
    await loadSkillsStatus(state);
  } catch (err) {
    state.skillsConfigDelete = {
      ...state.skillsConfigDelete,
      deleting: false,
      error: getErrorMessage(err),
    };
  }
}

// =========================================================================
// 文件预览操作 / File preview operations
// =========================================================================

/**
 * 打开文件预览
 * Open file preview
 */
export async function openSkillPreview(
  state: SkillsConfigState,
  skillKey: string,
  skillName: string,
) {
  if (!state.client || !state.connected) return;

  // 从技能报告中获取技能信息以确定来源
  const skill = state.skillsConfigReport?.skills.find(s => s.skillKey === skillKey);
  if (!skill) return;

  // 确定来源类型和文件路径
  let source: "bundled" | "managed" | "workspace";
  let filePath: string | undefined;

  if (skill.source === "openclaw-bundled") {
    source = "bundled";
    filePath = skill.filePath; // bundled 技能需要提供文件路径
  } else if (skill.source === "openclaw-managed") {
    source = "managed";
  } else {
    source = "workspace";
  }

  // 更新预览状态为加载中
  state.skillsConfigPreview = {
    open: true,
    skillKey,
    skillName,
    content: "",
    loading: true,
    error: null,
  };

  try {
    // 调用 RPC 读取技能文件
    const result = (await state.client.request("skills.file.read", {
      skillName: skillKey,
      source,
      filePath, // bundled 技能需要此参数
    })) as { name: string; path: string; source: string; exists: boolean; content: string };

    state.skillsConfigPreview = {
      ...state.skillsConfigPreview,
      content: result.content,
      loading: false,
    };
  } catch (err) {
    state.skillsConfigPreview = {
      ...state.skillsConfigPreview,
      loading: false,
      error: getErrorMessage(err),
    };
  }
}

/**
 * 关闭文件预览
 * Close file preview
 */
export function closeSkillPreview(state: SkillsConfigState) {
  state.skillsConfigPreview = {
    open: false,
    skillKey: null,
    skillName: null,
    content: "",
    loading: false,
    error: null,
  };
}
