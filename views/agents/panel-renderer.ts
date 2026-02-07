/**
 * Agent 配置页面面板渲染器
 * Agent configuration page panel renderers
 */
import { html, nothing } from "lit";
import type { AgentsListResult } from "../../../ui/types";
import type { GlobalPanel } from "../../types/agents-config";
import { LABELS } from "../../types/agents-config";
import type { AgentsConfigProps } from "./types";
import {
  renderAgentOverview,
  renderAgentFiles,
  renderAgentTools,
  renderAgentSkills,
  renderAgentCron,
} from "../../components/agent";
import { renderChannelsContent } from "../../components/channels-content";
import { renderProvidersContent } from "../../components/providers-content";
import { renderGatewayContent } from "../../components/gateway-content";
import { renderAgentContent } from "../../components/agent-content";

/**
 * 渲染当前激活的面板内容
 * Render current active panel content
 */
export function renderActivePanel(props: AgentsConfigProps, agent: AgentsListResult["agents"][number]) {
  const { activePanel, selectedAgentId } = props;

  if (!selectedAgentId) return nothing;

  switch (activePanel) {
    case "overview":
      return renderAgentOverview({
        agent,
        defaultId: props.defaultAgentId,
        configForm: props.configForm as Record<string, unknown> | null,
        agentFilesList: props.agentFilesList,
        agentIdentity: props.agentIdentity,
        agentIdentityLoading: props.agentIdentityLoading,
        agentIdentityError: props.agentIdentityError,
        configLoading: props.configLoading,
        configSaving: props.configSaving,
        configDirty: props.configDirty,
        onConfigReload: props.onConfigReload,
        onConfigSave: props.onConfigSave,
        onModelChange: props.onModelChange,
        onModelFallbacksChange: props.onModelFallbacksChange,
        sessionsLoading: props.agentSessionsLoading,
        sessionsResult: props.agentSessionsResult,
        sessionsError: props.agentSessionsError,
        availableModels: props.agentAvailableModels,
        onSessionsRefresh: props.onAgentSessionsRefresh,
        onSessionModelChange: props.onAgentSessionModelChange,
        onSessionNavigate: props.onAgentSessionNavigate,
        onSessionDelete: props.onAgentSessionDelete,
        sessionCreateShow: props.agentSessionCreateShow,
        sessionCreateName: props.agentSessionCreateName,
        sessionCreateModel: props.agentSessionCreateModel,
        sessionCreating: props.agentSessionCreating,
        onSessionCreateShow: props.onAgentSessionCreateShow,
        onSessionCreateNameChange: props.onAgentSessionCreateNameChange,
        onSessionCreateModelChange: props.onAgentSessionCreateModelChange,
        onSessionCreate: props.onAgentSessionCreate,
      });

    case "files":
      return renderAgentFiles({
        agentId: selectedAgentId,
        agentName: agent.name ?? agent.id,
        agentFilesList: props.agentFilesList,
        agentFilesLoading: props.agentFilesLoading,
        agentFilesError: props.agentFilesError,
        agentFileActive: props.agentFileActive,
        agentFileContents: props.agentFileContents,
        agentFileDrafts: props.agentFileDrafts,
        agentFileSaving: props.agentFileSaving,
        editorMode: props.filesEditorMode,
        expandedFolders: props.filesExpandedFolders,
        mobileView: props.filesMobileView,
        onLoadFiles: props.onLoadFiles,
        onSelectFile: props.onSelectFile,
        onFileDraftChange: props.onFileDraftChange,
        onFileReset: props.onFileReset,
        onFileSave: props.onFileSave,
        onModeChange: props.onFilesEditorModeChange,
        onFolderToggle: props.onFilesFolderToggle,
        onFileCreate: props.onFileCreate,
        onMobileBack: props.onFilesMobileBack,
      });

    case "tools":
      return renderAgentTools({
        agentId: selectedAgentId,
        agentName: agent.name ?? agent.id,
        loading: props.toolsLoading,
        saving: props.toolsSaving,
        dirty: props.toolsDirty,
        toolsConfig: props.toolsConfig,
        agentToolsConfigs: props.agentToolsConfigs,
        toolsExpanded: props.toolsExpanded,
        onToggleExpanded: props.onToolsToggleExpanded,
        onUpdateGlobal: props.onToolsUpdateGlobal,
        onUpdateAgent: props.onToolsUpdateAgent,
        onAddGlobalDeny: props.onToolsAddGlobalDeny,
        onRemoveGlobalDeny: props.onToolsRemoveGlobalDeny,
        onAddAgentDeny: props.onToolsAddAgentDeny,
        onRemoveAgentDeny: props.onToolsRemoveAgentDeny,
        onReload: props.onToolsReload,
        onSave: props.onToolsSave,
      });

    case "skills":
      return renderAgentSkills({
        agentId: selectedAgentId,
        agentName: agent.name ?? agent.id,
        loading: props.skillsLoading,
        saving: props.skillsSaving,
        error: props.skillsError,
        hasChanges: props.skillsHasChanges,
        report: props.skillsReport,
        config: props.skillsConfig,
        filter: props.skillsFilter,
        sourceFilter: props.skillsSourceFilter,
        statusFilter: props.skillsStatusFilter,
        expandedGroups: props.skillsExpandedGroups,
        selectedSkill: props.skillsSelectedSkill,
        busySkill: props.skillsBusySkill,
        messages: props.skillsMessages,
        allowlistMode: props.skillsAllowlistMode,
        allowlistDraft: props.skillsAllowlistDraft,
        edits: props.skillsEdits,
        editorState: props.skillsEditorState,
        createState: props.skillsCreateState,
        deleteState: props.skillsDeleteState,
        previewState: props.skillsPreviewState,
        onRefresh: props.onSkillsRefresh,
        onSave: props.onSkillsSave,
        onFilterChange: props.onSkillsFilterChange,
        onSourceFilterChange: props.onSkillsSourceFilterChange,
        onStatusFilterChange: props.onSkillsStatusFilterChange,
        onGroupToggle: props.onSkillsGroupToggle,
        onSkillSelect: props.onSkillsSkillSelect,
        onSkillToggle: props.onSkillsSkillToggle,
        onSkillApiKeyChange: props.onSkillsApiKeyChange,
        onSkillApiKeySave: props.onSkillsApiKeySave,
        onAllowlistModeChange: props.onSkillsAllowlistModeChange,
        onAllowlistToggle: props.onSkillsAllowlistToggle,
        onInstall: props.onSkillsInstall,
        onGlobalSettingChange: props.onSkillsGlobalSettingChange,
        onSkillEnvChange: props.onSkillsEnvChange,
        onSkillEnvRemove: props.onSkillsEnvRemove,
        onSkillConfigChange: props.onSkillsConfigChange,
        onExtraDirsChange: props.onSkillsExtraDirsChange,
        onEditorOpen: props.onSkillsEditorOpen,
        onEditorClose: props.onSkillsEditorClose,
        onEditorContentChange: props.onSkillsEditorContentChange,
        onEditorModeChange: props.onSkillsEditorModeChange,
        onEditorSave: props.onSkillsEditorSave,
        onCreateOpen: props.onSkillsCreateOpen,
        onCreateClose: props.onSkillsCreateClose,
        onCreateNameChange: props.onSkillsCreateNameChange,
        onCreateSourceChange: props.onSkillsCreateSourceChange,
        onCreateConfirm: props.onSkillsCreateConfirm,
        onDeleteOpen: props.onSkillsDeleteOpen,
        onDeleteClose: props.onSkillsDeleteClose,
        onDeleteConfirm: props.onSkillsDeleteConfirm,
        onPreviewOpen: props.onSkillsPreviewOpen,
        onPreviewClose: props.onSkillsPreviewClose,
      });

    case "cron":
      return renderAgentCron({
        agentId: selectedAgentId,
        agentName: agent.name ?? agent.id,
        loading: props.cronLoading,
        busy: props.cronBusy,
        error: props.cronError,
        status: props.cronStatus,
        jobs: props.cronJobs,
        form: props.cronForm,
        agents: props.cronAgents,
        defaultAgentId: props.cronDefaultAgentId,
        channels: props.cronChannels,
        channelLabels: props.cronChannelLabels,
        channelMeta: props.cronChannelMeta,
        runsJobId: props.cronRunsJobId,
        runs: props.cronRuns,
        expandedJobId: props.cronExpandedJobId,
        deleteConfirmJobId: props.cronDeleteConfirmJobId,
        showCreateModal: props.cronShowCreateModal,
        editJobId: props.cronEditJobId,
        onFormChange: props.onCronFormChange,
        onRefresh: props.onCronRefresh,
        onAdd: props.onCronAdd,
        onUpdate: props.onCronUpdate,
        onToggle: props.onCronToggle,
        onRun: props.onCronRun,
        onRemove: props.onCronRemove,
        onLoadRuns: props.onCronLoadRuns,
        onExpandJob: props.onCronExpandJob,
        onDeleteConfirm: props.onCronDeleteConfirm,
        onShowCreateModal: props.onCronShowCreateModal,
        onEdit: props.onCronEdit,
      });

    default:
      return nothing;
  }
}

/**
 * 渲染全局配置面板内容
 * Render global config panel content
 */
export function renderGlobalPanel(props: AgentsConfigProps) {
  const { globalPanel } = props;

  if (!globalPanel) return nothing;

  switch (globalPanel) {
    case "channels":
      return html`
        <div class="agents-detail">
          <div class="agents-detail__header">
            <h2 class="agents-detail__title">${LABELS.globalPanels.channels}</h2>
            <p class="agents-detail__subtitle">Gateway 级别的通道配置</p>
          </div>
          <div class="agents-detail__content">
            ${renderChannelsContent({
              channelsConfig: props.channelsConfig,
              selectedChannel: props.channelsSelectedChannel,
              onChannelSelect: props.onChannelSelect,
              onChannelConfigUpdate: props.onChannelConfigUpdate,
              onNavigateToChannels: props.onNavigateToChannels,
            })}
          </div>
        </div>
      `;

    case "providers":
      return html`
        <div class="agents-detail">
          <div class="agents-detail__header">
            <h2 class="agents-detail__title">${LABELS.globalPanels.providers}</h2>
            <p class="agents-detail__subtitle">配置模型供应商和 API 密钥</p>
          </div>
          <div class="agents-detail__content">
            ${renderProvidersContent({
              providers: props.providersConfig,
              expandedProviders: props.providersExpanded,
              showAddModal: props.providersAddModal,
              addForm: props.providersAddForm,
              addError: props.providersAddError,
              onProviderToggle: props.onProviderToggle,
              onProviderAdd: props.onProviderAdd,
              onProviderRemove: props.onProviderRemove,
              onProviderRename: props.onProviderRename,
              onProviderUpdate: props.onProviderUpdate,
              onModelAdd: props.onModelAdd,
              onModelRemove: props.onModelRemove,
              onModelUpdate: props.onModelUpdate,
              onShowAddModal: props.onProviderShowAddModal,
              onAddFormChange: props.onProviderAddFormChange,
              onAddConfirm: props.onProviderAddConfirm,
            })}
          </div>
        </div>
      `;

    case "gateway":
      return html`
        <div class="agents-detail">
          <div class="agents-detail__header">
            <h2 class="agents-detail__title">${LABELS.globalPanels.gateway}</h2>
            <p class="agents-detail__subtitle">Gateway 全局设置</p>
          </div>
          <div class="agents-detail__content">
            ${renderGatewayContent({
              gatewayConfig: props.gatewayConfig,
              onGatewayUpdate: props.onGatewayUpdate,
            })}
          </div>
        </div>
      `;

    case "agent":
      return html`
        <div class="agents-detail">
          <div class="agents-detail__header">
            <h2 class="agents-detail__title">${LABELS.globalPanels.agent}</h2>
            <p class="agents-detail__subtitle">Agent 全局默认参数</p>
          </div>
          <div class="agents-detail__content">
            ${renderAgentContent({
              agentDefaults: props.agentDefaults,
              availableModels: props.agentAvailableModels,
              onAgentDefaultsUpdate: props.onAgentDefaultsUpdate,
            })}
          </div>
        </div>
      `;

    default:
      return nothing;
  }
}
