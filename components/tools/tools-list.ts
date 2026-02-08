/**
 * 工具列表渲染组件
 * Tools list rendering component
 */
import { html, nothing } from "lit";
import type { ToolsListProps } from "./types";
import {
  TOOL_DESCRIPTIONS,
  TOOL_GROUPS,
  STANDALONE_TOOLS,
  getTotalToolsCount,
  isToolDenied,
  isGroupDenied,
} from "./constants";

/**
 * 渲染工具列表区块
 */
export function renderToolsList(props: ToolsListProps) {
  const { denyList, saving, expanded, onToggleExpanded, onAddDeny, onRemoveDeny } = props;
  const totalTools = getTotalToolsCount();

  // 切换工具禁用状态
  const handleToolToggle = (toolId: string, currentlyDenied: boolean) => {
    if (currentlyDenied) {
      onRemoveDeny(toolId);
    } else {
      onAddDeny(toolId);
    }
  };

  // 切换分组禁用状态
  const handleGroupToggle = (groupId: string, currentlyDenied: boolean) => {
    if (currentlyDenied) {
      onRemoveDeny(groupId);
    } else {
      onAddDeny(groupId);
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
        <button class="mc-btn mc-btn--sm" @click=${onToggleExpanded}>
          ${expanded ? "收起" : "展开"}
        </button>
      </div>

      ${expanded
        ? html`
            <div class="tools-list">
              ${renderToolGroups(denyList, saving, handleToolToggle, handleGroupToggle)}
              ${renderStandaloneTools(denyList, saving, handleToolToggle)}
            </div>
          `
        : nothing}
    </div>
  `;
}

/**
 * 渲染工具分组
 */
function renderToolGroups(
  denyList: string[],
  saving: boolean,
  onToolToggle: (toolId: string, denied: boolean) => void,
  onGroupToggle: (groupId: string, denied: boolean) => void,
) {
  return Object.entries(TOOL_GROUPS).map(([groupId, group]) => {
    const groupDenied = isGroupDenied(groupId, denyList);
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
                ?disabled=${saving}
                @change=${() => onGroupToggle(groupId, groupDenied)}
              />
              <span class="mc-toggle__track"></span>
            </label>
          </div>
        </div>
        <div class="tools-group__items">
          ${group.tools.map((toolId) => {
            const denied = isToolDenied(toolId, denyList);
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
                    ?disabled=${saving || groupDenied}
                    @change=${() => onToolToggle(toolId, denied)}
                  />
                  <span class="mc-toggle__track"></span>
                </label>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  });
}

/**
 * 渲染独立工具
 */
function renderStandaloneTools(
  denyList: string[],
  saving: boolean,
  onToolToggle: (toolId: string, denied: boolean) => void,
) {
  return html`
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
          const denied = isToolDenied(tool.id, denyList);
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
                  ?disabled=${saving}
                  @change=${() => onToolToggle(tool.id, denied)}
                />
                <span class="mc-toggle__track"></span>
              </label>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
