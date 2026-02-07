/**
 * 技能统计摘要组件
 * Skills statistics bar component
 */
import { html } from "lit";
import type { SkillStats } from "./utils";

/**
 * 渲染技能统计摘要
 */
export function renderStatsBar(stats: SkillStats) {
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
