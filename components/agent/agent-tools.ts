/**
 * Agent 工具配置面板组件
 * Agent tools configuration panel component
 *
 * 复用权限管理的工具权限布局
 * Reuses the tools permissions layout from permissions management
 */
import { html, nothing } from "lit";
import type {
  ToolProfileId,
  ToolPolicyConfig,
  ToolsConfig,
  AgentWithTools,
} from "../../controllers/model-config";

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type AgentToolsProps = {
  // Agent 基本信息 / Agent basic info
  agentId: string;
  agentName?: string;

  // 加载状态 / Loading state
  loading: boolean;
  saving: boolean;
  dirty: boolean;

  // 全局工具配置 / Global tools config
  toolsConfig: ToolsConfig | null;

  // Agent 工具配置列表 / Agent tools config list
  agentToolsConfigs: AgentWithTools[];

  // 展开状态 / Expanded state
  toolsExpanded: boolean;

  // 回调函数 / Callbacks
  onToggleExpanded: () => void;
  onUpdateGlobal: (field: keyof ToolPolicyConfig, value: unknown) => void;
  onUpdateAgent: (agentId: string, field: keyof ToolPolicyConfig, value: unknown) => void;
  onAddGlobalDeny: (entry: string) => void;
  onRemoveGlobalDeny: (entry: string) => void;
  onAddAgentDeny: (agentId: string, entry: string) => void;
  onRemoveAgentDeny: (agentId: string, entry: string) => void;
  onReload: () => void;
  onSave: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// 常量定义 / Constants
// ─────────────────────────────────────────────────────────────────────────────

// 工具描述定义
const TOOL_DESCRIPTIONS: Record<string, string> = {
  // 文件操作
  read: "读取文件内容（文本或图片），支持分页读取大文件",
  write: "创建或覆盖文件，自动创建父目录",
  edit: "精确替换文件中的文本内容",
  apply_patch: "应用补丁文件修改",
  // 命令执行
  exec: "执行 Shell 命令，支持后台运行和交互式终端",
  process: "管理运行中的进程（列表/状态/日志/终止）",
  // 网络访问
  web_search: "使用 Brave 搜索 API 进行网络搜索",
  web_fetch: "抓取 URL 内容并转换为 Markdown",
  browser: "控制浏览器（打开/导航/截图/操作）",
  // 设备与展示
  nodes: "管理配对设备（通知/拍照/录制/定位）",
  canvas: "展示内容到画布（演示/截图/执行JS）",
  // 定时任务
  cron: "管理定时任务（添加/修改/删除/执行）",
  // 消息通信
  message: "发送消息到指定目标或广播",
  tts: "文字转语音，返回音频文件",
  // 图像分析
  image: "使用视觉模型分析图片内容",
  // 系统管理
  gateway: "系统管理（重启/配置/更新）",
  // 会话管理
  sessions_list: "列出所有会话",
  sessions_history: "获取会话的消息历史",
  sessions_send: "向其他会话发送消息",
  sessions_spawn: "启动子代理执行任务",
  session_status: "查看/设置会话状态",
  agents_list: "列出可用于 spawn 的代理",
  // 记忆系统
  memory_search: "语义搜索记忆文件",
  memory_get: "读取记忆文件指定行",
};

// 工具分组定义
const TOOL_GROUPS: Record<string, { label: string; desc: string; tools: string[] }> = {
  "group:fs": { label: "文件系统", desc: "文件读写和编辑操作", tools: ["read", "write", "edit", "apply_patch"] },
  "group:runtime": { label: "运行时", desc: "命令执行和进程管理", tools: ["exec", "process"] },
  "group:web": { label: "网络", desc: "网络搜索和内容抓取", tools: ["web_search", "web_fetch"] },
  "group:ui": { label: "界面", desc: "浏览器和画布控制", tools: ["browser", "canvas"] },
  "group:sessions": { label: "会话", desc: "会话和子代理管理", tools: ["sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"] },
  "group:memory": { label: "记忆", desc: "记忆搜索和读取", tools: ["memory_search", "memory_get"] },
  "group:automation": { label: "自动化", desc: "定时任务和系统管理", tools: ["cron", "gateway"] },
  "group:messaging": { label: "消息", desc: "消息发送和广播", tools: ["message"] },
  "group:nodes": { label: "设备", desc: "配对设备控制", tools: ["nodes"] },
};

const STANDALONE_TOOLS: Array<{ id: string; label: string }> = [
  { id: "tts", label: "语音合成" },
  { id: "image", label: "图像分析" },
  { id: "agents_list", label: "代理列表" },
];

const TOOL_PROFILES: Array<{ value: ToolProfileId; label: string; description: string }> = [
  { value: "minimal", label: "最小", description: "仅 session_status" },
  { value: "coding", label: "编程", description: "文件+运行时+会话+记忆+image" },
  { value: "messaging", label: "消息", description: "消息+部分会话工具" },
  { value: "full", label: "完整", description: "所有工具" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 渲染函数 / Render Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染配置档案选择
 * Render profile selection
 */
function renderProfileSection(
  props: AgentToolsProps,
  agentConfig: ToolPolicyConfig,
  globalConfig: ToolPolicyConfig,
) {
  const profileValue = agentConfig.profile ?? "__default__";
  const globalProfile = globalConfig.profile;

  return html`
    <div class="permissions-section">
      <div class="permissions-section__header">
        <div>
          <h4 class="permissions-section__title">配置档案</h4>
          <p class="permissions-section__desc">
            ${globalProfile
              ? `全局档案: ${globalProfile}`
              : "全局未设置档案，使用系统默认"}
          </p>
        </div>
      </div>
      <div class="permissions-policy-grid">
        <div class="permissions-policy-item">
          <div class="permissions-policy-item__header">
            <span class="permissions-policy-item__title">工具档案</span>
            <span class="permissions-policy-item__desc">
              选择预设的工具权限集合
            </span>
          </div>
          <select
            class="permissions-select"
            ?disabled=${props.saving}
            @change=${(event: Event) => {
              const target = event.target as HTMLSelectElement;
              const value = target.value;
              if (value === "__default__") {
                props.onUpdateAgent(props.agentId, "profile", undefined);
              } else {
                props.onUpdateAgent(props.agentId, "profile", value || undefined);
              }
            }}
          >
            <option value="__default__" ?selected=${profileValue === "__default__"}>
              使用全局设置${globalProfile ? ` (${globalProfile})` : ""}
            </option>
            ${TOOL_PROFILES.map(
              (profile) =>
                html`<option value=${profile.value} ?selected=${profileValue === profile.value}>
                  ${profile.label} - ${profile.description}
                </option>`,
            )}
          </select>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染工具列表
 * Render tools list
 */
function renderToolsListSection(props: AgentToolsProps, agentConfig: ToolPolicyConfig) {
  const denyList = agentConfig.deny ?? [];
  const totalTools = Object.values(TOOL_GROUPS).reduce(
    (sum, group) => sum + group.tools.length,
    0,
  ) + STANDALONE_TOOLS.length;

  // 检查工具是否被禁用
  const isToolDenied = (toolId: string): boolean => {
    // 直接禁用
    if (denyList.includes(toolId)) return true;
    // 通过分组禁用
    for (const [groupId, group] of Object.entries(TOOL_GROUPS)) {
      if (group.tools.includes(toolId) && denyList.includes(groupId)) {
        return true;
      }
    }
    return false;
  };

  // 检查分组是否被禁用
  const isGroupDenied = (groupId: string): boolean => {
    return denyList.includes(groupId);
  };

  // 切换工具禁用状态
  const handleToolToggle = (toolId: string, currentlyDenied: boolean) => {
    if (currentlyDenied) {
      props.onRemoveAgentDeny(props.agentId, toolId);
    } else {
      props.onAddAgentDeny(props.agentId, toolId);
    }
  };

  // 切换分组禁用状态
  const handleGroupToggle = (groupId: string, currentlyDenied: boolean) => {
    if (currentlyDenied) {
      props.onRemoveAgentDeny(props.agentId, groupId);
    } else {
      props.onAddAgentDeny(props.agentId, groupId);
    }
  };

  return html`
    <div class="permissions-section">
      <div class="permissions-section__header">
        <div>
          <h4 class="permissions-section__title">工具列表</h4>
          <p class="permissions-section__desc">
            共 ${totalTools} 个工具，使用开关控制启用/禁用状态。
          </p>
        </div>
        <button
          class="mc-btn mc-btn--sm"
          @click=${props.onToggleExpanded}
        >
          ${props.toolsExpanded ? "收起" : "展开"}
        </button>
      </div>

      ${props.toolsExpanded
        ? html`
            <div class="tools-list">
              ${Object.entries(TOOL_GROUPS).map(([groupId, group]) => {
                const groupDenied = isGroupDenied(groupId);
                return html`
                  <div class="tools-group ${groupDenied ? "tools-group--denied" : ""}">
                    <div class="tools-group__header">
                      <div class="tools-group__info">
                        <span class="tools-group__name">${group.label}</span>
                        <span class="tools-group__desc">${group.desc}</span>
                      </div>
                      <div class="tools-group__toggle">
                        <span class="tools-group__count">${group.tools.length} 个工具</span>
                        <label class="mc-toggle">
                          <input
                            type="checkbox"
                            .checked=${!groupDenied}
                            ?disabled=${props.saving}
                            @change=${() => handleGroupToggle(groupId, groupDenied)}
                          />
                          <span class="mc-toggle__track"></span>
                        </label>
                      </div>
                    </div>
                    <div class="tools-group__items">
                      ${group.tools.map((toolId) => {
                        const denied = isToolDenied(toolId);
                        const desc = TOOL_DESCRIPTIONS[toolId] ?? "";
                        return html`
                          <div class="tools-item ${denied ? "tools-item--denied" : ""}">
                            <div class="tools-item__info">
                              <span class="tools-item__name">${toolId}</span>
                              <span class="tools-item__desc">${desc}</span>
                            </div>
                            <label class="mc-toggle mc-toggle--sm">
                              <input
                                type="checkbox"
                                .checked=${!denied}
                                ?disabled=${props.saving || groupDenied}
                                @change=${() => handleToolToggle(toolId, denied)}
                              />
                              <span class="mc-toggle__track"></span>
                            </label>
                          </div>
                        `;
                      })}
                    </div>
                  </div>
                `;
              })}

              <!-- 独立工具 -->
              <div class="tools-group">
                <div class="tools-group__header">
                  <div class="tools-group__info">
                    <span class="tools-group__name">独立工具</span>
                    <span class="tools-group__desc">不属于任何分组的工具</span>
                  </div>
                  <div class="tools-group__toggle">
                    <span class="tools-group__count">${STANDALONE_TOOLS.length} 个工具</span>
                  </div>
                </div>
                <div class="tools-group__items">
                  ${STANDALONE_TOOLS.map((tool) => {
                    const denied = isToolDenied(tool.id);
                    const desc = TOOL_DESCRIPTIONS[tool.id] ?? "";
                    return html`
                      <div class="tools-item ${denied ? "tools-item--denied" : ""}">
                        <div class="tools-item__info">
                          <span class="tools-item__name">${tool.id}</span>
                          <span class="tools-item__label">${tool.label}</span>
                          <span class="tools-item__desc">${desc}</span>
                        </div>
                        <label class="mc-toggle mc-toggle--sm">
                          <input
                            type="checkbox"
                            .checked=${!denied}
                            ?disabled=${props.saving}
                            @change=${() => handleToolToggle(tool.id, denied)}
                          />
                          <span class="mc-toggle__track"></span>
                        </label>
                      </div>
                    `;
                  })}
                </div>
              </div>
            </div>
          `
        : nothing}
    </div>
  `;
}

/**
 * 渲染 Agent 工具配置面板
 * Render agent tools configuration panel
 */
export function renderAgentTools(props: AgentToolsProps) {
  const { agentId, agentName, loading, saving, dirty, toolsConfig, agentToolsConfigs } = props;

  // 获取全局配置和 Agent 配置
  const globalConfig = toolsConfig ?? {};
  const agentConfig = agentToolsConfigs.find((a) => a.id === agentId)?.tools ?? {};

  return html`
    <div class="config-content">
      <!-- 头部说明 -->
      <div class="config-content__header">
        <h3 class="permissions-title">工具权限</h3>
        <p class="config-content__desc">
          配置 ${agentName ?? agentId} 可以使用的工具。可以选择预设配置档案，或单独控制每个工具的启用/禁用状态。
        </p>
      </div>

      <!-- 配置档案选择 -->
      ${renderProfileSection(props, agentConfig, globalConfig)}

      <!-- 工具列表（带开关） -->
      ${renderToolsListSection(props, agentConfig)}
    </div>
  `;
}
