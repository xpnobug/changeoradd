/**
 * 工作区文件管理内容组件
 * Workspace file management content component
 *
 * 右侧面板 - 文件列表 + 编辑器 + 预览
 * Right panel - File list + Editor + Preview
 */
import { html, nothing } from "lit";

// ─── 类型定义 / Types ──────────────────────────────────────────────────────

/** 工作区文件信息 / Workspace file info */
export type WorkspaceFileInfo = {
  name: string;
  path: string;
  exists: boolean;
  size: number;
  modifiedAt: number | null;
};

/** Agent 选项 / Agent option */
export type WorkspaceAgentOption = {
  id: string;
  name?: string;
  default?: boolean;
};

/** 组件属性 / Component props */
export type WorkspaceContentProps = {
  /** 文件列表 / File list */
  files: WorkspaceFileInfo[];
  /** 当前工作区目录 / Current workspace directory */
  workspaceDir: string;
  /** 当前 Agent ID */
  agentId: string;
  /** 可用的 Agent 列表 / Available agents */
  agents: WorkspaceAgentOption[];
  /** 当前选中的文件名 / Currently selected file name */
  selectedFile: string | null;
  /** 编辑器内容 / Editor content */
  editorContent: string;
  /** 原始内容（用于变更检测）/ Original content (for change detection) */
  originalContent: string;
  /** 是否正在加载 / Loading state */
  loading: boolean;
  /** 是否正在保存 / Saving state */
  saving: boolean;
  /** 错误信息 / Error message */
  error: string | null;
  /** 编辑模式：edit=编辑, preview=预览, split=分屏 / Editor mode */
  editorMode: "edit" | "preview" | "split";
  /** 展开的文件夹集合 / Set of expanded folders */
  expandedFolders?: Set<string>;

  // 回调函数 / Callbacks
  /** 选择文件 / Select file */
  onFileSelect: (fileName: string) => void;
  /** 编辑器内容变更 / Editor content changed */
  onContentChange: (content: string) => void;
  /** 保存文件 / Save file */
  onFileSave: () => void;
  /** 刷新文件列表 / Refresh file list */
  onRefresh: () => void;
  /** 切换编辑模式 / Toggle editor mode */
  onModeChange: (mode: "edit" | "preview" | "split") => void;
  /** 创建新文件 / Create new file */
  onFileCreate: (fileName: string) => void;
  /** 切换文件夹展开状态 / Toggle folder expansion */
  onFolderToggle?: (folderName: string) => void;
  /** 切换 Agent / Switch agent */
  onAgentChange?: (agentId: string) => void;
};

// ─── SVG 图标 / Icons ──────────────────────────────────────────────────────

const icons = {
  // 文件夹图标 / Folder icon
  folder: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  // 文件图标 / File icon
  file: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
  // 编辑图标 / Edit icon
  edit: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  // 预览图标 / Eye icon
  eye: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  // 分屏图标 / Split icon
  split: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>`,
  // 保存图标 / Save icon
  save: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
  // 刷新图标 / Refresh icon
  refresh: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  // 加号图标 / Plus icon
  plus: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  // 展开箭头 / Chevron right (collapsed)
  chevronRight: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  // 收起箭头 / Chevron down (expanded)
  chevronDown: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
};

// ─── 中文标签 / Labels ──────────────────────────────────────────────────────

const LABELS = {
  title: "工作区文件",
  desc: "管理 Agent 的提示词、身份和记忆文件",
  filesTitle: "文件列表",
  editorTitle: "文件编辑器",
  previewTitle: "预览",
  noFileSelected: "请从左侧选择一个文件",
  fileNotExist: "文件不存在，保存后将创建",
  loading: "加载中...",
  saving: "保存中...",
  save: "保存",
  refresh: "刷新",
  create: "创建",
  editMode: "编辑",
  previewMode: "预览",
  splitMode: "分屏",
  unsaved: "未保存",
  path: "路径",
  size: "大小",
  modified: "修改时间",
  workspaceDir: "工作区目录",
};

// ─── 文件描述映射 / File description map ────────────────────────────────────

const FILE_DESCRIPTIONS: Record<string, string> = {
  "SOUL.md": "人格定义 - 行为准则、语气风格、道德边界",
  "IDENTITY.md": "身份信息 - 名称、表情、头像、类型",
  "TOOLS.md": "工具说明 - 可用工具的使用文档",
  "USER.md": "用户身份 - 用户的上下文信息",
  "HEARTBEAT.md": "心跳消息 - 周期性提醒内容",
  "BOOTSTRAP.md": "引导文件 - 启动时加载的初始内容",
  "MEMORY.md": "持久记忆 - Agent 的长期记忆",
  "memory.md": "持久记忆 (小写) - Agent 的长期记忆",
  "AGENTS.md": "Agent 配置 - 多 Agent 协作设置",
};

/**
 * 获取文件描述，支持 memory/ 目录下的日期文件
 * Get file description, supports dated files in memory/ directory
 */
function getFileDescription(fileName: string): string {
  // Check static descriptions first
  if (FILE_DESCRIPTIONS[fileName]) {
    return FILE_DESCRIPTIONS[fileName];
  }

  // Handle memory/ directory files (memory/YYYY-MM-DD.md)
  if (fileName.startsWith("memory/")) {
    const dateMatch = fileName.match(/^memory\/(\d{4})-(\d{2})-(\d{2})\.md$/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      return `每日日志 - ${year}年${month}月${day}日的记录`;
    }
    return "每日日志 - 日期记录文件";
  }

  return "";
}

// ─── 辅助函数 / Helpers ─────────────────────────────────────────────────────

/** 格式化文件大小 / Format file size */
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 格式化时间 / Format time */
function formatTime(ts: number | null): string {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 简易 Markdown → HTML 渲染
 * Simple Markdown to HTML renderer
 * 支持标题、粗体、斜体、代码块、列表
 */
function renderMarkdownToHtml(md: string): string {
  if (!md) return '<p class="ws-preview__empty">文件为空</p>';

  let result = md
    // 转义 HTML / Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 代码块 / Code blocks
  result = result.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre class="ws-preview__code"><code>$2</code></pre>',
  );

  // 行内代码 / Inline code
  result = result.replace(/`([^`]+)`/g, '<code class="ws-preview__inline-code">$1</code>');

  // 标题 / Headings
  result = result.replace(/^### (.+)$/gm, '<h3 class="ws-preview__h3">$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2 class="ws-preview__h2">$1</h2>');
  result = result.replace(/^# (.+)$/gm, '<h1 class="ws-preview__h1">$1</h1>');

  // 粗体和斜体 / Bold and italic
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // 无序列表 / Unordered lists
  result = result.replace(/^[-*] (.+)$/gm, '<li class="ws-preview__li">$1</li>');

  // 水平线 / Horizontal rule
  result = result.replace(/^---$/gm, '<hr class="ws-preview__hr">');

  // 段落 / Paragraphs (lines that are not already wrapped)
  const lines = result.split("\n");
  const processed: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("<hr") ||
      trimmed.startsWith("</")
    ) {
      processed.push(line);
    } else {
      processed.push(`<p class="ws-preview__p">${line}</p>`);
    }
  }

  return processed.join("\n");
}

// ─── 文件分组 / Group files by directory ──────────────────────────────────

type FileGroup = {
  /** 文件夹名称（null 表示根目录）/ Folder name (null = root) */
  folder: string | null;
  /** 文件夹描述 / Folder description */
  desc: string;
  /** 文件列表 / File list */
  files: WorkspaceFileInfo[];
};

const FOLDER_DESCRIPTIONS: Record<string, string> = {
  memory: "每日日志 - 按日期存放的记录文件",
};

/**
 * 将文件列表按目录分组
 * Group file list by directory
 */
function groupFilesByFolder(files: WorkspaceFileInfo[]): FileGroup[] {
  const rootFiles: WorkspaceFileInfo[] = [];
  const folderMap = new Map<string, WorkspaceFileInfo[]>();

  for (const file of files) {
    const slashIdx = file.name.indexOf("/");
    if (slashIdx === -1) {
      rootFiles.push(file);
    } else {
      const folder = file.name.slice(0, slashIdx);
      if (!folderMap.has(folder)) {
        folderMap.set(folder, []);
      }
      folderMap.get(folder)!.push(file);
    }
  }

  const groups: FileGroup[] = [];

  // Root files first / 根目录文件优先
  if (rootFiles.length > 0) {
    groups.push({ folder: null, desc: "", files: rootFiles });
  }

  // Then folders / 然后是文件夹
  for (const [folder, folderFiles] of folderMap) {
    groups.push({
      folder,
      desc: FOLDER_DESCRIPTIONS[folder] ?? "",
      files: folderFiles,
    });
  }

  return groups;
}

// ─── 渲染单个文件项 / Render single file item ──────────────────────────────

function renderFileItem(
  file: WorkspaceFileInfo,
  props: WorkspaceContentProps,
  hasChanges: boolean,
  indent = false,
) {
  const isSelected = props.selectedFile === file.name;
  const desc = getFileDescription(file.name);
  // For indented items, only show the base name / 缩进项只显示基础文件名
  const displayName = indent && file.name.includes("/")
    ? file.name.slice(file.name.lastIndexOf("/") + 1)
    : file.name;

  return html`
    <button
      class="ws-file-item ${isSelected ? "ws-file-item--active" : ""} ${!file.exists ? "ws-file-item--missing" : ""} ${indent ? "ws-file-item--indent" : ""}"
      @click=${() => props.onFileSelect(file.name)}
      title=${file.path}
    >
      <span class="ws-file-item__icon">${icons.file}</span>
      <span class="ws-file-item__info">
        <span class="ws-file-item__name">
          ${displayName}
          ${!file.exists
            ? html`<span class="ws-file-item__badge ws-file-item__badge--new">新建</span>`
            : nothing}
          ${isSelected && hasChanges
            ? html`<span class="ws-file-item__badge ws-file-item__badge--unsaved">${LABELS.unsaved}</span>`
            : nothing}
        </span>
        <span class="ws-file-item__desc">${desc}</span>
        ${file.exists
          ? html`<span class="ws-file-item__meta">${formatSize(file.size)} · ${formatTime(file.modifiedAt)}</span>`
          : nothing}
      </span>
    </button>
  `;
}

// ─── 渲染文件列表 / Render file list ──────────────────────────────────────

function renderFileList(props: WorkspaceContentProps) {
  const hasChanges = !!(
    props.selectedFile && props.editorContent !== props.originalContent
  );
  const groups = groupFilesByFolder(props.files);
  const expandedFolders = props.expandedFolders ?? new Set<string>();

  return html`
    <div class="ws-file-list">
      <div class="ws-file-list__header">
        <div class="ws-file-list__title">${LABELS.filesTitle}</div>
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${props.loading}
          @click=${() => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, "0");
            props.onFileCreate(`memory/${yyyy}-${mm}-${dd}.md`);
          }}
          title="创建今日日志"
        >
          ${icons.plus}
        </button>
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${props.loading}
          @click=${props.onRefresh}
          title=${LABELS.refresh}
        >
          ${icons.refresh}
        </button>
      </div>
      <div class="ws-file-list__body">
        ${groups.map((group) => {
          // Root files: render directly / 根目录文件直接渲染
          if (group.folder === null) {
            return group.files.map((file) =>
              renderFileItem(file, props, hasChanges, false),
            );
          }

          // Folder group: render as collapsible / 文件夹：渲染为可展开
          const folderName = group.folder;
          const isExpanded = expandedFolders.has(folderName);
          const fileCount = group.files.length;
          // Check if any child is selected / 检查是否有子文件被选中
          const hasSelectedChild = group.files.some(
            (f) => f.name === props.selectedFile,
          );

          return html`
            <button
              class="ws-folder-item ${hasSelectedChild ? "ws-folder-item--has-active" : ""}"
              @click=${() => props.onFolderToggle?.(folderName)}
              title="${folderName}/ (${fileCount} 个文件)"
            >
              <span class="ws-folder-item__chevron">
                ${isExpanded ? icons.chevronDown : icons.chevronRight}
              </span>
              <span class="ws-folder-item__icon">${icons.folder}</span>
              <span class="ws-folder-item__info">
                <span class="ws-folder-item__name">
                  ${folderName}/
                  <span class="ws-folder-item__count">${fileCount}</span>
                </span>
                ${group.desc
                  ? html`<span class="ws-folder-item__desc">${group.desc}</span>`
                  : nothing}
              </span>
            </button>
            ${isExpanded
              ? group.files.map((file) =>
                  renderFileItem(file, props, hasChanges, true),
                )
              : nothing}
          `;
        })}
      </div>
      <!-- 工作区目录显示 / Workspace dir display -->
      <div class="ws-file-list__footer">
        <span class="ws-file-list__dir-label">${LABELS.workspaceDir}</span>
        <span class="ws-file-list__dir-path" title=${props.workspaceDir}>${props.workspaceDir}</span>
      </div>
    </div>
  `;
}

// ─── 渲染编辑器工具栏 / Render editor toolbar ────────────────────────────────

function renderEditorToolbar(props: WorkspaceContentProps) {
  const hasChanges = props.editorContent !== props.originalContent;

  return html`
    <div class="ws-editor__toolbar">
      <div class="ws-editor__toolbar-left">
        <span class="ws-editor__filename">${props.selectedFile ?? ""}</span>
        ${hasChanges
          ? html`<span class="ws-editor__unsaved-dot" title=${LABELS.unsaved}></span>`
          : nothing}
      </div>
      <div class="ws-editor__toolbar-right">
        <!-- 模式切换 / Mode toggle -->
        <div class="ws-editor__mode-group">
          <button
            class="ws-editor__mode-btn ${props.editorMode === "edit" ? "ws-editor__mode-btn--active" : ""}"
            @click=${() => props.onModeChange("edit")}
            title=${LABELS.editMode}
          >${icons.edit}</button>
          <button
            class="ws-editor__mode-btn ${props.editorMode === "split" ? "ws-editor__mode-btn--active" : ""}"
            @click=${() => props.onModeChange("split")}
            title=${LABELS.splitMode}
          >${icons.split}</button>
          <button
            class="ws-editor__mode-btn ${props.editorMode === "preview" ? "ws-editor__mode-btn--active" : ""}"
            @click=${() => props.onModeChange("preview")}
            title=${LABELS.previewMode}
          >${icons.eye}</button>
        </div>
        <!-- 保存按钮 / Save button -->
        <button
          class="mc-btn mc-btn--sm mc-btn--primary"
          ?disabled=${!hasChanges || props.saving}
          @click=${props.onFileSave}
        >
          ${icons.save}
          ${props.saving ? LABELS.saving : LABELS.save}
        </button>
      </div>
    </div>
  `;
}

// ─── 渲染编辑器 / Render editor ─────────────────────────────────────────────

function renderEditor(props: WorkspaceContentProps) {
  if (!props.selectedFile) {
    return html`
      <div class="ws-editor__empty">
        <div class="ws-editor__empty-icon">${icons.file}</div>
        <div class="ws-editor__empty-text">${LABELS.noFileSelected}</div>
      </div>
    `;
  }

  const showEditor = props.editorMode === "edit" || props.editorMode === "split";
  const showPreview = props.editorMode === "preview" || props.editorMode === "split";

  return html`
    ${renderEditorToolbar(props)}
    ${props.error
      ? html`<div class="mc-error">${props.error}</div>`
      : nothing}
    <div class="ws-editor__panels ${props.editorMode === "split" ? "ws-editor__panels--split" : ""}">
      ${showEditor
        ? html`
            <div class="ws-editor__edit-panel">
              <textarea
                class="ws-editor__textarea"
                .value=${props.editorContent}
                @input=${(e: Event) =>
                  props.onContentChange(
                    (e.target as HTMLTextAreaElement).value,
                  )}
                placeholder="在此输入内容..."
                spellcheck="false"
              ></textarea>
            </div>
          `
        : nothing}
      ${showPreview
        ? html`
            <div class="ws-editor__preview-panel">
              <div class="ws-preview">
                ${renderMarkdownPreview(props.editorContent)}
              </div>
            </div>
          `
        : nothing}
    </div>
  `;
}

/**
 * 渲染 Markdown 预览（使用 unsafeHTML 代替）
 * Render Markdown preview
 *
 * 为了避免依赖 lit 的 unsafeHTML 指令，使用 iframe srcdoc
 * To avoid dependency on lit's unsafeHTML directive, use iframe srcdoc
 */
function renderMarkdownPreview(content: string) {
  const htmlContent = renderMarkdownToHtml(content);
  // 使用 srcdoc iframe 来安全渲染 HTML
  // Use srcdoc iframe to safely render HTML
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: #e0e0e0;
    background: transparent;
    margin: 0;
    padding: 4px;
    word-wrap: break-word;
  }
  @media (prefers-color-scheme: light) {
    body { color: #333; }
  }
  h1 { font-size: 1.6em; margin: 0.8em 0 0.4em; border-bottom: 1px solid rgba(128,128,128,0.3); padding-bottom: 0.3em; }
  h2 { font-size: 1.3em; margin: 0.7em 0 0.3em; }
  h3 { font-size: 1.1em; margin: 0.6em 0 0.3em; }
  p { margin: 0.4em 0; }
  pre { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 13px; }
  code { font-family: "SF Mono", "Fira Code", monospace; font-size: 0.9em; }
  p code { background: rgba(0,0,0,0.2); padding: 2px 5px; border-radius: 3px; }
  li { margin: 0.2em 0; margin-left: 1.2em; }
  hr { border: none; border-top: 1px solid rgba(128,128,128,0.3); margin: 1em 0; }
  strong { font-weight: 600; }
</style>
</head>
<body>${htmlContent}</body>
</html>`;

  return html`<iframe
    class="ws-preview__iframe"
    srcdoc=${fullHtml}
    sandbox="allow-same-origin"
    frameborder="0"
  ></iframe>`;
}

// ─── 主渲染函数 / Main render function ──────────────────────────────────────

/**
 * 渲染 Agent 选择器
 * Render agent selector
 */
function renderAgentSelector(props: WorkspaceContentProps) {
  // 如果没有多个 agent 或没有回调，不显示选择器
  if (!props.agents || props.agents.length <= 1 || !props.onAgentChange) {
    return nothing;
  }

  return html`
    <div class="ws-agent-selector">
      <label class="ws-agent-selector__label">Agent:</label>
      <select
        class="ws-agent-selector__select"
        .value=${props.agentId}
        @change=${(e: Event) => {
          const select = e.target as HTMLSelectElement;
          props.onAgentChange?.(select.value);
        }}
      >
        ${props.agents.map(
          (agent) => html`
            <option value=${agent.id} ?selected=${agent.id === props.agentId}>
              ${agent.name || agent.id}${agent.default ? " (默认)" : ""}
            </option>
          `,
        )}
      </select>
    </div>
  `;
}

/**
 * 渲染工作区文件管理内容
 * Render workspace file management content
 * 
 *       <div class="config-content__header">
        <div class="config-content__icon">${icons.folder}</div>
        <div class="config-content__titles">
          <h2 class="config-content__title">${LABELS.title}</h2>
          <p class="config-content__desc">${LABELS.desc}</p>
        </div>
        ${renderAgentSelector(props)}
      </div>
 */
export function renderWorkspaceContent(props: WorkspaceContentProps) {
  return html`
    <div class="config-content">

      <div class="ws-layout">
        <!-- 左侧文件列表 / Left file list -->
        ${renderFileList(props)}
        <!-- 右侧编辑器 / Right editor -->
        <div class="ws-editor">
          ${props.loading
            ? html`<div class="ws-editor__loading">${LABELS.loading}</div>`
            : renderEditor(props)}
        </div>
      </div>
    </div>
  `;
}
