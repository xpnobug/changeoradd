/**
 * 技能配置控制器 - 数据加载和保存
 * Skills config controller - Data loading and saving
 */
import type { SkillsConfigState, SkillsConfig, SkillStatusReport } from "./types";
import { getErrorMessage } from "./state";

// ─── 加载技能状态 / Load skills status ──────────────────────────────────────

export type LoadSkillsOptions = {
  clearMessages?: boolean;
};

export async function loadSkillsStatus(
  state: SkillsConfigState,
  options?: LoadSkillsOptions,
) {
  if (options?.clearMessages && Object.keys(state.skillsConfigMessages).length > 0) {
    state.skillsConfigMessages = {};
  }
  if (!state.client || !state.connected) return;
  if (state.skillsConfigLoading) return;

  state.skillsConfigLoading = true;
  state.skillsConfigError = null;

  try {
    const res = (await state.client.request("skills.status", {})) as
      | SkillStatusReport
      | undefined;

    if (res) {
      state.skillsConfigReport = res;

      // 从配置中提取现有技能配置
      // 通过 gateway 获取完整配置
      const configRes = (await state.client.request("config.get", {})) as
        | { config: Record<string, unknown>; hash?: string }
        | undefined;

      if (configRes?.config) {
        const skillsConfig = extractSkillsConfig(configRes.config);
        state.skillsConfig = skillsConfig;
        state.skillsConfigOriginal = JSON.parse(JSON.stringify(skillsConfig));
        state.skillsConfigBaseHash = configRes.hash ?? null;

        // 初始化白名单状态
        if (skillsConfig.allowBundled && skillsConfig.allowBundled.length > 0) {
          state.skillsConfigAllowlistMode = "whitelist";
          state.skillsConfigAllowlistDraft = new Set(skillsConfig.allowBundled);
        } else {
          state.skillsConfigAllowlistMode = "all";
          state.skillsConfigAllowlistDraft = new Set();
        }
      }
    }
  } catch (err) {
    state.skillsConfigError = getErrorMessage(err);
  } finally {
    state.skillsConfigLoading = false;
  }
}

/**
 * 从配置中提取技能配置
 * Extract skills config from config
 */
function extractSkillsConfig(config: Record<string, unknown>): SkillsConfig {
  const skills = config.skills as Record<string, unknown> | undefined;
  if (!skills) return {};

  return {
    allowBundled: skills.allowBundled as string[] | undefined,
    load: skills.load as SkillsConfig["load"],
    install: skills.install as SkillsConfig["install"],
    entries: skills.entries as SkillsConfig["entries"],
  };
}

// ─── 保存技能配置 / Save skills config ──────────────────────────────────────

export async function saveSkillsConfig(state: SkillsConfigState) {
  if (!state.client || !state.connected) return;
  if (state.skillsConfigSaving) return;

  state.skillsConfigSaving = true;
  state.skillsConfigError = null;

  try {
    // 处理所有编辑
    for (const [skillKey, edit] of Object.entries(state.skillsConfigEdits)) {
      if (edit.enabled !== undefined) {
        await state.client.request("skills.update", {
          skillKey,
          enabled: edit.enabled,
        });
      }
      if (edit.apiKey !== undefined && edit.apiKey.trim()) {
        await state.client.request("skills.update", {
          skillKey,
          apiKey: edit.apiKey,
        });
      }
      // 保存环境变量
      if (edit.env && Object.keys(edit.env).length > 0) {
        for (const [envKey, value] of Object.entries(edit.env)) {
          if (value.trim()) {
            await state.client.request("skills.update", {
              skillKey,
              env: { [envKey]: value },
            });
          }
        }
      }
      // 保存自定义配置
      if (edit.config && Object.keys(edit.config).length > 0) {
        await state.client.request("skills.update", {
          skillKey,
          config: edit.config,
        });
      }
    }

    // 保存白名单配置
    if (state.skillsConfigAllowlistMode === "whitelist") {
      const allowBundled = Array.from(state.skillsConfigAllowlistDraft);
      await updateSkillsConfigField(state, "allowBundled", allowBundled);
    } else {
      // 清空白名单（允许全部）
      await updateSkillsConfigField(state, "allowBundled", undefined);
    }

    // 清空编辑状态
    state.skillsConfigEdits = {};

    // 重新加载状态
    await loadSkillsStatus(state, { clearMessages: false });
  } catch (err) {
    state.skillsConfigError = getErrorMessage(err);
  } finally {
    state.skillsConfigSaving = false;
  }
}

/**
 * 更新技能配置字段
 * 使用 config.patch 的 merge-patch 语义（RFC 7386）
 * Update skills config field using merge-patch semantics (RFC 7386)
 */
export async function updateSkillsConfigField(
  state: SkillsConfigState,
  field: string,
  value: unknown,
) {
  if (!state.client || !state.connected) return;
  if (!state.skillsConfigBaseHash) {
    state.skillsConfigError = "Config hash missing; reload and retry.";
    return;
  }

  // merge-patch: null 表示删除，非 null 表示设置
  const patch: Record<string, unknown> = {
    skills: {
      [field]: value === undefined ? null : value,
    },
  };

  await state.client.request("config.patch", {
    raw: JSON.stringify(patch),
    baseHash: state.skillsConfigBaseHash,
  });
}

// ─── 全局设置 / Global settings ─────────────────────────────────────────────

export async function updateGlobalSetting(
  state: SkillsConfigState,
  field: string,
  value: unknown,
) {
  if (!state.client || !state.connected) return;
  if (!state.skillsConfigBaseHash) {
    state.skillsConfigError = "Config hash missing; reload and retry.";
    return;
  }

  try {
    // 根据字段构建 merge-patch 对象
    let patch: Record<string, unknown>;
    switch (field) {
      case "preferBrew":
        patch = { skills: { install: { preferBrew: value } } };
        break;
      case "nodeManager":
        patch = { skills: { install: { nodeManager: value } } };
        break;
      case "watch":
        patch = { skills: { load: { watch: value } } };
        break;
      default:
        return;
    }

    await state.client.request("config.patch", {
      raw: JSON.stringify(patch),
      baseHash: state.skillsConfigBaseHash,
    });

    await loadSkillsStatus(state);
  } catch (err) {
    state.skillsConfigError = getErrorMessage(err);
  }
}

// ─── 额外技能目录 / Extra skill directories ──────────────────────────────────

export async function updateExtraDirs(
  state: SkillsConfigState,
  dirs: string[],
) {
  if (!state.client || !state.connected) return;
  if (!state.skillsConfigBaseHash) {
    state.skillsConfigError = "Config hash missing; reload and retry.";
    return;
  }

  try {
    const patch = {
      skills: {
        load: {
          extraDirs: dirs,
        },
      },
    };
    await state.client.request("config.patch", {
      raw: JSON.stringify(patch),
      baseHash: state.skillsConfigBaseHash,
    });
    await loadSkillsStatus(state);
  } catch (err) {
    state.skillsConfigError = getErrorMessage(err);
  }
}
