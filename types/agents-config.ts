/**
 * Agent 配置相关类型定义
 * Agent configuration type definitions
 *
 * 用于 Agent-centric 配置视图
 * For Agent-centric configuration view
 */

import type {
  AgentsListResult,
  AgentIdentityResult,
  AgentsFilesListResult,
  ChannelsStatusSnapshot,
  CronJob,
  CronStatus,
  SkillStatusReport,
} from "../../ui/types";

// ─────────────────────────────────────────────────────────────────────────────
// 面板类型 / Panel Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agent 配置面板类型
 * Agent configuration panel types
 */
export type AgentPanel =
  | "overview"   // 概览
  | "files"      // 文件
  | "tools"      // 工具
  | "skills"     // 技能
  | "cron";      // 定时任务

/**
 * 全局配置面板类型
 * Global configuration panel types
 */
export type GlobalPanel =
  | "providers"  // 模型供应商
  | "gateway"    // Gateway 配置
  | "channels"   // 全局通道配置
  | "agent";     // Agent 默认设置

/**
 * 侧边栏区域类型
 * Sidebar section types
 */
export type SidebarSection =
  | "agents"     // Agent 列表（默认）
  | "providers"  // 模型供应商
  | "gateway"    // Gateway 配置
  | "channels";  // 全局通道配置

// ─────────────────────────────────────────────────────────────────────────────
// 中文标签 / Chinese Labels
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 中文标签常量
 * Chinese label constants
 */
export const LABELS = {
  // 面板标签 / Panel labels
  panels: {
    overview: "概览",
    files: "文件",
    tools: "工具",
    skills: "技能",
    cron: "定时任务",
  },

  // 全局配置面板标签 / Global config panel labels
  globalPanels: {
    providers: "模型供应商",
    gateway: "Gateway 配置",
    channels: "通道配置",
    agent: "Agent 设置",
  },

  // 侧边栏标签 / Sidebar labels
  sidebar: {
    agents: "Agents",
    agentsCount: "个已配置",
    globalConfig: "全局配置",
    providers: "模型供应商",
    gateway: "Gateway",
    channels: "通道配置",
    agent: "Agent 设置",
    selectAgent: "选择一个 Agent 查看配置",
  },

  // 操作按钮 / Action buttons
  actions: {
    save: "保存配置",
    apply: "保存并应用",
    reload: "重新加载",
    refresh: "刷新",
    saving: "保存中...",
    applying: "应用中...",
    loading: "加载中...",
    retry: "重试",
  },

  // 状态标签 / Status labels
  status: {
    default: "默认",
    configured: "已配置",
    notConfigured: "未配置",
    enabled: "已启用",
    disabled: "已禁用",
    connected: "已连接",
    disconnected: "未连接",
    unsaved: "未保存",
  },

  // 概览面板 / Overview panel
  overview: {
    title: "概览",
    desc: "工作区路径和身份元数据",
    workspace: "工作区",
    primaryModel: "主模型",
    identityName: "身份名称",
    identityEmoji: "身份图标",
    isDefault: "默认 Agent",
    skillsFilter: "技能过滤",
    allSkills: "全部技能",
    selectedSkills: "已选 {n} 个",
    modelSelection: "模型选择",
    fallbacks: "备选模型 (逗号分隔)",
    inheritDefault: "继承默认",
  },

  // 工具面板 / Tools panel
  tools: {
    title: "工具",
    desc: "配置此 Agent 可用的工具集",
    profile: "工具 Profile",
    profiles: {
      minimal: "最小",
      coding: "编程",
      messaging: "消息",
      full: "完整",
    },
    sections: {
      fs: "文件系统",
      runtime: "运行时",
      web: "网络",
      memory: "记忆",
      sessions: "会话",
      ui: "界面",
      messaging: "消息",
      automation: "自动化",
    },
  },

  // 文件面板 / Files panel
  files: {
    title: "文件",
    desc: "工作区提示词和身份文件",
    selectFile: "选择文件",
    noFiles: "暂无文件",
  },

  // 技能面板 / Skills panel
  skills: {
    title: "技能",
    desc: "管理此 Agent 可用的技能",
    filter: "搜索技能...",
    clearFilter: "清除",
    disableAll: "全部禁用",
    noSkills: "暂无技能",
    filterMode: "筛选模式",
    enabledCount: "已启用数量",
    available: "可用技能",
  },

  // 通道面板 / Channels panel
  channels: {
    title: "通道",
    desc: "查看此 Agent 绑定的通道状态",
    noChannels: "暂无绑定通道",
    connected: "已连接",
    total: "总数",
    list: "通道列表",
  },

  // 定时任务面板 / Cron panel
  cron: {
    title: "定时任务",
    desc: "管理此 Agent 的定时任务",
    noJobs: "暂无定时任务",
    noCron: "暂无定时任务",
    enabled: "已启用",
    total: "总数",
    list: "任务列表",
    add: "添加任务",
  },

  // 空状态 / Empty states
  empty: {
    selectAgent: "选择一个 Agent",
    selectAgentDesc: "从左侧列表选择一个 Agent 来查看和编辑配置。",
    noAgents: "未找到 Agent",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Props 类型 / Props Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agent 配置视图 Props
 * Agent configuration view props
 */
export type AgentsConfigProps = {
  // ===== 加载状态 / Loading states =====
  loading: boolean;
  error: string | null;

  // ===== Agent 列表 / Agent list =====
  agentsList: AgentsListResult | null;
  selectedAgentId: string | null;
  activePanel: AgentPanel;

  // ===== 配置表单状态 / Config form states =====
  configForm: Record<string, unknown> | null;
  configLoading: boolean;
  configSaving: boolean;
  configDirty: boolean;

  // ===== Agent 身份信息 / Agent identity =====
  agentIdentityById: Record<string, AgentIdentityResult>;
  agentIdentityLoading: boolean;
  agentIdentityError: string | null;

  // ===== Agent 文件 / Agent files =====
  agentFilesLoading: boolean;
  agentFilesError: string | null;
  agentFilesList: AgentsFilesListResult | null;
  agentFileActive: string | null;
  agentFileContents: Record<string, string>;
  agentFileDrafts: Record<string, string>;
  agentFileSaving: boolean;

  // ===== 通道状态 / Channels status =====
  channelsLoading: boolean;
  channelsError: string | null;
  channelsSnapshot: ChannelsStatusSnapshot | null;
  channelsLastSuccess: number | null;

  // ===== 定时任务 / Cron jobs =====
  cronLoading: boolean;
  cronStatus: CronStatus | null;
  cronJobs: CronJob[];
  cronError: string | null;

  // ===== 技能管理 / Skills management =====
  agentSkillsLoading: boolean;
  agentSkillsReport: SkillStatusReport | null;
  agentSkillsError: string | null;
  agentSkillsAgentId: string | null;
  skillsFilter: string;

  // ===== 事件回调 / Event callbacks =====
  onRefresh: () => void;
  onSelectAgent: (agentId: string) => void;
  onSelectPanel: (panel: AgentPanel) => void;

  // 文件操作 / File operations
  onLoadFiles: (agentId: string) => void;
  onSelectFile: (name: string) => void;
  onFileDraftChange: (name: string, content: string) => void;
  onFileReset: (name: string) => void;
  onFileSave: (name: string) => void;

  // 工具配置 / Tools config
  onToolsProfileChange: (agentId: string, profile: string | null, clearAllow: boolean) => void;
  onToolsOverridesChange: (agentId: string, alsoAllow: string[], deny: string[]) => void;

  // 模型配置 / Model config
  onModelChange: (agentId: string, modelId: string | null) => void;
  onModelFallbacksChange: (agentId: string, fallbacks: string[]) => void;

  // 配置操作 / Config operations
  onConfigReload: () => void;
  onConfigSave: () => void;

  // 通道操作 / Channels operations
  onChannelsRefresh: () => void;

  // 定时任务操作 / Cron operations
  onCronRefresh: () => void;

  // 技能操作 / Skills operations
  onSkillsFilterChange: (next: string) => void;
  onSkillsRefresh: () => void;
  onAgentSkillToggle: (agentId: string, skillName: string, enabled: boolean) => void;
  onAgentSkillsClear: (agentId: string) => void;
  onAgentSkillsDisableAll: (agentId: string) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Agent 配置类型 / Agent Config Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agent 配置条目（来自 config.yaml）
 * Agent config entry (from config.yaml)
 */
export type AgentConfigEntry = {
  id: string;
  name?: string;
  workspace?: string;
  agentDir?: string;
  model?: AgentModelConfig;
  skills?: string[];
  tools?: AgentToolsConfig;
};

/**
 * Agent 模型配置
 * Agent model configuration
 */
export type AgentModelConfig =
  | string  // 简单字符串形式: "openai/gpt-4"
  | {
      primary?: string;
      fallbacks?: string[];
    };

/**
 * Agent 工具配置
 * Agent tools configuration
 */
export type AgentToolsConfig = {
  profile?: string;        // minimal | coding | messaging | full
  allow?: string[];        // 允许的工具
  alsoAllow?: string[];    // 额外允许的工具
  deny?: string[];         // 禁止的工具
};

/**
 * 配置快照类型
 * Config snapshot type
 */
export type ConfigSnapshot = {
  agents?: {
    defaults?: {
      workspace?: string;
      model?: AgentModelConfig;
      models?: Record<string, { alias?: string }>;
    };
    list?: AgentConfigEntry[];
  };
  tools?: {
    allow?: string[];
    deny?: string[];
  };
};
