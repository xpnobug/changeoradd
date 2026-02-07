/**
 * 文件预览弹窗组件
 * File preview modal component
 */
import { html, nothing } from "lit";
import type { SkillsContentProps } from "../../types/skills-config";

/**
 * 渲染文件预览弹窗
 * Render file preview modal
 */
export function renderPreviewModal(props: SkillsContentProps) {
  const { previewState } = props;

  if (!previewState) return nothing;

  return html`
    <div class="skills-modal-overlay skill-preview-overlay" @click=${props.onPreviewClose}>
      <div class="skills-modal skill-preview-modal" @click=${(e: Event) => e.stopPropagation()}>
        <!-- 弹窗头部 -->
        <div class="skills-modal__header">
          <div class="skills-modal__title">
            <span class="skills-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            ${previewState.skillName ?? "技能文件"} - SKILL.md
          </div>
          <button class="skills-modal__close" @click=${props.onPreviewClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="skill-preview__body">
          ${previewState.loading
            ? html`<div class="skill-preview__loading">
                <div class="skill-preview__spinner"></div>
                <span>加载中...</span>
              </div>`
            : previewState.error
              ? html`<div class="skill-preview__error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <span>${previewState.error}</span>
                </div>`
              : html`<div class="skill-preview__content">${renderMarkdownPreviewContent(previewState.content)}</div>`}
        </div>

        <!-- 弹窗底部 -->
        <div class="skills-modal__footer">
          <button class="mc-btn" @click=${props.onPreviewClose}>关闭</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染 Markdown 预览内容（增强版）
 * Render markdown preview content (enhanced)
 */
export function renderMarkdownPreviewContent(content: string) {
  if (!content.trim()) {
    return html`<div class="skill-preview__empty">文件内容为空</div>`;
  }

  // 简单处理：将内容按行分割，处理标题、代码块、列表等
  const lines = content.split("\n");
  const elements: ReturnType<typeof html>[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  let codeLang = "";
  let inFrontmatter = false;
  let frontmatterContent = "";
  let frontmatterStarted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 处理 frontmatter (YAML)
    if (i === 0 && line.trim() === "---") {
      inFrontmatter = true;
      frontmatterStarted = true;
      continue;
    }
    if (inFrontmatter && line.trim() === "---") {
      inFrontmatter = false;
      elements.push(html`
        <details class="skill-preview__frontmatter">
          <summary>元数据 (Frontmatter)</summary>
          <pre class="skill-preview__code skill-preview__code--yaml">${frontmatterContent.trim()}</pre>
        </details>
      `);
      continue;
    }
    if (inFrontmatter) {
      frontmatterContent += line + "\n";
      continue;
    }

    // 处理代码块
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(html`<pre class="skill-preview__code skill-preview__code--${codeLang || "plain"}">${codeContent}</pre>`);
        codeContent = "";
        codeLang = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      continue;
    }

    // 处理标题
    if (line.startsWith("#### ")) {
      elements.push(html`<h5 class="skill-preview__h5">${line.slice(5)}</h5>`);
    } else if (line.startsWith("### ")) {
      elements.push(html`<h4 class="skill-preview__h4">${line.slice(4)}</h4>`);
    } else if (line.startsWith("## ")) {
      elements.push(html`<h3 class="skill-preview__h3">${line.slice(3)}</h3>`);
    } else if (line.startsWith("# ")) {
      elements.push(html`<h2 class="skill-preview__h2">${line.slice(2)}</h2>`);
    } else if (line.startsWith("---") && !frontmatterStarted) {
      elements.push(html`<hr class="skill-preview__hr" />`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(html`<li class="skill-preview__li">${line.slice(2)}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(html`<li class="skill-preview__li skill-preview__li--ordered">${line.replace(/^\d+\.\s/, "")}</li>`);
    } else if (line.startsWith("> ")) {
      elements.push(html`<blockquote class="skill-preview__blockquote">${line.slice(2)}</blockquote>`);
    } else if (line.trim()) {
      // 处理行内代码
      const processedLine = line.replace(/`([^`]+)`/g, '<code class="skill-preview__inline-code">$1</code>');
      elements.push(html`<p class="skill-preview__p" .innerHTML=${processedLine}></p>`);
    } else {
      // 空行
      elements.push(html`<div class="skill-preview__spacer"></div>`);
    }
  }

  return elements;
}
