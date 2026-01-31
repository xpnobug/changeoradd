/**
 * 配置侧边栏组件
 * Config sidebar component
 *
 * 左侧导航菜单，用于切换不同的配置区块
 * Left navigation menu for switching between config sections
 */
import { html, nothing } from "lit";
import type { ConfigSection } from "../types/config-sections";

// SVG 图标 / Icons
const icons = {
  provider: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  agent: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path><circle cx="8" cy="14" r="1"></circle><circle cx="16" cy="14" r="1"></circle></svg>`,
  gateway: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  channel: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  settings: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  permissions: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>`,
  // 工作区/文件夹图标 / Workspace/folder icon
  workspace: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  // 技能图标 (闪电) / Skills icon (zap/lightning)
  skills: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
};

// 配置区块定义 / Config sections definition
export const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: "providers",
    label: "模型供应商",
    icon: "provider",
    description: "配置 LLM 模型供应商",
  },
  {
    id: "agent",
    label: "Agent 设置",
    icon: "agent",
    description: "Agent 默认参数",
  },
  {
    id: "workspace",
    label: "工作区文件",
    icon: "workspace",
    description: "提示词和身份文件",
  },
  {
    id: "gateway",
    label: "Gateway 设置",
    icon: "gateway",
    description: "网关端口和认证",
  },
  {
    id: "channels",
    label: "通道配置",
    icon: "channel",
    description: "消息通道设置",
  },
  {
    id: "permissions",
    label: "权限管理",
    icon: "permissions",
    description: "命令执行和访问权限",
  },
  {
    id: "skills",
    label: "技能管理",
    icon: "skills",
    description: "管理技能白名单和配置",
  },
];

function getIcon(iconName: string) {
  return icons[iconName as keyof typeof icons] ?? icons.settings;
}

export type ConfigSidebarProps = {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  hasChanges?: boolean;
  connected?: boolean;
};

/**
 * 渲染配置侧边栏
 */
export function renderConfigSidebar(props: ConfigSidebarProps) {
  return html`
    <aside class="config-sidebar">
      <div class="config-sidebar__header">
        <h2 class="config-sidebar__title">配置管理</h2>
        ${props.hasChanges
          ? html`<span class="config-sidebar__badge">未保存</span>`
          : nothing}
      </div>
      <nav class="config-sidebar__nav">
        ${CONFIG_SECTIONS.map((section) => {
          const isActive = props.activeSection === section.id;
          return html`
            <button
              class="config-sidebar__item ${isActive ? "config-sidebar__item--active" : ""}"
              @click=${() => props.onSectionChange(section.id)}
              title=${section.description}
            >
              <span class="config-sidebar__item-icon">${getIcon(section.icon)}</span>
              <span class="config-sidebar__item-content">
                <span class="config-sidebar__item-label">${section.label}</span>
                <span class="config-sidebar__item-desc">${section.description}</span>
              </span>
            </button>
          `;
        })}
      </nav>
      <div class="config-sidebar__footer">
        <div class="config-sidebar__status">
          <span class="config-sidebar__status-dot ${props.connected ? "config-sidebar__status-dot--ok" : ""}"></span>
          <span class="config-sidebar__status-text">
            ${props.connected ? "已连接" : "未连接"}
          </span>
        </div>
      </div>
    </aside>
  `;
}
