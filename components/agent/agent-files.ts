/**
 * Agent 文件编辑面板组件
 * Agent files editor panel component
 *
 * 复用工作区文件布局：文件夹分组、编辑/预览/分屏模式、Markdown 预览
 * Reuses workspace file layout: folder grouping, edit/preview/split modes, Markdown preview
 */
import { html, nothing } from "lit";
import type { AgentsFilesListResult } from "../../../ui/types";
import { renderWorkspaceContent, type WorkspaceFileInfo } from "../workspace-content";

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type AgentFilesProps = {
  // Agent 基本信息 / Agent basic info
  agentId: string;
  agentName?: string;

  // 文件列表数据 / File list data
  agentFilesList: AgentsFilesListResult | null;
  agentFilesLoading: boolean;
  agentFilesError: string | null;

  // 当前选中文件 / Currently selected file
  agentFileActive: string | null;

  // 文件内容 / File contents
  agentFileContents: Record<string, string>;
  agentFileDrafts: Record<string, string>;
  agentFileSaving: boolean;

  // 编辑器模式 / Editor mode
  editorMode?: "edit" | "preview" | "split";
  expandedFolders?: Set<string>;

  // 移动端视图模式 / Mobile view mode
  mobileView?: "list" | "editor";

  // 回调函数 / Callbacks
  onLoadFiles: (agentId: string) => void;
  onSelectFile: (name: string) => void;
  onFileDraftChange: (name: string, content: string) => void;
  onFileReset: (name: string) => void;
  onFileSave: (name: string) => void;
  onModeChange?: (mode: "edit" | "preview" | "split") => void;
  onFolderToggle?: (folderName: string) => void;
  onFileCreate?: (fileName: string) => void;
  onMobileBack?: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// 辅助函数 / Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 将 AgentsFilesListResult 转换为 WorkspaceFileInfo[]
 * Convert AgentsFilesListResult to WorkspaceFileInfo[]
 */
function convertToWorkspaceFiles(filesList: AgentsFilesListResult | null): WorkspaceFileInfo[] {
  if (!filesList?.files) return [];

  return filesList.files.map((file) => ({
    name: file.name,
    path: file.path ?? file.name,
    exists: !file.missing,
    size: file.size ?? 0,
    modifiedAt: file.updatedAtMs ?? null,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 渲染函数 / Render Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染 Agent 文件面板
 * Render agent files panel
 *
 * 复用 workspace-content 布局，提供完整的文件编辑体验
 * Reuses workspace-content layout for full file editing experience
 */
export function renderAgentFiles(props: AgentFilesProps) {
  const {
    agentId,
    agentName,
    agentFilesList,
    agentFilesLoading,
    agentFilesError,
    agentFileActive,
    agentFileContents,
    agentFileDrafts,
    agentFileSaving,
    editorMode = "edit",
    expandedFolders = new Set<string>(),
    mobileView = "list",
    onLoadFiles,
    onSelectFile,
    onFileDraftChange,
    onFileReset,
    onFileSave,
    onModeChange,
    onFolderToggle,
    onFileCreate,
    onMobileBack,
  } = props;

  // 检查是否需要加载文件列表 / Check if need to load files list
  const needsLoad = !agentFilesList || agentFilesList.agentId !== agentId;

  // 如果需要加载且未在加载中，自动触发加载
  // If needs load and not loading, auto-trigger load
  if (needsLoad && !agentFilesLoading && !agentFilesError) {
    // 使用 setTimeout 避免在渲染期间触发状态更新
    // Use setTimeout to avoid triggering state update during render
    setTimeout(() => onLoadFiles(agentId), 0);

    // 显示加载中状态
    return html`
      <div class="mc-section">
        <div class="mc-card">
          <div class="mc-card__content mc-card__content--center">
            <p>正在加载 Agent 工作区文件...</p>
            <div class="mc-loading-spinner"></div>
          </div>
        </div>
      </div>
    `;
  }

  // 转换文件列表格式 / Convert file list format
  const files = convertToWorkspaceFiles(agentFilesList);

  // 获取当前选中文件的内容 / Get current selected file content
  const activeContent = agentFileActive ? agentFileContents[agentFileActive] ?? "" : "";
  const activeDraft = agentFileActive ? agentFileDrafts[agentFileActive] ?? activeContent : "";

  // 使用 workspace-content 布局渲染
  // Render using workspace-content layout
  return renderWorkspaceContent({
    files,
    workspaceDir: agentFilesList?.workspace ?? "",
    agentId,
    agents: [{ id: agentId, name: agentName, default: true }],
    selectedFile: agentFileActive,
    editorContent: activeDraft,
    originalContent: activeContent,
    loading: agentFilesLoading,
    saving: agentFileSaving,
    error: agentFilesError,
    editorMode,
    expandedFolders,
    mobileView,

    // 回调映射 / Callback mappings
    onFileSelect: onSelectFile,
    onContentChange: (content) => {
      if (agentFileActive) {
        onFileDraftChange(agentFileActive, content);
      }
    },
    onFileSave: () => {
      if (agentFileActive) {
        onFileSave(agentFileActive);
      }
    },
    onRefresh: () => onLoadFiles(agentId),
    onModeChange: onModeChange ?? (() => {}),
    onFileCreate: onFileCreate ?? (() => {}),
    onFolderToggle,
    onMobileBack,
    // 不显示 Agent 选择器（因为已经在 Agent 详情页内）
    // Don't show agent selector (already in agent details page)
    onAgentChange: undefined,
  });
}
