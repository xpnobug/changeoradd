/**
 * 技能配置控制器 - 技能操作
 * Skills config controller - Skill actions
 */
import type { SkillsConfigState } from "./types";
import { getErrorMessage, setSkillMessage } from "./state";
import { loadSkillsStatus } from "./loader";

// ─── 切换技能启用状态 / Toggle skill enabled ────────────────────────────────

export async function updateSkillEnabled(
  state: SkillsConfigState,
  skillKey: string,
  enabled: boolean,
) {
  if (!state.client || !state.connected) return;

  state.skillsConfigBusySkill = skillKey;
  state.skillsConfigError = null;

  try {
    await state.client.request("skills.update", { skillKey, enabled });
    await loadSkillsStatus(state);
    setSkillMessage(state, skillKey, {
      kind: "success",
      message: enabled ? "技能已启用" : "技能已禁用",
    });
  } catch (err) {
    const message = getErrorMessage(err);
    state.skillsConfigError = message;
    setSkillMessage(state, skillKey, { kind: "error", message });
  } finally {
    state.skillsConfigBusySkill = null;
  }
}

// ─── 保存 API Key / Save API key ────────────────────────────────────────────

export async function saveSkillApiKey(
  state: SkillsConfigState,
  skillKey: string,
) {
  if (!state.client || !state.connected) return;

  const edit = state.skillsConfigEdits[skillKey];
  const apiKey = edit?.apiKey ?? "";
  if (!apiKey.trim()) return;

  state.skillsConfigBusySkill = skillKey;
  state.skillsConfigError = null;

  try {
    await state.client.request("skills.update", { skillKey, apiKey });
    await loadSkillsStatus(state);

    // 清除此技能的 apiKey 编辑
    const edits = { ...state.skillsConfigEdits };
    if (edits[skillKey]) {
      delete edits[skillKey].apiKey;
      if (Object.keys(edits[skillKey]).length === 0) {
        delete edits[skillKey];
      }
    }
    state.skillsConfigEdits = edits;

    setSkillMessage(state, skillKey, {
      kind: "success",
      message: "API Key 已保存",
    });
  } catch (err) {
    const message = getErrorMessage(err);
    state.skillsConfigError = message;
    setSkillMessage(state, skillKey, { kind: "error", message });
  } finally {
    state.skillsConfigBusySkill = null;
  }
}

// ─── 安装技能依赖 / Install skill dependency ────────────────────────────────

export async function installSkillDependency(
  state: SkillsConfigState,
  skillKey: string,
  name: string,
  installId: string,
) {
  if (!state.client || !state.connected) return;

  state.skillsConfigBusySkill = skillKey;
  state.skillsConfigError = null;

  try {
    const result = (await state.client.request("skills.install", {
      name,
      installId,
      timeoutMs: 120000,
    })) as { ok?: boolean; message?: string };

    await loadSkillsStatus(state);

    setSkillMessage(state, skillKey, {
      kind: "success",
      message: result?.message ?? "安装完成",
    });
  } catch (err) {
    const message = getErrorMessage(err);
    state.skillsConfigError = message;
    setSkillMessage(state, skillKey, { kind: "error", message });
  } finally {
    state.skillsConfigBusySkill = null;
  }
}
