/**
 * Agent 工具配置面板组件
 * Agent tools configuration panel component
 *
 * 复用工具权限共享组件
 * Reuses shared tools permissions components
 */
import { html } from "lit";
import type {
  ToolProfileId,
  ToolPolicyConfig,
  ToolsConfig,
  AgentWithTools,
} from "../../controllers/model-config";
import { renderToolsList, renderProfileSection } from "../tools/index.js";

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
// 渲染函数 / Render Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染 Agent 工具配置面板
 * Render agent tools configuration panel
 */
export function renderAgentTools(props: AgentToolsProps) {
  const { agentId, agentName, saving, toolsConfig, agentToolsConfigs, toolsExpanded } = props;

  // 获取全局配置和 Agent 配置
  const globalConfig = toolsConfig ?? {};
  const agentConfig = agentToolsConfigs.find((a) => a.id === agentId)?.tools ?? {};

  // 档案选择 Props
  const profileProps = {
    profileValue: (agentConfig.profile ?? "__default__") as ToolProfileId | "__default__",
    isGlobal: false,
    globalProfile: globalConfig.profile,
    saving,
    onProfileChange: (value: ToolProfileId | undefined) => {
      props.onUpdateAgent(agentId, "profile", value);
    },
  };

  // 工具列表 Props
  const toolsListProps = {
    denyList: agentConfig.deny ?? [],
    saving,
    expanded: toolsExpanded,
    onToggleExpanded: props.onToggleExpanded,
    onAddDeny: (entry: string) => props.onAddAgentDeny(agentId, entry),
    onRemoveDeny: (entry: string) => props.onRemoveAgentDeny(agentId, entry),
  };

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
      ${renderProfileSection(profileProps)}

      <!-- 工具列表（带开关） -->
      ${renderToolsList(toolsListProps)}
    </div>
  `;
}
