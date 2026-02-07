/**
 * 技能管理内容组件
 * Skills management content component
 *
 * 管理技能白名单、启用/禁用、API Key 配置等
 */
import { html, nothing } from "lit";
import type { SkillsContentProps } from "../types/skills-config";

// 从 skills/ 模块导入组件
import {
  groupSkillsBySource,
  filterSkills,
  calculateStats,
  renderStatsBar,
  renderGlobalSettings,
  renderFilterBar,
  renderSkillTabs,
  renderSkillDetailModal,
  renderEditorModal,
  renderCreateModal,
  renderPreviewModal,
  renderDeleteModal,
} from "./skills";

// ─── 技能优先级说明 / Skill priority explanation ────────────────────────────

/**
 * 渲染技能优先级说明（紧凑水平布局）
 * Render skill priority explanation (compact horizontal layout)
 */
function renderPriorityExplanation() {
  return html`
    <div class="skills-priority-info skills-priority-info--compact">
      <div class="skills-priority-info__header">
        <span class="skills-priority-info__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </span>
        <span class="skills-priority-info__title">技能加载优先级</span>
        <span class="skills-priority-info__subtitle">当多个来源存在同名技能时，高优先级来源会覆盖低优先级来源的技能定义：</span>
      </div>
      <div class="skills-priority-info__content">
        <ol class="skills-priority-info__list skills-priority-info__list--horizontal">
          <li>
            <span class="skills-priority-info__source">额外目录</span>
            <span class="skills-priority-info__priority">最低优先级</span>
          </li>
          <li>
            <span class="skills-priority-info__source">内置技能</span>
            <span class="skills-priority-info__priority">openclaw-bundled</span>
          </li>
          <li>
            <span class="skills-priority-info__source">本地技能</span>
            <span class="skills-priority-info__priority">~/.openclaw/skills/</span>
          </li>
          <li>
            <span class="skills-priority-info__source">工作区技能</span>
            <span class="skills-priority-info__priority skills-priority-info__priority--high">最高优先级</span>
          </li>
        </ol>
        <p class="skills-priority-info__note">例如：如果内置技能和工作区技能都定义了 "git" 技能，Agent 将使用工作区版本。</p>
      </div>
    </div>
  `;
}

// ─── 主渲染函数 / Main render function ──────────────────────────────────────

export function renderSkillsContent(props: SkillsContentProps) {
  const skills = props.report?.skills ?? [];
  const filtered = filterSkills(skills, props.filter, props.sourceFilter, props.statusFilter);
  const groups = groupSkillsBySource(filtered);
  const stats = calculateStats(skills);

  return html`
    <div class="config-content">
      <!-- 头部 -->
      <div class="config-content__header">
        <div class="skills-header__info">
          <h3 class="skills-title">技能管理</h3>
          <p class="skills-desc">管理 Agent 可用的技能、白名单和安装配置</p>
        </div>
        <div class="skills-header__actions">
          <!-- 创建技能按钮 -->
          <button class="mc-btn mc-btn--sm" @click=${() => props.onCreateOpen()}>+ 新建技能</button>
          <button class="mc-btn mc-btn--sm" ?disabled=${props.loading} @click=${props.onRefresh}>
            ${props.loading ? "加载中..." : "刷新"}
          </button>
          ${props.hasChanges
            ? html`
                <button class="mc-btn mc-btn--sm primary" ?disabled=${props.saving} @click=${props.onSave}>
                  ${props.saving ? "保存中..." : "保存配置"}
                </button>
              `
            : nothing}
        </div>
      </div>

      <!-- 统计摘要 -->
      ${skills.length > 0 ? renderStatsBar(stats) : nothing}

      <!-- 技能优先级说明 -->
      ${renderPriorityExplanation()}

      <!-- 全局设置 -->
      ${renderGlobalSettings(props)}

      <!-- 筛选栏 -->
      ${renderFilterBar(props, skills.length, filtered.length)}

      <!-- 错误提示 -->
      ${props.error ? html`<div class="skills-error">${props.error}</div>` : nothing}

      <!-- 技能列表 -->
      ${props.loading && !props.report
        ? html`<div class="skills-loading">正在加载技能列表...</div>`
        : groups.length === 0
          ? html`<div class="skills-empty">没有找到匹配的技能</div>`
          : renderSkillTabs(groups, props)}
    </div>

    <!-- 技能详情弹窗 -->
    ${props.selectedSkill ? renderSkillDetailModal(props.selectedSkill, props) : nothing}

    <!-- 文件预览弹窗 -->
    ${props.previewState?.open ? renderPreviewModal(props) : nothing}

    <!-- 编辑器弹窗 -->
    ${props.editorState.open ? renderEditorModal(props) : nothing}

    <!-- 创建技能弹窗 -->
    ${props.createState.open ? renderCreateModal(props) : nothing}

    <!-- 删除确认弹窗 -->
    ${props.deleteState.open ? renderDeleteModal(props) : nothing}
  `;
}
