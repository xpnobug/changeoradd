/**
 * Agent 配置页面视图 - 主入口
 * Agent configuration page view - Main entry
 */
import { html } from "lit";
import type { GlobalPanel } from "../../types/agents-config";
import { LABELS } from "../../types/agents-config";
import type { AgentsConfigProps } from "./types";
import { renderActivePanel, renderGlobalPanel } from "./panel-renderer";
import {
  renderAgentSidebar,
  renderAgentHeader,
  renderAgentTabs,
} from "../../components/agent";

/**
 * 渲染 Agent 详情区域（头部 + Tab + 内容）
 * Render agent details area (header + tabs + content)
 */
function renderAgentDetails(props: AgentsConfigProps) {
  const { agentsList, selectedAgentId, activePanel, agentIdentity, defaultAgentId } = props;

  const agents = agentsList?.agents ?? [];
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  if (!selectedAgent) {
    return html`
      <div class="agents-detail agents-detail--empty">
        <div class="agents-detail__placeholder">
          <p>${LABELS.sidebar.selectAgent}</p>
        </div>
      </div>
    `;
  }

  return html`
    <div class="agents-detail">
      <!-- Agent 头部 / Agent header -->
      ${renderAgentHeader({
        agent: selectedAgent,
        defaultId: defaultAgentId,
        agentIdentity,
      })}

      <!-- Tab 切换栏 / Tab navigation -->
      ${renderAgentTabs({
        active: activePanel,
        onSelect: props.onPanelChange,
      })}

      <!-- 面板内容 / Panel content -->
      <div class="agents-detail__content">
        ${renderActivePanel(props, selectedAgent)}
      </div>
    </div>
  `;
}

/**
 * 主渲染函数 - Agent 配置页面
 * Main render function - Agent configuration page
 */
export function renderAgentsConfig(props: AgentsConfigProps) {
  const {
    loading,
    error,
    agentsList,
    selectedAgentId,
    defaultAgentId,
    globalPanel,
    onAgentSelect,
    onRefresh,
    onGlobalPanelChange,
  } = props;

  // 错误状态 / Error state
  if (error && !agentsList) {
    return html`
      <div class="agents-layout agents-layout--error">
        <div class="mc-error">
          <p>${error}</p>
          <button class="mc-btn mc-btn--primary" @click=${onRefresh}>${LABELS.actions.retry}</button>
        </div>
      </div>
    `;
  }

  // 加载状态 / Loading state
  if (loading && !agentsList) {
    return html`
      <div class="agents-layout agents-layout--loading">
        <div class="mc-loading">${LABELS.actions.loading}</div>
      </div>
    `;
  }

  const agents = agentsList?.agents ?? [];

  // 处理全局配置点击 / Handle global config click
  const handleGlobalConfigClick = (section: string) => {
    onGlobalPanelChange(section as GlobalPanel);
  };

  // 渲染配置操作按钮 / Render config action buttons
  const renderConfigActions = () => {
    const { configDirty, configLoading, configSaving, configApplying, onConfigReload, onConfigSave, onConfigApply } = props;
    const isBusy = configLoading || configSaving || configApplying;

    return html`
      <div class="agents-actions">
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${isBusy}
          @click=${onConfigReload}
        >
          ${configLoading ? LABELS.actions.loading : LABELS.actions.reload}
        </button>
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${!configDirty || isBusy}
          @click=${onConfigSave}
        >
          ${configSaving ? LABELS.actions.saving : LABELS.actions.save}
        </button>
        <button
          class="mc-btn mc-btn--sm mc-btn--primary"
          ?disabled=${!configDirty || isBusy}
          @click=${onConfigApply}
        >
          ${configApplying ? LABELS.actions.applying : LABELS.actions.apply}
        </button>
      </div>
    `;
  };

  return html`
    <div class="agents-layout">
      <!-- 左侧 Agent 侧边栏 / Left agent sidebar -->
      ${renderAgentSidebar({
        agents,
        selectedId: globalPanel ? null : selectedAgentId,
        defaultId: defaultAgentId,
        activeGlobalPanel: globalPanel,
        loading,
        error,
        agentIdentityById: props.agentIdentityById,
        hasChanges: props.configDirty,
        connected: props.connected,
        onSelectAgent: (agentId) => {
          onGlobalPanelChange(null);
          onAgentSelect(agentId);
        },
        onRefresh,
        onGlobalConfigClick: handleGlobalConfigClick,
        onSetDefault: props.onSetDefault,
      })}

      <!-- 右侧内容区域 / Right content area -->
      <div class="agents-main">
        <!-- 配置操作按钮 / Config action buttons -->
        ${renderConfigActions()}

        ${globalPanel
          ? renderGlobalPanel(props)
          : renderAgentDetails(props)}
      </div>
    </div>
  `;
}
