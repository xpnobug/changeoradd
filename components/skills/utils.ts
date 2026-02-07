/**
 * 技能管理辅助函数
 * Skills management utility functions
 */
import { html } from "lit";
import type {
  SkillStatusEntry,
  SkillSourceFilter,
  SkillStatusFilter,
  SkillGroup,
  EditableSkillSource,
} from "../../types/skills-config";

/**
 * 按来源分组技能
 */
export function groupSkillsBySource(skills: SkillStatusEntry[]): SkillGroup[] {
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
export function filterSkills(
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
export function toShortSource(source: string): EditableSkillSource | null {
  if (source === "openclaw-managed") return "managed";
  if (source === "openclaw-workspace") return "workspace";
  return null;
}

/**
 * 截断文本
 */
export function clampText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * 高亮搜索文本
 * Highlight search text in content
 */
export function highlightText(text: string, query: string): ReturnType<typeof html> {
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
 * 技能统计类型
 */
export type SkillStats = {
  total: number;
  eligible: number;
  blocked: number;
  disabled: number;
  bundled: number;
  managed: number;
  workspace: number;
};

/**
 * 计算技能统计
 * Calculate skill statistics
 */
export function calculateStats(skills: SkillStatusEntry[]): SkillStats {
  return {
    total: skills.length,
    eligible: skills.filter((s) => s.eligible).length,
    blocked: skills.filter((s) => !s.eligible && !s.disabled).length,
    disabled: skills.filter((s) => s.disabled).length,
    bundled: skills.filter((s) => s.source === "openclaw-bundled").length,
    managed: skills.filter((s) => s.source === "openclaw-managed").length,
    workspace: skills.filter((s) => s.source === "openclaw-workspace").length,
  };
}
