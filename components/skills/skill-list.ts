/**
 * 技能列表组件
 * Skills list components (tabs, cards, groups, items)
 */
import { html, nothing } from "lit";
import type {
  SkillsContentProps,
  SkillStatusEntry,
  SkillGroup,
  SkillMessage,
  EditableSkillSource,
} from "../../types/skills-config";
import { clampText, highlightText, toShortSource } from "./utils";

// ─── 技能标签页 / Skill tabs ─────────────────────────────────────────────────

/**
 * 渲染技能标签页
 */
export function renderSkillTabs(groups: SkillGroup[], props: SkillsContentProps) {
  const expandedArray = Array.from(props.expandedGroups);
  const activeGroupId = expandedArray.length > 0 ? expandedArray[0] : groups[0]?.id;
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  return html`
    <div class="skills-tabs">
      <!-- 标签页头部 -->
      <div class="skills-tabs__header">
        ${groups.map(
          (group) => html`
            <button
              class="skills-tabs__tab ${group.id === activeGroup?.id ? "skills-tabs__tab--active" : ""}"
              @click=${() => props.onGroupToggle(group.id)}
            >
              <span class="skills-tabs__tab-label">${getGroupShortLabel(group.id)}</span>
              <span class="skills-tabs__tab-count">${group.skills.length}</span>
            </button>
          `,
        )}
      </div>

      <!-- 标签页内容 -->
      <div class="skills-tabs__content">
        ${activeGroup
          ? html`
              <div class="skills-cards-grid">
                ${activeGroup.skills.map((skill) => renderSkillCard(skill, props))}
              </div>
            `
          : html`<div class="skills-empty">没有技能</div>`}
      </div>
    </div>
  `;
}

/**
 * 获取分组的简短标签
 */
function getGroupShortLabel(groupId: string): string {
  switch (groupId) {
    case "bundled":
      return "内置";
    case "managed":
      return "本地";
    case "workspace":
      return "工作区";
    default:
      return groupId;
  }
}

/**
 * 获取来源的简短标签
 */
function getSourceLabel(source: string): { label: string; type: "bundled" | "managed" | "workspace" } {
  switch (source) {
    case "openclaw-bundled":
      return { label: "内置", type: "bundled" };
    case "openclaw-managed":
      return { label: "本地", type: "managed" };
    case "openclaw-workspace":
      return { label: "工作区", type: "workspace" };
    default:
      return { label: source, type: "workspace" };
  }
}

// ─── 技能卡片 / Skill card ───────────────────────────────────────────────────

/**
 * 渲染技能卡片
 */
export function renderSkillCard(skill: SkillStatusEntry, props: SkillsContentProps) {
  const isBusy = props.busySkill === skill.skillKey;
  const isSelected = props.selectedSkill === skill.skillKey;
  const sourceInfo = getSourceLabel(skill.source);
  const tags = extractSkillTags(skill);

  return html`
    <div
      class="skill-card ${skill.eligible ? "" : "skill-card--blocked"} ${skill.disabled ? "skill-card--disabled" : ""} ${isSelected ? "skill-card--selected" : ""}"
    >
      <!-- 头部：来源标签 + 操作按钮 -->
      <div class="skill-card__header">
        <div class="skill-card__source skill-card__source--${sourceInfo.type}">${sourceInfo.label}</div>
        <button
          class="skill-card__toggle ${skill.disabled ? "skill-card__toggle--disabled" : "skill-card__toggle--enabled"}"
          ?disabled=${isBusy}
          @click=${(e: Event) => {
            e.stopPropagation();
            props.onSkillToggle(skill.skillKey, skill.disabled);
          }}
          title="${skill.disabled ? "点击启用" : "点击禁用"}"
        >
          ${isBusy ? "..." : skill.disabled ? "已禁用" : "已启用"}
        </button>
      </div>

      <!-- 标题 -->
      <h4 class="skill-card__title" @click=${() => props.onSkillSelect(isSelected ? null : skill.skillKey)}>
        ${skill.emoji ? `${skill.emoji} ` : ""}${highlightText(skill.name, props.filter)}
      </h4>

      <!-- 描述 -->
      <p class="skill-card__desc">${highlightText(clampText(skill.description, 80), props.filter)}</p>

      <!-- 标签 -->
      ${tags.length > 0
        ? html`
            <div class="skill-card__tags">
              ${tags.slice(0, 4).map((tag) => html`<span class="skill-card__tag">${tag}</span>`)}
            </div>
          `
        : nothing}

      <!-- 底部统计 -->
      <div class="skill-card__footer">
        <div class="skill-card__stats">
          <span class="skill-card__stat skill-card__stat--${skill.eligible ? "ok" : "warn"}" title="状态">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              ${skill.eligible
                ? html`<path d="M9 12l2 2 4-4"></path>`
                : html`<path d="M15 9l-6 6M9 9l6 6"></path>`}
            </svg>
            ${skill.eligible ? "可用" : "受阻"}
          </span>
          ${skill.requirements?.bins?.length
            ? html`
                <span class="skill-card__stat" title="依赖">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                  ${skill.requirements.bins.length}
                </span>
              `
            : nothing}
        </div>
        <!-- 展开详情按钮 -->
        <button
          class="skill-card__expand"
          @click=${() => props.onSkillSelect(isSelected ? null : skill.skillKey)}
          title="${isSelected ? "收起详情" : "展开详情"}"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="${isSelected ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * 从技能中提取标签
 */
function extractSkillTags(skill: SkillStatusEntry): string[] {
  const tags: string[] = [];

  const nameParts = skill.name.split(/[-_\s]+/);
  for (const part of nameParts) {
    if (part.length >= 2 && part.length <= 10 && !tags.includes(part)) {
      tags.push(part);
    }
  }

  if (skill.requirements?.bins?.length) {
    for (const bin of skill.requirements.bins.slice(0, 2)) {
      if (!tags.includes(bin)) {
        tags.push(bin);
      }
    }
  }

  return tags.slice(0, 4);
}

// ─── 技能分组 / Skill group ─────────────────────────────────────────────────

/**
 * 渲染技能分组
 */
export function renderSkillGroup(group: SkillGroup, props: SkillsContentProps) {
  const isExpanded = props.expandedGroups.has(group.id);

  return html`
    <div class="skills-group ${isExpanded ? "skills-group--expanded" : ""}">
      <div class="skills-group__header" @click=${() => props.onGroupToggle(group.id)}>
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

/**
 * 渲染技能条目
 */
export function renderSkillItem(skill: SkillStatusEntry, props: SkillsContentProps) {
  const isBusy = props.busySkill === skill.skillKey;
  const message = props.messages[skill.skillKey];
  const edit = props.edits[skill.skillKey];
  const isBundled = skill.source === "openclaw-bundled";
  const isEditable = skill.source === "openclaw-managed" || skill.source === "openclaw-workspace";
  const inAllowlist = edit?.inAllowlist ?? props.allowlistDraft.has(skill.skillKey);
  const canInstall = skill.install.length > 0 && skill.missing.bins.length > 0;
  const isSelected = props.selectedSkill === skill.skillKey;

  const missing = [
    ...skill.missing.bins.map((b) => `bin:${b}`),
    ...skill.missing.anyBins.map((b) => `anyBin:${b}`),
    ...skill.missing.env.map((e) => `env:${e}`),
    ...skill.missing.config.map((c) => `config:${c}`),
    ...skill.missing.os.map((o) => `os:${o}`),
  ];

  const reasons: string[] = [];
  if (skill.disabled) reasons.push("已禁用");
  if (skill.blockedByAllowlist) reasons.push("被白名单阻止");

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
                  <span class="skills-allowlist-toggle__icon">${inAllowlist ? "✓" : ""}</span>
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
          ${skill.disabled ? html`<span class="skills-chip skills-chip--warn">已禁用</span>` : nothing}
        </div>
        ${missing.length > 0 ? html`<div class="skills-item__missing">缺失: ${missing.join(", ")}</div>` : nothing}
        ${reasons.length > 0 ? html`<div class="skills-item__reasons">原因: ${reasons.join(", ")}</div>` : nothing}
      </div>

      <div class="skills-item__actions">
        <!-- 启用/禁用按钮 -->
        <button class="mc-btn mc-btn--sm" ?disabled=${isBusy} @click=${() => props.onSkillToggle(skill.skillKey, skill.disabled)}>
          ${skill.disabled ? "启用" : "禁用"}
        </button>

        <!-- 安装按钮 -->
        ${canInstall
          ? html`
              <button
                class="mc-btn mc-btn--sm"
                ?disabled=${isBusy}
                @click=${() => props.onInstall(skill.skillKey, skill.name, skill.install[0].id)}
              >
                ${isBusy ? "安装中..." : skill.install[0].label}
              </button>
            `
          : nothing}

        <!-- 编辑按钮 -->
        ${isEditable
          ? html`
              <button
                class="mc-btn mc-btn--sm"
                ?disabled=${isBusy}
                @click=${() =>
                  props.onEditorOpen(skill.skillKey, skill.name, toShortSource(skill.source) as EditableSkillSource)}
              >
                编辑
              </button>
              <button
                class="mc-btn mc-btn--sm mc-btn--danger"
                ?disabled=${isBusy}
                @click=${() =>
                  props.onDeleteOpen(skill.skillKey, skill.name, toShortSource(skill.source) as EditableSkillSource)}
              >
                删除
              </button>
            `
          : nothing}

        <!-- 消息提示 -->
        ${message ? renderSkillMessage(message) : nothing}
      </div>
    </div>
  `;
}

// ─── 消息提示 / Message display ─────────────────────────────────────────────

/**
 * 渲染消息提示
 */
export function renderSkillMessage(message: SkillMessage) {
  return html`
    <div class="skills-message ${message.kind === "error" ? "skills-message--error" : "skills-message--success"}">
      ${message.message}
    </div>
  `;
}

// ─── 安装进度指示器 / Installation progress indicator ─────────────────────────

/**
 * 渲染安装进度指示器
 */
export function renderInstallProgress(skillName: string) {
  return html`
    <div class="skills-progress">
      <div class="skills-progress__header">
        <span class="skills-progress__title">正在安装 ${skillName}</span>
        <span class="skills-progress__status">请稍候...</span>
      </div>
      <div class="skills-progress__bar">
        <div class="skills-progress__fill skills-progress__fill--indeterminate"></div>
      </div>
    </div>
  `;
}
