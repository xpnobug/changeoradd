/**
 * 技能配置控制器
 * Skills config controller
 *
 * 处理技能管理页面的数据加载和保存
 * Handles loading and saving of skills management page data
 */
import type { GatewayBrowserClient } from "../../ui/gateway";
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
  EditableSkillSource,
  SkillEditorMode,
} from "../types/skills-config";

// ─── 类型定义 / Type definitions ────────────────────────────────────────────

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
};

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
  };
}

// ─── 辅助函数 / Helper functions ────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function setSkillMessage(
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
 */
async function updateSkillsConfigField(
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

// ─── UI 状态更新 / UI state updates ─────────────────────────────────────────

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

export function toggleSkillsGroup(state: SkillsConfigState, group: string) {
  const groups = new Set(state.skillsConfigExpandedGroups);
  if (groups.has(group)) {
    groups.delete(group);
  } else {
    groups.add(group);
  }
  state.skillsConfigExpandedGroups = groups;
}

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

// =========================================================================
// 技能编辑器操作 / Skills editor operations (Phase 5-6)
// =========================================================================

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

/**
 * 检测编辑器是否有未保存的更改
 * Check if editor has unsaved changes
 */
export function hasEditorChanges(state: SkillsConfigState): boolean {
  const { content, original } = state.skillsConfigEditor;
  return content !== original;
}
