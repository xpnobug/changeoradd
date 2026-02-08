/**
 * 工具权限组件
 * Tools permissions components
 *
 * 使用共享的工具权限组件
 * Uses shared tools permissions components
 */
import { html, nothing } from "lit";
import type { PermissionsContentProps, ToolPolicyConfig, ToolProfileId } from "./types";
import { renderToolsList, renderProfileSection } from "../tools/index.js";

/**
 * 工具权限默认作用域
 */
const TOOLS_DEFAULT_SCOPE = "__global__";

/**
 * 渲染工具权限管理区块
 */
export function renderToolsPermissionsSection(props: PermissionsContentProps) {
  const selectedScope = props.toolsSelectedAgent ?? TOOLS_DEFAULT_SCOPE;
  const isGlobal = selectedScope === TOOLS_DEFAULT_SCOPE;

  // 获取当前作用域的配置
  const globalConfig = props.toolsConfig ?? {};
  const agentConfig = !isGlobal
    ? props.agentToolsConfigs.find((a) => a.id === selectedScope)?.tools ?? {}
    : {};
  const currentConfig = isGlobal ? globalConfig : agentConfig;

  // 档案选择 Props
  const profileProps = {
    profileValue: isGlobal
      ? currentConfig.profile
      : ((currentConfig.profile ?? "__default__") as ToolProfileId | "__default__"),
    isGlobal,
    globalProfile: globalConfig.profile,
    saving: props.saving,
    onProfileChange: (value: ToolProfileId | undefined) => {
      if (isGlobal) {
        props.onToolsUpdateGlobal("profile", value);
      } else {
        props.onToolsUpdateAgent(selectedScope, "profile", value);
      }
    },
  };

  // 工具列表 Props
  const toolsListProps = {
    denyList: currentConfig.deny ?? [],
    saving: props.saving,
    expanded: props.toolsExpanded,
    onToggleExpanded: props.onToolsToggleExpanded,
    onAddDeny: (entry: string) => {
      if (isGlobal) {
        props.onToolsAddGlobalDeny(entry);
      } else {
        props.onToolsAddAgentDeny(selectedScope, entry);
      }
    },
    onRemoveDeny: (entry: string) => {
      if (isGlobal) {
        props.onToolsRemoveGlobalDeny(entry);
      } else {
        props.onToolsRemoveAgentDeny(selectedScope, entry);
      }
    },
  };

  return html`
    <div class="permissions-header">
      <h3 class="permissions-title">工具权限</h3>
      <p class="permissions-desc">
        配置 Agent 可以使用的工具。可以选择预设配置档案，或单独控制每个工具的启用/禁用状态。
      </p>
    </div>

    <!-- 工具作用域选择器 -->
    ${renderToolsScopeSelector(props, selectedScope)}

    <!-- 配置档案选择 -->
    ${renderProfileSection(profileProps)}

    <!-- 工具列表（带开关） -->
    ${renderToolsList(toolsListProps)}
  `;
}

/**
 * 渲染工具作用域选择器
 */
function renderToolsScopeSelector(props: PermissionsContentProps, selectedScope: string) {
  return html`
    <div class="permissions-section">
      <div class="permissions-section__header">
        <div>
          <h4 class="permissions-section__title">作用域</h4>
          <p class="permissions-section__desc">选择要配置的 Agent，或配置全局默认设置。</p>
        </div>
      </div>
      <div class="permissions-tabs">
        <button
          class="permissions-tab ${selectedScope === TOOLS_DEFAULT_SCOPE ? "permissions-tab--active" : ""}"
          @click=${() => props.onToolsSelectAgent(null)}
        >
          全局默认
        </button>
        ${props.toolsAgents.map((agent) => {
          const label = agent.name?.trim() ? `${agent.name} (${agent.id})` : agent.id;
          const isActive = selectedScope === agent.id;
          return html`
            <button
              class="permissions-tab ${isActive ? "permissions-tab--active" : ""}"
              @click=${() => props.onToolsSelectAgent(agent.id)}
            >
              ${label}
              ${agent.isDefault ? html`<span class="permissions-tab__badge">默认</span>` : nothing}
            </button>
          `;
        })}
      </div>
    </div>
  `;
}
