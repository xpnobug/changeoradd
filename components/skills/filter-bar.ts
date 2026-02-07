/**
 * 技能筛选栏组件
 * Skills filter bar component
 */
import { html } from "lit";
import type {
  SkillsContentProps,
  SkillSourceFilter,
  SkillStatusFilter,
} from "../../types/skills-config";

/**
 * 渲染筛选栏
 */
export function renderFilterBar(props: SkillsContentProps, total: number, shown: number) {
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
