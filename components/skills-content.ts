/**
 * 技能管理内容组件
 * Skills management content component
 *
 * 管理技能白名单、启用/禁用、API Key 配置等
 */
import { html, nothing } from "lit";
import type {
  SkillsContentProps,
  SkillStatusEntry,
  SkillStatusReport,
  SkillSourceFilter,
  SkillStatusFilter,
  SkillGroup,
  SkillMessage,
  SkillEditState,
  SkillEditorState,
  SkillCreateState,
  SkillDeleteState,
  EditableSkillSource,
  SkillEditorMode,
} from "../types/skills-config";

// ─── 辅助函数 / Helper functions ────────────────────────────────────────────

/**
 * 按来源分组技能
 */
function groupSkillsBySource(skills: SkillStatusEntry[]): SkillGroup[] {
  const groups: Record<string, SkillStatusEntry[]> = {
    "openclaw-bundled": [],
    "openclaw-managed": [],
    "openclaw-workspace": [],
  };

  for (const skill of skills) {
    const source = skill.source || "openclaw-workspace";
    if (!groups[source]) groups[source] = [];
    groups[source].push(skill);
  }

  const result: SkillGroup[] = [];
  if (groups["openclaw-bundled"].length > 0) {
    result.push({
      id: "bundled",
      label: `内置技能 (${groups["openclaw-bundled"].length})`,
      skills: groups["openclaw-bundled"],
    });
  }
  if (groups["openclaw-managed"].length > 0) {
    result.push({
      id: "managed",
      label: `本地技能 (${groups["openclaw-managed"].length})`,
      skills: groups["openclaw-managed"],
    });
  }
  if (groups["openclaw-workspace"].length > 0) {
    result.push({
      id: "workspace",
      label: `工作区技能 (${groups["openclaw-workspace"].length})`,
      skills: groups["openclaw-workspace"],
    });
  }
  return result;
}

/**
 * 过滤技能列表
 */
function filterSkills(
  skills: SkillStatusEntry[],
  filter: string,
  sourceFilter: SkillSourceFilter,
  statusFilter: SkillStatusFilter,
): SkillStatusEntry[] {
  let filtered = skills;

  // 文本搜索
  if (filter.trim()) {
    const q = filter.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.skillKey.toLowerCase().includes(q),
    );
  }

  // 来源过滤
  if (sourceFilter !== "all") {
    const sourceMap: Record<string, string> = {
      bundled: "openclaw-bundled",
      managed: "openclaw-managed",
      workspace: "openclaw-workspace",
    };
    const targetSource = sourceMap[sourceFilter];
    if (targetSource) {
      filtered = filtered.filter((s) => s.source === targetSource);
    }
  }

  // 状态过滤
  if (statusFilter === "eligible") {
    filtered = filtered.filter((s) => s.eligible);
  } else if (statusFilter === "blocked") {
    filtered = filtered.filter((s) => !s.eligible);
  } else if (statusFilter === "disabled") {
    filtered = filtered.filter((s) => s.disabled);
  }

  return filtered;
}

/**
 * 将完整来源名称转换为短格式（用于 RPC）
 * Convert full source name to short format (for RPC)
 */
function toShortSource(source: string): EditableSkillSource | null {
  if (source === "openclaw-managed") return "managed";
  if (source === "openclaw-workspace") return "workspace";
  return null;
}

/**
 * 截断文本
 */
function clampText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * 高亮搜索文本 (Phase 4)
 * Highlight search text in content
 */
function highlightText(text: string, query: string): ReturnType<typeof html> {
  if (!query.trim()) return html`${text}`;

  const q = query.trim().toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(q);

  if (index === -1) return html`${text}`;

  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);

  return html`${before}<mark class="skills-highlight">${match}</mark>${after}`;
}

/**
 * 计算技能统计 (Phase 4)
 * Calculate skill statistics
 */
function calculateStats(skills: SkillStatusEntry[]) {
  return {
    total: skills.length,
    eligible: skills.filter(s => s.eligible).length,
    blocked: skills.filter(s => !s.eligible && !s.disabled).length,
    disabled: skills.filter(s => s.disabled).length,
    bundled: skills.filter(s => s.source === "openclaw-bundled").length,
    managed: skills.filter(s => s.source === "openclaw-managed").length,
    workspace: skills.filter(s => s.source === "openclaw-workspace").length,
  };
}

// ─── 技能优先级说明 / Skill priority explanation ────────────────────────────

/**
 * 渲染技能优先级说明
 * Render skill priority explanation
 */
function renderPriorityExplanation() {
  return html`
    <div class="skills-priority-info">
      <div class="skills-priority-info__header">
        <span class="skills-priority-info__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </span>
        <span class="skills-priority-info__title">技能加载优先级</span>
      </div>
      <div class="skills-priority-info__content">
        <p class="skills-priority-info__desc">
          当多个来源存在同名技能时，高优先级来源会覆盖低优先级来源的技能定义：
        </p>
        <ol class="skills-priority-info__list">
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
        <p class="skills-priority-info__note">
          例如：如果内置技能和工作区技能都定义了 "git" 技能，Agent 将使用工作区版本。
        </p>
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
    <div class="skills-content">
      <!-- 头部 -->
      <div class="skills-header">
        <div class="skills-header__info">
          <h3 class="skills-title">技能管理</h3>
          <p class="skills-desc">管理 Agent 可用的技能、白名单和安装配置</p>
        </div>
        <div class="skills-header__actions">
          <!-- 创建技能按钮 -->
          <button
            class="mc-btn mc-btn--sm"
            @click=${() => props.onCreateOpen()}
          >
            + 新建技能
          </button>
          <button
            class="mc-btn mc-btn--sm"
            ?disabled=${props.loading}
            @click=${props.onRefresh}
          >
            ${props.loading ? "加载中..." : "刷新"}
          </button>
          ${props.hasChanges
            ? html`
                <button
                  class="mc-btn mc-btn--sm primary"
                  ?disabled=${props.saving}
                  @click=${props.onSave}
                >
                  ${props.saving ? "保存中..." : "保存配置"}
                </button>
              `
            : nothing}
        </div>
      </div>

      <!-- 统计摘要 (Phase 4) -->
      ${skills.length > 0 ? renderStatsBar(stats) : nothing}

      <!-- 技能优先级说明 -->
      ${renderPriorityExplanation()}

      <!-- 全局设置 -->
      ${renderGlobalSettings(props)}

      <!-- 筛选栏 -->
      ${renderFilterBar(props, skills.length, filtered.length)}

      <!-- 错误提示 -->
      ${props.error
        ? html`<div class="skills-error">${props.error}</div>`
        : nothing}

      <!-- 技能列表 -->
      ${props.loading && !props.report
        ? html`<div class="skills-loading">正在加载技能列表...</div>`
        : groups.length === 0
          ? html`<div class="skills-empty">没有找到匹配的技能</div>`
          : groups.map((group) => renderSkillGroup(group, props))}
    </div>

    <!-- 编辑器弹窗 -->
    ${props.editorState.open ? renderEditorModal(props) : nothing}

    <!-- 创建技能弹窗 -->
    ${props.createState.open ? renderCreateModal(props) : nothing}

    <!-- 删除确认弹窗 -->
    ${props.deleteState.open ? renderDeleteModal(props) : nothing}
  `;
}

// ─── 统计摘要 (Phase 4) / Stats bar ─────────────────────────────────────────

type SkillStats = {
  total: number;
  eligible: number;
  blocked: number;
  disabled: number;
  bundled: number;
  managed: number;
  workspace: number;
};

function renderStatsBar(stats: SkillStats) {
  return html`
    <div class="skills-stats">
      <div class="skills-stats__item">
        <span class="skills-stats__value">${stats.total}</span>
        <span class="skills-stats__label">总计</span>
      </div>
      <div class="skills-stats__divider"></div>
      <div class="skills-stats__item skills-stats__item--ok">
        <span class="skills-stats__value">${stats.eligible}</span>
        <span class="skills-stats__label">可用</span>
      </div>
      <div class="skills-stats__item skills-stats__item--warn">
        <span class="skills-stats__value">${stats.blocked}</span>
        <span class="skills-stats__label">受阻</span>
      </div>
      <div class="skills-stats__item skills-stats__item--disabled">
        <span class="skills-stats__value">${stats.disabled}</span>
        <span class="skills-stats__label">已禁用</span>
      </div>
      <div class="skills-stats__divider"></div>
      <div class="skills-stats__item">
        <span class="skills-stats__value">${stats.bundled}</span>
        <span class="skills-stats__label">内置</span>
      </div>
      <div class="skills-stats__item">
        <span class="skills-stats__value">${stats.managed}</span>
        <span class="skills-stats__label">本地</span>
      </div>
      <div class="skills-stats__item">
        <span class="skills-stats__value">${stats.workspace}</span>
        <span class="skills-stats__label">工作区</span>
      </div>
    </div>
  `;
}

// ─── 全局设置 / Global settings ─────────────────────────────────────────────

function renderGlobalSettings(props: SkillsContentProps) {
  const extraDirs = props.config?.load?.extraDirs ?? [];
  const extraDirsText = extraDirs.join("\n");

  return html`
    <div class="skills-section skills-global-settings">
      <div class="skills-section__header">
        <h4 class="skills-section__title">全局设置</h4>
      </div>
      <div class="skills-settings-grid">
        <!-- 白名单模式 -->
        <div class="skills-setting-item">
          <div class="skills-setting-item__header">
            <span class="skills-setting-item__title">内置技能模式</span>
            <span class="skills-setting-item__desc">控制内置技能的启用方式</span>
          </div>
          <div class="skills-radio-group">
            <label class="skills-radio">
              <input
                type="radio"
                name="allowlist-mode"
                value="all"
                .checked=${props.allowlistMode === "all"}
                @change=${() => props.onAllowlistModeChange("all")}
              />
              <span class="skills-radio__mark"></span>
              <span class="skills-radio__text">允许全部</span>
            </label>
            <label class="skills-radio">
              <input
                type="radio"
                name="allowlist-mode"
                value="whitelist"
                .checked=${props.allowlistMode === "whitelist"}
                @change=${() => props.onAllowlistModeChange("whitelist")}
              />
              <span class="skills-radio__mark"></span>
              <span class="skills-radio__text">仅白名单</span>
            </label>
          </div>
        </div>

        <!-- 安装偏好 -->
        <div class="skills-setting-item">
          <div class="skills-setting-item__header">
            <span class="skills-setting-item__title">安装偏好</span>
            <span class="skills-setting-item__desc">技能依赖的安装方式</span>
          </div>
          <select
            class="skills-select"
            .value=${props.config?.install?.preferBrew ? "true" : "false"}
            @change=${(e: Event) => {
              const value = (e.target as HTMLSelectElement).value === "true";
              props.onGlobalSettingChange("preferBrew", value);
            }}
          >
            <option value="true">优先使用 Homebrew</option>
            <option value="false">使用默认方式</option>
          </select>
        </div>

        <!-- Node 包管理器 -->
        <div class="skills-setting-item">
          <div class="skills-setting-item__header">
            <span class="skills-setting-item__title">Node 包管理器</span>
            <span class="skills-setting-item__desc">用于安装 Node.js 技能依赖</span>
          </div>
          <select
            class="skills-select"
            .value=${props.config?.install?.nodeManager ?? "npm"}
            @change=${(e: Event) => {
              const value = (e.target as HTMLSelectElement).value;
              props.onGlobalSettingChange("nodeManager", value);
            }}
          >
            <option value="npm">npm</option>
            <option value="pnpm">pnpm</option>
            <option value="yarn">yarn</option>
            <option value="bun">bun</option>
          </select>
        </div>

        <!-- 文件监视 -->
        <div class="skills-setting-item">
          <div class="skills-setting-item__header">
            <span class="skills-setting-item__title">文件监视</span>
            <span class="skills-setting-item__desc">自动重载技能文件变更</span>
          </div>
          <label class="skills-checkbox">
            <input
              type="checkbox"
              .checked=${props.config?.load?.watch ?? false}
              @change=${(e: Event) => {
                const checked = (e.target as HTMLInputElement).checked;
                props.onGlobalSettingChange("watch", checked);
              }}
            />
            <span class="skills-checkbox__text">启用文件监视</span>
          </label>
        </div>
      </div>

      <!-- 额外技能目录 -->
      <div class="skills-extra-dirs">
        <div class="skills-extra-dirs__header">
          <span class="skills-extra-dirs__title">额外技能目录</span>
          <span class="skills-extra-dirs__desc">每行一个目录路径</span>
        </div>
        <textarea
          class="skills-extra-dirs__textarea"
          placeholder="/path/to/skills&#10;/another/skills/dir"
          .value=${extraDirsText}
          @change=${(e: Event) => {
            const text = (e.target as HTMLTextAreaElement).value;
            const dirs = text
              .split("\n")
              .map((d) => d.trim())
              .filter((d) => d.length > 0);
            props.onExtraDirsChange(dirs);
          }}
        ></textarea>
      </div>
    </div>
  `;
}

// ─── 筛选栏 / Filter bar ────────────────────────────────────────────────────

function renderFilterBar(props: SkillsContentProps, total: number, shown: number) {
  return html`
    <div class="skills-filter">
      <div class="skills-filter__search">
        <input
          type="text"
          class="skills-filter__input"
          placeholder="搜索技能..."
          .value=${props.filter}
          @input=${(e: Event) =>
            props.onFilterChange((e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="skills-filter__selects">
        <select
          class="skills-filter__select"
          .value=${props.sourceFilter}
          @change=${(e: Event) =>
            props.onSourceFilterChange(
              (e.target as HTMLSelectElement).value as SkillSourceFilter,
            )}
        >
          <option value="all">全部来源</option>
          <option value="bundled">内置技能</option>
          <option value="managed">本地技能</option>
          <option value="workspace">工作区技能</option>
        </select>
        <select
          class="skills-filter__select"
          .value=${props.statusFilter}
          @change=${(e: Event) =>
            props.onStatusFilterChange(
              (e.target as HTMLSelectElement).value as SkillStatusFilter,
            )}
        >
          <option value="all">全部状态</option>
          <option value="eligible">可用</option>
          <option value="blocked">受阻</option>
          <option value="disabled">已禁用</option>
        </select>
      </div>
      <div class="skills-filter__count">
        显示 ${shown} / ${total}
      </div>
    </div>
  `;
}

// ─── 技能分组 / Skill group ─────────────────────────────────────────────────

function renderSkillGroup(group: SkillGroup, props: SkillsContentProps) {
  const isExpanded = props.expandedGroups.has(group.id);

  return html`
    <div class="skills-group ${isExpanded ? "skills-group--expanded" : ""}">
      <div
        class="skills-group__header"
        @click=${() => props.onGroupToggle(group.id)}
      >
        <span class="skills-group__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="${isExpanded ? "6 9 12 15 18 9" : "9 6 15 12 9 18"}"></polyline>
          </svg>
        </span>
        <span class="skills-group__label">${group.label}</span>
      </div>
      ${isExpanded
        ? html`
            <div class="skills-group__body">
              ${group.skills.map((skill) => renderSkillItem(skill, props))}
            </div>
          `
        : nothing}
    </div>
  `;
}

// ─── 技能条目 / Skill item ──────────────────────────────────────────────────

function renderSkillItem(skill: SkillStatusEntry, props: SkillsContentProps) {
  const isBusy = props.busySkill === skill.skillKey;
  const message = props.messages[skill.skillKey];
  const edit = props.edits[skill.skillKey];
  const isBundled = skill.source === "openclaw-bundled";
  const isEditable = skill.source === "openclaw-managed" || skill.source === "openclaw-workspace";
  const inAllowlist = edit?.inAllowlist ?? props.allowlistDraft.has(skill.skillKey);
  const canInstall = skill.install.length > 0 && skill.missing.bins.length > 0;
  const isSelected = props.selectedSkill === skill.skillKey;

  // 缺失项
  const missing = [
    ...skill.missing.bins.map((b) => `bin:${b}`),
    ...skill.missing.anyBins.map((b) => `anyBin:${b}`),
    ...skill.missing.env.map((e) => `env:${e}`),
    ...skill.missing.config.map((c) => `config:${c}`),
    ...skill.missing.os.map((o) => `os:${o}`),
  ];

  // 状态原因
  const reasons: string[] = [];
  if (skill.disabled) reasons.push("已禁用");
  if (skill.blockedByAllowlist) reasons.push("被白名单阻止");

  // 检查是否有额外环境变量需要配置
  const hasExtraEnv = (skill.requirements?.env ?? []).filter(e => e !== skill.primaryEnv).length > 0;

  return html`
    <div
      class="skills-item ${skill.eligible ? "skills-item--eligible" : "skills-item--blocked"} ${skill.disabled ? "skills-item--disabled" : ""} ${isSelected ? "skills-item--expanded" : ""}"
    >
      <div class="skills-item__main">
        <div class="skills-item__header">
          <span class="skills-item__name">
            ${skill.emoji ? `${skill.emoji} ` : ""}${highlightText(skill.name, props.filter)}
          </span>
          ${isBundled && props.allowlistMode === "whitelist"
            ? html`
                <label class="skills-allowlist-toggle" title="加入白名单">
                  <input
                    type="checkbox"
                    .checked=${inAllowlist}
                    @change=${(e: Event) => {
                      const checked = (e.target as HTMLInputElement).checked;
                      props.onAllowlistToggle(skill.skillKey, checked);
                    }}
                  />
                  <span class="skills-allowlist-toggle__icon">
                    ${inAllowlist ? "✓" : ""}
                  </span>
                </label>
              `
            : nothing}
          <!-- 展开/折叠按钮 -->
          <button
            class="mc-icon-btn skills-item__expand-btn"
            title="${isSelected ? "收起详情" : "展开详情"}"
            @click=${() => props.onSkillSelect(isSelected ? null : skill.skillKey)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="${isSelected ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}"></polyline>
            </svg>
          </button>
        </div>
        <div class="skills-item__desc">${highlightText(clampText(skill.description, 120), props.filter)}</div>
        <div class="skills-item__chips">
          <span class="skills-chip">${skill.source}</span>
          <span class="skills-chip ${skill.eligible ? "skills-chip--ok" : "skills-chip--warn"}">
            ${skill.eligible ? "可用" : "受阻"}
          </span>
          ${skill.disabled
            ? html`<span class="skills-chip skills-chip--warn">已禁用</span>`
            : nothing}
        </div>
        ${missing.length > 0
          ? html`
              <div class="skills-item__missing">
                缺失: ${missing.join(", ")}
              </div>
            `
          : nothing}
        ${reasons.length > 0
          ? html`
              <div class="skills-item__reasons">
                原因: ${reasons.join(", ")}
              </div>
            `
          : nothing}
      </div>

      <div class="skills-item__actions">
        <!-- 启用/禁用按钮 -->
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${isBusy}
          @click=${() => props.onSkillToggle(skill.skillKey, skill.disabled)}
        >
          ${skill.disabled ? "启用" : "禁用"}
        </button>

        <!-- 安装按钮 -->
        ${canInstall
          ? html`
              <button
                class="mc-btn mc-btn--sm"
                ?disabled=${isBusy}
                @click=${() =>
                  props.onInstall(skill.skillKey, skill.name, skill.install[0].id)}
              >
                ${isBusy ? "安装中..." : skill.install[0].label}
              </button>
            `
          : nothing}

        <!-- 编辑按钮（仅 managed 和 workspace 技能）-->
        ${isEditable
          ? html`
              <button
                class="mc-btn mc-btn--sm"
                ?disabled=${isBusy}
                @click=${() =>
                  props.onEditorOpen(
                    skill.skillKey,
                    skill.name,
                    toShortSource(skill.source) as EditableSkillSource
                  )}
              >
                编辑
              </button>
              <button
                class="mc-btn mc-btn--sm mc-btn--danger"
                ?disabled=${isBusy}
                @click=${() =>
                  props.onDeleteOpen(
                    skill.skillKey,
                    skill.name,
                    toShortSource(skill.source) as EditableSkillSource
                  )}
              >
                删除
              </button>
            `
          : nothing}

        <!-- 消息提示 -->
        ${message ? renderSkillMessage(message) : nothing}

        <!-- 安装进度指示器 (Phase 4) -->
        ${isBusy && canInstall ? renderInstallProgress(skill.name) : nothing}

        <!-- API Key 输入 -->
        ${skill.primaryEnv ? renderApiKeyInput(skill, props, isBusy) : nothing}
      </div>

      <!-- 展开区域：环境变量和配置编辑器 -->
      ${isSelected
        ? html`
            <div class="skills-item__details">
              <!-- 基本信息 -->
              <div class="skills-detail-section">
                <div class="skills-detail-section__title">基本信息</div>
                <div class="skills-detail-info">
                  <div class="skills-detail-row">
                    <span class="skills-detail-label">技能键:</span>
                    <span class="skills-detail-value mono">${skill.skillKey}</span>
                  </div>
                  <div class="skills-detail-row">
                    <span class="skills-detail-label">路径:</span>
                    <span class="skills-detail-value mono">${clampText(skill.filePath, 60)}</span>
                  </div>
                  ${skill.homepage
                    ? html`
                        <div class="skills-detail-row">
                          <span class="skills-detail-label">主页:</span>
                          <a class="skills-detail-link" href="${skill.homepage}" target="_blank" rel="noreferrer">
                            ${skill.homepage}
                          </a>
                        </div>
                      `
                    : nothing}
                  <!-- SKILL.md 文档链接 (Phase 4) -->
                  ${skill.filePath ? renderSkillDocsLink(skill.filePath) : nothing}
                </div>
              </div>

              <!-- 环境变量编辑器 -->
              ${hasExtraEnv ? renderEnvEditor(skill, props) : nothing}

              <!-- 自定义配置编辑器 -->
              ${renderConfigEditor(skill, props)}
            </div>
          `
        : nothing}
    </div>
  `;
}

// ─── 消息提示 / Message display ─────────────────────────────────────────────

function renderSkillMessage(message: SkillMessage) {
  return html`
    <div
      class="skills-message ${message.kind === "error" ? "skills-message--error" : "skills-message--success"}"
    >
      ${message.message}
    </div>
  `;
}

// ─── 安装进度指示器 (Phase 4) / Installation progress indicator ─────────────

function renderInstallProgress(skillName: string) {
  return html`
    <div class="skills-progress">
      <div class="skills-progress__header">
        <span class="skills-progress__title">正在安装 ${skillName}</span>
        <span class="skills-progress__status">请稍候...</span>
      </div>
      <div class="skills-progress__bar">
        <div class="skills-progress__fill skills-progress__fill--indeterminate"></div>
      </div>
      <div class="skills-progress__message">
        正在下载并安装依赖项，这可能需要几分钟时间...
      </div>
    </div>
  `;
}

// ─── SKILL.md 文档预览 (Phase 4) / SKILL.md document preview ────────────────

function renderSkillDocsLink(filePath: string) {
  // 计算 SKILL.md 路径（与技能文件同目录）
  const dirPath = filePath.replace(/\/[^/]+$/, "");
  const skillMdPath = `${dirPath}/SKILL.md`;

  return html`
    <div class="skills-detail-row">
      <span class="skills-detail-label">文档:</span>
      <span class="skills-detail-value">
        <a class="skills-docs-preview__link" href="file://${skillMdPath}" target="_blank" rel="noreferrer" title="查看 SKILL.md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          SKILL.md
        </a>
      </span>
    </div>
  `;
}

// ─── API Key 输入 / API Key input ───────────────────────────────────────────

function renderApiKeyInput(
  skill: SkillStatusEntry,
  props: SkillsContentProps,
  isBusy: boolean,
) {
  const edit = props.edits[skill.skillKey];
  const apiKey = edit?.apiKey ?? "";

  return html`
    <div class="skills-apikey">
      <label class="skills-apikey__label">${skill.primaryEnv}</label>
      <div class="skills-apikey__row">
        <input
          type="password"
          class="skills-apikey__input"
          placeholder="输入 API Key"
          .value=${apiKey}
          @input=${(e: Event) =>
            props.onSkillApiKeyChange(
              skill.skillKey,
              (e.target as HTMLInputElement).value,
            )}
        />
        <button
          class="mc-btn mc-btn--sm primary"
          ?disabled=${isBusy || !apiKey.trim()}
          @click=${() => props.onSkillApiKeySave(skill.skillKey)}
        >
          保存
        </button>
      </div>
    </div>
  `;
}

// ─── 环境变量编辑器 / Environment variable editor ────────────────────────────

function renderEnvEditor(
  skill: SkillStatusEntry,
  props: SkillsContentProps,
) {
  const edit = props.edits[skill.skillKey];
  const envEntries = Object.entries(edit?.env ?? {});
  const requiredEnvs = skill.requirements?.env ?? [];

  // 合并已有环境变量和需求环境变量
  const allEnvKeys = new Set([
    ...requiredEnvs,
    ...envEntries.map(([k]) => k),
  ]);

  // 过滤掉 primaryEnv（已在 API Key 输入中处理）
  const otherEnvKeys = [...allEnvKeys].filter(k => k !== skill.primaryEnv);

  if (otherEnvKeys.length === 0) return nothing;

  return html`
    <div class="skills-env-editor">
      <div class="skills-env-editor__header">
        <span class="skills-env-editor__title">环境变量</span>
      </div>
      <div class="skills-env-editor__list">
        ${otherEnvKeys.map((envKey) => {
          const value = edit?.env?.[envKey] ?? "";
          const isRequired = requiredEnvs.includes(envKey);
          const isMissing = skill.missing?.env?.includes(envKey);

          return html`
            <div class="skills-env-row ${isMissing ? "skills-env-row--missing" : ""}">
              <div class="skills-env-row__key">
                <span class="skills-env-row__label">${envKey}</span>
                ${isRequired
                  ? html`<span class="skills-env-row__badge">必需</span>`
                  : nothing}
              </div>
              <div class="skills-env-row__value">
                <input
                  type="password"
                  class="skills-env-row__input"
                  placeholder="输入值..."
                  .value=${value}
                  @input=${(e: Event) =>
                    props.onSkillEnvChange(
                      skill.skillKey,
                      envKey,
                      (e.target as HTMLInputElement).value,
                    )}
                />
                ${!isRequired
                  ? html`
                      <button
                        class="mc-icon-btn mc-icon-btn--danger"
                        title="移除"
                        @click=${() => props.onSkillEnvRemove(skill.skillKey, envKey)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    `
                  : nothing}
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}

// ─── 自定义配置编辑器 / Custom config editor ─────────────────────────────────

function renderConfigEditor(
  skill: SkillStatusEntry,
  props: SkillsContentProps,
) {
  const edit = props.edits[skill.skillKey];
  const configJson = edit?.config
    ? JSON.stringify(edit.config, null, 2)
    : "{}";

  return html`
    <div class="skills-config-editor">
      <div class="skills-config-editor__header">
        <span class="skills-config-editor__title">自定义配置</span>
        <span class="skills-config-editor__hint">JSON 格式</span>
      </div>
      <textarea
        class="skills-config-editor__textarea"
        placeholder='{"key": "value"}'
        .value=${configJson}
        @change=${(e: Event) => {
          const text = (e.target as HTMLTextAreaElement).value;
          try {
            const parsed = JSON.parse(text);
            props.onSkillConfigChange(skill.skillKey, parsed);
          } catch {
            // 忽略无效 JSON
          }
        }}
      ></textarea>
    </div>
  `;
}

// =========================================================================
// 弹窗组件 / Modal components (Phase 5-6)
// =========================================================================

// ─── 编辑器弹窗 / Editor modal ───────────────────────────────────────────────

/**
 * 渲染技能编辑器弹窗
 * Render skill editor modal
 */
function renderEditorModal(props: SkillsContentProps) {
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
          <button class="mc-btn" @click=${props.onEditorClose}>
            取消
          </button>
          <button
            class="mc-btn primary"
            ?disabled=${editorState.saving || !hasChanges}
            @click=${props.onEditorSave}
          >
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
            @input=${(e: Event) =>
              props.onEditorContentChange((e.target as HTMLTextAreaElement).value)}
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
              @input=${(e: Event) =>
                props.onEditorContentChange((e.target as HTMLTextAreaElement).value)}
              placeholder="# 技能名称\n\n在此编写技能说明..."
            ></textarea>
          </div>
          <div class="skills-editor__divider"></div>
          <div class="skills-editor__pane skills-editor__preview">
            ${renderMarkdownPreview(editorState.content)}
          </div>
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
function renderMarkdownPreview(content: string) {
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

// ─── 创建技能弹窗 / Create skill modal ───────────────────────────────────────

/**
 * 渲染创建技能弹窗
 * Render create skill modal
 */
function renderCreateModal(props: SkillsContentProps) {
  const { createState } = props;

  return html`
    <div class="skills-modal-overlay" @click=${props.onCreateClose}>
      <div class="skills-modal skills-create-modal" @click=${(e: Event) => e.stopPropagation()}>
        <!-- 弹窗头部 -->
        <div class="skills-modal__header">
          <div class="skills-modal__title">
            <span class="skills-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </span>
            新建技能
          </div>
          <button class="skills-modal__close" @click=${props.onCreateClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="skills-modal__body">
          ${createState.error
            ? html`<div class="skills-create__error">${createState.error}</div>`
            : nothing}

          <div class="skills-create__field">
            <label class="skills-create__label">技能名称</label>
            <input
              type="text"
              class="skills-create__input ${createState.nameError ? "error" : ""}"
              placeholder="my-skill"
              .value=${createState.name}
              @input=${(e: Event) =>
                props.onCreateNameChange((e.target as HTMLInputElement).value)}
            />
            ${createState.nameError
              ? html`<div class="skills-create__field-error">${createState.nameError}</div>`
              : html`<div class="skills-create__hint">仅允许小写字母、数字和连字符</div>`}
          </div>

          <div class="skills-create__field">
            <label class="skills-create__label">创建位置</label>
            <div class="skills-create__radio-group">
              <label class="skills-create__radio">
                <input
                  type="radio"
                  name="create-source"
                  value="workspace"
                  .checked=${createState.source === "workspace"}
                  @change=${() => props.onCreateSourceChange("workspace")}
                />
                <span class="skills-create__radio-mark"></span>
                <span class="skills-create__radio-text">
                  <strong>工作区技能</strong>
                  <small>仅当前项目可用</small>
                </span>
              </label>
              <label class="skills-create__radio">
                <input
                  type="radio"
                  name="create-source"
                  value="managed"
                  .checked=${createState.source === "managed"}
                  @change=${() => props.onCreateSourceChange("managed")}
                />
                <span class="skills-create__radio-mark"></span>
                <span class="skills-create__radio-text">
                  <strong>本地技能</strong>
                  <small>所有项目可用</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="skills-modal__footer">
          <button class="mc-btn" @click=${props.onCreateClose}>
            取消
          </button>
          <button
            class="mc-btn primary"
            ?disabled=${createState.creating || !!createState.nameError || !createState.name.trim()}
            @click=${props.onCreateConfirm}
          >
            ${createState.creating ? "创建中..." : "创建技能"}
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── 删除确认弹窗 / Delete confirmation modal ────────────────────────────────

/**
 * 渲染删除确认弹窗
 * Render delete confirmation modal
 */
function renderDeleteModal(props: SkillsContentProps) {
  const { deleteState } = props;

  return html`
    <div class="skills-modal-overlay" @click=${props.onDeleteClose}>
      <div class="skills-modal skills-delete-modal" @click=${(e: Event) => e.stopPropagation()}>
        <!-- 弹窗头部 -->
        <div class="skills-modal__header skills-modal__header--danger">
          <div class="skills-modal__title">
            <span class="skills-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </span>
            删除技能
          </div>
          <button class="skills-modal__close" @click=${props.onDeleteClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="skills-modal__body">
          ${deleteState.error
            ? html`<div class="skills-delete__error">${deleteState.error}</div>`
            : nothing}

          <div class="skills-delete__warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>此操作不可撤销</span>
          </div>

          <p class="skills-delete__message">
            确定要删除技能 <strong>${deleteState.skillName}</strong> 吗？
          </p>
          <p class="skills-delete__info">
            技能目录及其所有文件将被永久删除。
          </p>
        </div>

        <!-- 底部按钮 -->
        <div class="skills-modal__footer">
          <button class="mc-btn" @click=${props.onDeleteClose}>
            取消
          </button>
          <button
            class="mc-btn mc-btn--danger"
            ?disabled=${deleteState.deleting}
            @click=${props.onDeleteConfirm}
          >
            ${deleteState.deleting ? "删除中..." : "确认删除"}
          </button>
        </div>
      </div>
    </div>
  `;
}
