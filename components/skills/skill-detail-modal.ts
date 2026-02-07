/**
 * 技能详情弹窗组件
 * Skill detail modal component
 */
import { html, nothing } from "lit";
import type {
  SkillsContentProps,
  EditableSkillSource,
} from "../../types/skills-config";
import { clampText, toShortSource } from "./utils";

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

/**
 * 渲染技能详情弹窗
 * Render skill detail modal
 */
export function renderSkillDetailModal(skillKey: string, props: SkillsContentProps) {
  const skills = props.report?.skills ?? [];
  const skill = skills.find((s) => s.skillKey === skillKey);

  if (!skill) return nothing;

  const isBusy = props.busySkill === skill.skillKey;
  const edit = props.edits[skill.skillKey];
  const isBundled = skill.source === "openclaw-bundled";
  const isEditable = skill.source === "openclaw-managed" || skill.source === "openclaw-workspace";
  const inAllowlist = edit?.inAllowlist ?? props.allowlistDraft.has(skill.skillKey);
  const canInstall = skill.install.length > 0 && skill.missing.bins.length > 0;
  const sourceInfo = getSourceLabel(skill.source);

  // 缺失项
  const missing = [
    ...skill.missing.bins.map((b) => `bin:${b}`),
    ...skill.missing.anyBins.map((b) => `anyBin:${b}`),
    ...skill.missing.env.map((e) => `env:${e}`),
    ...skill.missing.config.map((c) => `config:${c}`),
    ...skill.missing.os.map((o) => `os:${o}`),
  ];

  return html`
    <div class="skill-detail-overlay" @click=${() => props.onSkillSelect(null)}>
      <div class="skill-detail-modal" @click=${(e: Event) => e.stopPropagation()}>
        <!-- 弹窗头部 -->
        <div class="skill-detail__header">
          <div class="skill-detail__title-row">
            <div class="skill-card__source skill-card__source--${sourceInfo.type}">${sourceInfo.label}</div>
            <h3 class="skill-detail__title">${skill.emoji ? `${skill.emoji} ` : ""}${skill.name}</h3>
          </div>
          <button class="skill-detail__close" @click=${() => props.onSkillSelect(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="skill-detail__body">
          <!-- 描述 -->
          <p class="skill-detail__desc">${skill.description}</p>

          <!-- 状态信息 -->
          <div class="skill-detail__status">
            <div class="skill-detail__status-item">
              <span class="skill-detail__status-label">状态</span>
              <span class="skill-detail__status-value skill-detail__status-value--${skill.eligible ? "ok" : "warn"}">
                ${skill.eligible ? "可用" : "受阻"}
              </span>
            </div>
            <div class="skill-detail__status-item">
              <span class="skill-detail__status-label">启用</span>
              <span class="skill-detail__status-value skill-detail__status-value--${skill.disabled ? "warn" : "ok"}">
                ${skill.disabled ? "已禁用" : "已启用"}
              </span>
            </div>
          </div>

          <!-- 缺失项 -->
          ${missing.length > 0
            ? html`
                <div class="skill-detail__section">
                  <h4 class="skill-detail__section-title">缺失依赖</h4>
                  <div class="skill-detail__missing-list">
                    ${missing.map((m) => html`<span class="skill-detail__missing-item">${m}</span>`)}
                  </div>
                </div>
              `
            : nothing}

          <!-- 基本信息 -->
          <div class="skill-detail__section">
            <h4 class="skill-detail__section-title">基本信息</h4>
            <div class="skill-detail__info-grid">
              <div class="skill-detail__info-row">
                <span class="skill-detail__info-label">技能键</span>
                <span class="skill-detail__info-value mono">${skill.skillKey}</span>
              </div>
              <div class="skill-detail__info-row">
                <span class="skill-detail__info-label">文件路径</span>
                <span class="skill-detail__info-value mono">${clampText(skill.filePath, 50)}</span>
              </div>
              ${skill.homepage
                ? html`
                    <div class="skill-detail__info-row">
                      <span class="skill-detail__info-label">主页</span>
                      <a class="skill-detail__info-link" href="${skill.homepage}" target="_blank" rel="noreferrer">
                        ${skill.homepage}
                      </a>
                    </div>
                  `
                : nothing}
              <!-- 查看文件内容按钮 -->
              <div class="skill-detail__info-row">
                <span class="skill-detail__info-label">技能文件</span>
                <button class="skill-detail__view-file-btn" @click=${() => props.onPreviewOpen?.(skill.skillKey, skill.name)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  查看 SKILL.md
                </button>
              </div>
            </div>
          </div>

          <!-- API Key 配置 -->
          ${skill.primaryEnv
            ? html`
                <div class="skill-detail__section">
                  <h4 class="skill-detail__section-title">API Key 配置</h4>
                  <div class="skill-detail__apikey">
                    <label class="skill-detail__apikey-label">${skill.primaryEnv}</label>
                    <div class="skill-detail__apikey-row">
                      <input
                        type="password"
                        class="skill-detail__apikey-input"
                        placeholder="输入 API Key"
                        .value=${edit?.apiKey ?? ""}
                        @input=${(e: Event) => props.onSkillApiKeyChange(skill.skillKey, (e.target as HTMLInputElement).value)}
                      />
                      <button
                        class="mc-btn mc-btn--sm primary"
                        ?disabled=${isBusy || !(edit?.apiKey ?? "").trim()}
                        @click=${() => props.onSkillApiKeySave(skill.skillKey)}
                      >
                        保存
                      </button>
                    </div>
                  </div>
                </div>
              `
            : nothing}

          <!-- 白名单设置（仅内置技能） -->
          ${isBundled && props.allowlistMode === "whitelist"
            ? html`
                <div class="skill-detail__section">
                  <h4 class="skill-detail__section-title">白名单</h4>
                  <label class="skill-detail__checkbox">
                    <input
                      type="checkbox"
                      .checked=${inAllowlist}
                      @change=${(e: Event) => {
                        const checked = (e.target as HTMLInputElement).checked;
                        props.onAllowlistToggle(skill.skillKey, checked);
                      }}
                    />
                    <span>加入白名单</span>
                  </label>
                </div>
              `
            : nothing}
        </div>

        <!-- 弹窗底部操作 -->
        <div class="skill-detail__footer">
          <div class="skill-detail__footer-left">
            <!-- 启用/禁用按钮 -->
            <button
              class="mc-btn mc-btn--sm ${skill.disabled ? "" : "mc-btn--danger"}"
              ?disabled=${isBusy}
              @click=${() => props.onSkillToggle(skill.skillKey, skill.disabled)}
            >
              ${isBusy ? "处理中..." : skill.disabled ? "启用技能" : "禁用技能"}
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
          </div>

          <div class="skill-detail__footer-right">
            <!-- 编辑按钮（仅 managed 和 workspace 技能）-->
            ${isEditable
              ? html`
                  <button
                    class="mc-btn mc-btn--sm"
                    ?disabled=${isBusy}
                    @click=${() => props.onEditorOpen(skill.skillKey, skill.name, toShortSource(skill.source) as EditableSkillSource)}
                  >
                    编辑
                  </button>
                  <button
                    class="mc-btn mc-btn--sm mc-btn--danger"
                    ?disabled=${isBusy}
                    @click=${() => props.onDeleteOpen(skill.skillKey, skill.name, toShortSource(skill.source) as EditableSkillSource)}
                  >
                    删除
                  </button>
                `
              : nothing}
          </div>
        </div>
      </div>
    </div>
  `;
}
