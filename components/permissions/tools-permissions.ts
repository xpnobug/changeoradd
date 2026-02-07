/**
 * 工具权限组件
 * Tools permissions components
 */
import { html, nothing } from "lit";
import type { PermissionsContentProps, ToolPolicyConfig } from "./types";
import {
  TOOLS_DEFAULT_SCOPE,
  TOOL_DESCRIPTIONS,
  TOOL_GROUPS,
  STANDALONE_TOOLS,
  TOOL_PROFILES,
} from "./constants";

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
    ${renderToolsProfileSection(props, currentConfig, selectedScope, isGlobal, globalConfig)}

    <!-- 工具列表（带开关） -->
    ${renderToolsListSection(props, currentConfig, selectedScope, isGlobal)}
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

/**
 * 渲染配置档案选择
 */
function renderToolsProfileSection(
  props: PermissionsContentProps,
  currentConfig: ToolPolicyConfig,
  selectedScope: string,
  isGlobal: boolean,
  globalConfig: ToolPolicyConfig,
) {
  const profileValue = currentConfig.profile ?? (isGlobal ? undefined : "__default__");
  const globalProfile = globalConfig.profile;

  return html`
    <div class="permissions-section">
      <div class="permissions-section__header">
        <div>
          <h4 class="permissions-section__title">配置档案</h4>
          <p class="permissions-section__desc">
            ${isGlobal
              ? "选择预设的工具配置档案，或留空使用默认配置。"
              : globalProfile
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
              if (isGlobal) {
                props.onToolsUpdateGlobal("profile", value || undefined);
              } else if (value === "__default__") {
                props.onToolsUpdateAgent(selectedScope, "profile", undefined);
              } else {
                props.onToolsUpdateAgent(selectedScope, "profile", value || undefined);
              }
            }}
          >
            ${!isGlobal
              ? html`<option value="__default__" ?selected=${profileValue === "__default__"}>
                  使用全局设置${globalProfile ? ` (${globalProfile})` : ""}
                </option>`
              : html`<option value="" ?selected=${!profileValue}>
                  未设置（使用系统默认）
                </option>`}
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
 * 渲染工具列表（带开关）
 */
function renderToolsListSection(
  props: PermissionsContentProps,
  currentConfig: ToolPolicyConfig,
  selectedScope: string,
  isGlobal: boolean,
) {
  const denyList = currentConfig.deny ?? [];
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
      // 启用工具（从 deny 列表移除）
      if (isGlobal) {
        props.onToolsRemoveGlobalDeny(toolId);
      } else {
        props.onToolsRemoveAgentDeny(selectedScope, toolId);
      }
    } else {
      // 禁用工具（添加到 deny 列表）
      if (isGlobal) {
        props.onToolsAddGlobalDeny(toolId);
      } else {
        props.onToolsAddAgentDeny(selectedScope, toolId);
      }
    }
  };

  // 切换分组禁用状态
  const handleGroupToggle = (groupId: string, currentlyDenied: boolean) => {
    if (currentlyDenied) {
      if (isGlobal) {
        props.onToolsRemoveGlobalDeny(groupId);
      } else {
        props.onToolsRemoveAgentDeny(selectedScope, groupId);
      }
    } else {
      if (isGlobal) {
        props.onToolsAddGlobalDeny(groupId);
      } else {
        props.onToolsAddAgentDeny(selectedScope, groupId);
      }
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
          @click=${props.onToolsToggleExpanded}
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
