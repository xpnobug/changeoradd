/**
 * 技能编辑器弹窗组件
 * Skill editor modal component
 */
import { html, nothing } from "lit";
import type { SkillsContentProps } from "../../types/skills-config";

/**
 * 渲染技能编辑器弹窗
 * Render skill editor modal
 */
export function renderEditorModal(props: SkillsContentProps) {
  const { editorState } = props;
  const hasChanges = editorState.content !== editorState.original;

  return html`
    <div class="skills-modal-overlay" @click=${props.onEditorClose}>
      <div class="skills-modal skills-editor-modal" @click=${(e: Event) => e.stopPropagation()}>
        <!-- 弹窗头部 -->
        <div class="skills-modal__header">
          <div class="skills-modal__title">
            <span class="skills-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </span>
            编辑技能: ${editorState.skillName}
          </div>
          <button class="skills-modal__close" @click=${props.onEditorClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 工具栏 -->
        <div class="skills-editor__toolbar">
          <div class="skills-editor__mode-tabs">
            <button
              class="skills-editor__mode-tab ${editorState.mode === "edit" ? "active" : ""}"
              @click=${() => props.onEditorModeChange("edit")}
            >
              编辑
            </button>
            <button
              class="skills-editor__mode-tab ${editorState.mode === "preview" ? "active" : ""}"
              @click=${() => props.onEditorModeChange("preview")}
            >
              预览
            </button>
            <button
              class="skills-editor__mode-tab ${editorState.mode === "split" ? "active" : ""}"
              @click=${() => props.onEditorModeChange("split")}
            >
              分屏
            </button>
          </div>
          <div class="skills-editor__info">
            <span class="skills-editor__source">${editorState.source}</span>
            ${hasChanges ? html`<span class="skills-editor__dirty">未保存</span>` : nothing}
          </div>
        </div>

        <!-- 编辑器内容 -->
        <div class="skills-modal__body skills-editor__body">
          ${editorState.loading
            ? html`<div class="skills-editor__loading">加载中...</div>`
            : editorState.error
              ? html`<div class="skills-editor__error">${editorState.error}</div>`
              : renderEditorContent(props)}
        </div>

        <!-- 底部按钮 -->
        <div class="skills-modal__footer">
          <button class="mc-btn" @click=${props.onEditorClose}>取消</button>
          <button class="mc-btn primary" ?disabled=${editorState.saving || !hasChanges} @click=${props.onEditorSave}>
            ${editorState.saving ? "保存中..." : "保存更改"}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染编辑器内容区域（根据模式）
 * Render editor content area (based on mode)
 */
function renderEditorContent(props: SkillsContentProps) {
  const { editorState } = props;

  switch (editorState.mode) {
    case "edit":
      return html`
        <div class="skills-editor__pane skills-editor__pane--full">
          <textarea
            class="skills-editor__textarea"
            .value=${editorState.content}
            @input=${(e: Event) => props.onEditorContentChange((e.target as HTMLTextAreaElement).value)}
            placeholder="# 技能名称\n\n在此编写技能说明..."
          ></textarea>
        </div>
      `;
    case "preview":
      return html`
        <div class="skills-editor__pane skills-editor__pane--full skills-editor__preview">
          ${renderMarkdownPreview(editorState.content)}
        </div>
      `;
    case "split":
      return html`
        <div class="skills-editor__split">
          <div class="skills-editor__pane">
            <textarea
              class="skills-editor__textarea"
              .value=${editorState.content}
              @input=${(e: Event) => props.onEditorContentChange((e.target as HTMLTextAreaElement).value)}
              placeholder="# 技能名称\n\n在此编写技能说明..."
            ></textarea>
          </div>
          <div class="skills-editor__divider"></div>
          <div class="skills-editor__pane skills-editor__preview">${renderMarkdownPreview(editorState.content)}</div>
        </div>
      `;
    default:
      return nothing;
  }
}

/**
 * 简单的 Markdown 预览（仅处理基本格式）
 * Simple markdown preview (basic formatting only)
 */
export function renderMarkdownPreview(content: string) {
  // 简单处理：将内容按行分割，处理标题和代码块
  const lines = content.split("\n");
  const elements: ReturnType<typeof html>[] = [];
  let inCodeBlock = false;
  let codeContent = "";

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(html`<pre class="skills-preview__code">${codeContent}</pre>`);
        codeContent = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(html`<h4 class="skills-preview__h4">${line.slice(4)}</h4>`);
    } else if (line.startsWith("## ")) {
      elements.push(html`<h3 class="skills-preview__h3">${line.slice(3)}</h3>`);
    } else if (line.startsWith("# ")) {
      elements.push(html`<h2 class="skills-preview__h2">${line.slice(2)}</h2>`);
    } else if (line.startsWith("---")) {
      elements.push(html`<hr class="skills-preview__hr" />`);
    } else if (line.startsWith("- ")) {
      elements.push(html`<li class="skills-preview__li">${line.slice(2)}</li>`);
    } else if (line.trim()) {
      elements.push(html`<p class="skills-preview__p">${line}</p>`);
    }
  }

  return html`<div class="skills-preview__content">${elements}</div>`;
}
