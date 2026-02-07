/**
 * 权限管理内容组件
 * Permissions content component - main entry
 */
import { html } from "lit";
import type { PermissionsContentProps } from "./types";
import { renderExecPermissionsContent } from "./exec-permissions";
import { renderToolsPermissionsSection } from "./tools-permissions";

// 重新导出类型供外部使用
export type {
  PermissionsContentProps,
  ExecSecurity,
  ExecAsk,
  ExecApprovalsDefaults,
  ExecApprovalsAllowlistEntry,
  ExecApprovalsAgent,
  ExecApprovalsFile,
  ExecApprovalsSnapshot,
  AgentOption,
} from "./types";

/**
 * 渲染权限管理内容
 */
export function renderPermissionsContent(props: PermissionsContentProps) {
  return html`
    <div class="permissions-content">
      <!-- 顶部标签切换 -->
      <div class="permissions-tabs-header">
        <button
          class="permissions-main-tab ${props.activeTab === "exec" ? "permissions-main-tab--active" : ""}"
          @click=${() => props.onTabChange("exec")}
        >
          <span class="permissions-main-tab__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
          </span>
          <span class="permissions-main-tab__text">命令执行权限</span>
        </button>
        <button
          class="permissions-main-tab ${props.activeTab === "tools" ? "permissions-main-tab--active" : ""}"
          @click=${() => props.onTabChange("tools")}
        >
          <span class="permissions-main-tab__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </span>
          <span class="permissions-main-tab__text">工具权限</span>
        </button>
      </div>

      <!-- 内容区域 -->
      ${props.activeTab === "exec"
        ? renderExecPermissionsContent(props)
        : renderToolsPermissionsSection(props)}
    </div>
  `;
}
