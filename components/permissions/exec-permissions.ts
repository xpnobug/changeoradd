/**
 * 命令执行权限组件
 * Exec permissions components
 */
import { html, nothing } from "lit";
import type {
  PermissionsContentProps,
  ExecApprovalsFile,
  ExecApprovalsAgent,
  ExecApprovalsAllowlistEntry,
  ExecSecurity,
} from "./types";
import {
  EXEC_APPROVALS_DEFAULT_SCOPE,
  SECURITY_OPTIONS,
  ASK_OPTIONS,
} from "./constants";
import { resolveDefaults, formatAgo } from "./utils";

/**
 * 渲染执行目标选择器
 */
export function renderExecTargetSection(props: PermissionsContentProps) {
  const isGateway = props.execTarget === "gateway";
  const hasNodes = props.execTargetNodes.length > 0;

  return html`
    <div class="permissions-section permissions-target-section">
      <div class="permissions-section__header">
        <div>
          <h4 class="permissions-section__title">执行目标</h4>
          <p class="permissions-section__desc">
            选择要配置的执行目标：本地网关或远程节点。
          </p>
        </div>
      </div>

      <div class="permissions-target">
        <!-- 目标类型选择 -->
        <div class="permissions-target__type">
          <label class="permissions-target__label">目标类型</label>
          <div class="permissions-target__options">
            <label class="permissions-radio">
              <input
                type="radio"
                name="exec-target"
                value="gateway"
                .checked=${isGateway}
                @change=${() => {
                  if (props.dirty) {
                    const confirmed = confirm("有未保存的更改，切换目标将丢失这些更改。是否继续？");
                    if (!confirmed) return;
                  }
                  props.onExecTargetChange("gateway", null);
                }}
              />
              <span class="permissions-radio__mark"></span>
              <span class="permissions-radio__text">本地网关</span>
            </label>
            <label class="permissions-radio">
              <input
                type="radio"
                name="exec-target"
                value="node"
                .checked=${!isGateway}
                ?disabled=${!hasNodes}
                @change=${() => {
                  if (props.dirty) {
                    const confirmed = confirm("有未保存的更改，切换目标将丢失这些更改。是否继续？");
                    if (!confirmed) return;
                  }
                  const firstNode = props.execTargetNodes[0]?.id ?? null;
                  props.onExecTargetChange("node", firstNode);
                }}
              />
              <span class="permissions-radio__mark"></span>
              <span class="permissions-radio__text">远程节点</span>
              ${!hasNodes ? html`<span class="permissions-radio__hint">（无可用节点）</span>` : nothing}
            </label>
          </div>
        </div>

        <!-- 节点选择（仅在远程节点模式下显示） -->
        ${!isGateway
          ? html`
              <div class="permissions-target__node">
                <label class="permissions-target__label">选择节点</label>
                <select
                  class="permissions-select"
                  ?disabled=${props.saving || !hasNodes}
                  @change=${(event: Event) => {
                    const target = event.target as HTMLSelectElement;
                    const nodeId = target.value || null;
                    if (props.dirty) {
                      const confirmed = confirm("有未保存的更改，切换节点将丢失这些更改。是否继续？");
                      if (!confirmed) {
                        target.value = props.execTargetNodeId ?? "";
                        return;
                      }
                    }
                    props.onExecTargetChange("node", nodeId);
                  }}
                >
                  ${props.execTargetNodes.map(
                    (node) =>
                      html`<option value=${node.id} ?selected=${props.execTargetNodeId === node.id}>
                        ${node.label}
                      </option>`,
                  )}
                </select>
              </div>
            `
          : nothing}

        <!-- 目标说明 -->
        <div class="permissions-target__info">
          ${isGateway
            ? html`
                <div class="permissions-info-box">
                  <span class="permissions-info-box__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </span>
                  <span class="permissions-info-box__text">
                    <strong>本地网关</strong>：配置在本机执行命令的权限。所有通过此网关执行的命令都将受此配置控制。
                  </span>
                </div>
              `
            : html`
                <div class="permissions-info-box">
                  <span class="permissions-info-box__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </span>
                  <span class="permissions-info-box__text">
                    <strong>远程节点</strong>：配置在远程设备执行命令的权限。选择的节点必须支持 exec approvals 功能。
                  </span>
                </div>
              `}
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染命令执行权限内容
 */
export function renderExecPermissionsContent(props: PermissionsContentProps) {
  const form = props.execApprovalsForm ?? props.execApprovalsSnapshot?.file ?? null;
  const ready = Boolean(form);
  const defaults = resolveDefaults(form);
  const selectedScope = props.selectedAgent ?? EXEC_APPROVALS_DEFAULT_SCOPE;
  const isDefaults = selectedScope === EXEC_APPROVALS_DEFAULT_SCOPE;

  return html`
    <!-- 头部说明 -->
    <div class="permissions-header">
      <h3 class="permissions-title">命令执行权限</h3>
      <p class="permissions-desc">
        配置命令执行的安全策略、用户确认方式和允许列表。这些设置控制 Agent 执行系统命令的权限。
      </p>
    </div>

    <!-- 目标选择器 -->
    ${renderExecTargetSection(props)}

    ${!ready
      ? html`
          <div class="permissions-empty">
            ${props.loading
              ? html`<p>正在加载权限配置...</p>`
              : html`<p>权限配置加载中，请稍候...</p>`}
          </div>
        `
      : html`
          <!-- Agent 选择器 -->
          ${renderAgentSelector(props, selectedScope)}

          <!-- 策略配置 -->
          ${renderPolicySection(props, form, defaults, selectedScope, isDefaults)}

          <!-- 允许列表（仅非默认 Agent 显示） -->
          ${!isDefaults ? renderAllowlistSection(props, form, selectedScope) : nothing}
        `}
  `;
}

/**
 * 渲染 Agent 选择器
 */
function renderAgentSelector(props: PermissionsContentProps, selectedScope: string) {
  const form = props.execApprovalsForm ?? props.execApprovalsSnapshot?.file ?? null;
  const hasWildcard = form?.agents?.["*"] != null;
  const isWildcardSelected = selectedScope === "*";

  return html`
    <div class="permissions-section">
      <div class="permissions-section__header">
        <div>
          <h4 class="permissions-section__title">作用域</h4>
          <p class="permissions-section__desc">选择要配置的 Agent，或配置全局默认设置。</p>
        </div>
        <div class="permissions-section__actions">
          ${!hasWildcard
            ? html`
                <button
                  class="mc-btn mc-btn--sm"
                  ?disabled=${props.saving}
                  @click=${() => props.onAddAgent("*")}
                  title="添加通配符规则，匹配所有 Agent"
                >
                  + 通配符 (*)
                </button>
              `
            : nothing}
          <button
            class="mc-btn mc-btn--sm"
            ?disabled=${props.saving}
            @click=${() => {
              const id = prompt("请输入 Agent ID:");
              if (id?.trim()) {
                props.onAddAgent(id.trim());
              }
            }}
          >
            + 新建 Agent
          </button>
        </div>
      </div>
      <div class="permissions-tabs">
        <button
          class="permissions-tab ${selectedScope === EXEC_APPROVALS_DEFAULT_SCOPE ? "permissions-tab--active" : ""}"
          @click=${() => props.onSelectAgent(null)}
        >
          全局默认
        </button>
        ${hasWildcard
          ? html`
              <button
                class="permissions-tab permissions-tab--wildcard ${isWildcardSelected ? "permissions-tab--active" : ""}"
                @click=${() => props.onSelectAgent("*")}
              >
                * 通配符
                <span class="permissions-tab__badge">匹配所有</span>
              </button>
            `
          : nothing}
        ${props.agents
          .filter((agent) => agent.id !== "*")
          .map((agent) => {
            const label = agent.name?.trim() ? `${agent.name} (${agent.id})` : agent.id;
            const isActive = selectedScope === agent.id;
            const hasConfig = form?.agents?.[agent.id] != null;
            return html`
              <button
                class="permissions-tab ${isActive ? "permissions-tab--active" : ""}"
                @click=${() => props.onSelectAgent(agent.id)}
              >
                ${label}
                ${agent.isDefault ? html`<span class="permissions-tab__badge">默认</span>` : nothing}
                ${hasConfig && !agent.isDefault
                  ? html`<span class="permissions-tab__badge permissions-tab__badge--config">已配置</span>`
                  : nothing}
              </button>
            `;
          })}
      </div>
    </div>
  `;
}

/**
 * 渲染策略配置
 */
function renderPolicySection(
  props: PermissionsContentProps,
  form: ExecApprovalsFile | null,
  defaults: ReturnType<typeof resolveDefaults>,
  selectedScope: string,
  isDefaults: boolean,
) {
  const agent = !isDefaults
    ? ((form?.agents ?? {})[selectedScope] as Record<string, unknown> | undefined) ?? {}
    : {};
  const basePath = isDefaults ? ["defaults"] : ["agents", selectedScope];

  const agentSecurity = typeof agent.security === "string" ? agent.security : undefined;
  const agentAsk = typeof agent.ask === "string" ? agent.ask : undefined;
  const agentAskFallback = typeof agent.askFallback === "string" ? agent.askFallback : undefined;

  const securityValue = isDefaults ? defaults.security : agentSecurity ?? "__default__";
  const askValue = isDefaults ? defaults.ask : agentAsk ?? "__default__";
  const askFallbackValue = isDefaults ? defaults.askFallback : agentAskFallback ?? "__default__";

  const autoOverride = typeof agent.autoAllowSkills === "boolean" ? agent.autoAllowSkills : undefined;
  const autoEffective = autoOverride ?? defaults.autoAllowSkills;
  const autoIsDefault = autoOverride == null;

  // 判断是否可以删除此 Agent 配置
  const hasAgentConfig = !isDefaults && form?.agents?.[selectedScope] != null;
  const isWildcard = selectedScope === "*";

  return html`
    <div class="permissions-section">
      <div class="permissions-section__header">
        <div>
          <h4 class="permissions-section__title">安全策略</h4>
          <p class="permissions-section__desc">
            ${isDefaults
              ? "配置全局默认的安全策略。"
              : isWildcard
                ? "配置通配符规则，匹配所有未单独配置的 Agent。"
                : `配置 ${selectedScope} Agent 的安全策略。`}
          </p>
        </div>
        ${hasAgentConfig
          ? html`
              <button
                class="mc-btn mc-btn--sm mc-btn--danger"
                ?disabled=${props.saving}
                @click=${() => {
                  if (confirm(`确定要删除 ${isWildcard ? "通配符" : selectedScope} 的配置吗？`)) {
                    props.onRemoveAgent(selectedScope);
                  }
                }}
              >
                删除配置
              </button>
            `
          : nothing}
      </div>

      <div class="permissions-policy-grid">
        <!-- 安全模式 -->
        <div class="permissions-policy-item">
          <div class="permissions-policy-item__header">
            <span class="permissions-policy-item__title">安全模式</span>
            <span class="permissions-policy-item__desc">
              ${isDefaults ? "默认的安全级别。" : `默认: ${defaults.security}`}
            </span>
          </div>
          <select
            class="permissions-select"
            ?disabled=${props.saving}
            @change=${(event: Event) => {
              const target = event.target as HTMLSelectElement;
              const value = target.value;
              if (!isDefaults && value === "__default__") {
                props.onRemove([...basePath, "security"]);
              } else {
                props.onPatch([...basePath, "security"], value);
              }
            }}
          >
            ${!isDefaults
              ? html`<option value="__default__" ?selected=${securityValue === "__default__"}>
                  使用默认 (${defaults.security})
                </option>`
              : nothing}
            ${SECURITY_OPTIONS.map(
              (option) =>
                html`<option value=${option.value} ?selected=${securityValue === option.value}>
                  ${option.label} - ${option.description}
                </option>`,
            )}
          </select>
        </div>

        <!-- 用户确认 -->
        <div class="permissions-policy-item">
          <div class="permissions-policy-item__header">
            <span class="permissions-policy-item__title">用户确认</span>
            <span class="permissions-policy-item__desc">
              ${isDefaults ? "何时提示用户确认。" : `默认: ${defaults.ask}`}
            </span>
          </div>
          <select
            class="permissions-select"
            ?disabled=${props.saving}
            @change=${(event: Event) => {
              const target = event.target as HTMLSelectElement;
              const value = target.value;
              if (!isDefaults && value === "__default__") {
                props.onRemove([...basePath, "ask"]);
              } else {
                props.onPatch([...basePath, "ask"], value);
              }
            }}
          >
            ${!isDefaults
              ? html`<option value="__default__" ?selected=${askValue === "__default__"}>
                  使用默认 (${defaults.ask})
                </option>`
              : nothing}
            ${ASK_OPTIONS.map(
              (option) =>
                html`<option value=${option.value} ?selected=${askValue === option.value}>
                  ${option.label} - ${option.description}
                </option>`,
            )}
          </select>
        </div>

        <!-- 确认失败回退 -->
        <div class="permissions-policy-item">
          <div class="permissions-policy-item__header">
            <span class="permissions-policy-item__title">确认失败回退</span>
            <span class="permissions-policy-item__desc">
              ${isDefaults ? "UI 确认不可用时的处理方式。" : `默认: ${defaults.askFallback}`}
            </span>
          </div>
          <select
            class="permissions-select"
            ?disabled=${props.saving}
            @change=${(event: Event) => {
              const target = event.target as HTMLSelectElement;
              const value = target.value;
              if (!isDefaults && value === "__default__") {
                props.onRemove([...basePath, "askFallback"]);
              } else {
                props.onPatch([...basePath, "askFallback"], value);
              }
            }}
          >
            ${!isDefaults
              ? html`<option value="__default__" ?selected=${askFallbackValue === "__default__"}>
                  使用默认 (${defaults.askFallback})
                </option>`
              : nothing}
            ${SECURITY_OPTIONS.map(
              (option) =>
                html`<option value=${option.value} ?selected=${askFallbackValue === option.value}>
                  ${option.label}
                </option>`,
            )}
          </select>
        </div>

        <!-- 自动允许技能 CLI -->
        <div class="permissions-policy-item">
          <div class="permissions-policy-item__header">
            <span class="permissions-policy-item__title">自动允许技能 CLI</span>
            <span class="permissions-policy-item__desc">
              ${isDefaults
                ? "自动允许 Gateway 注册的技能可执行文件。"
                : autoIsDefault
                  ? `使用默认 (${defaults.autoAllowSkills ? "开启" : "关闭"})`
                  : `覆盖 (${autoEffective ? "开启" : "关闭"})`}
            </span>
          </div>
          <div class="permissions-checkbox-row">
            <label class="permissions-checkbox">
              <input
                type="checkbox"
                ?disabled=${props.saving}
                .checked=${autoEffective}
                @change=${(event: Event) => {
                  const target = event.target as HTMLInputElement;
                  props.onPatch([...basePath, "autoAllowSkills"], target.checked);
                }}
              />
              <span>启用</span>
            </label>
            ${!isDefaults && !autoIsDefault
              ? html`
                  <button
                    class="mc-btn mc-btn--sm"
                    ?disabled=${props.saving}
                    @click=${() => props.onRemove([...basePath, "autoAllowSkills"])}
                  >
                    使用默认
                  </button>
                `
              : nothing}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染允许列表
 */
function renderAllowlistSection(
  props: PermissionsContentProps,
  form: ExecApprovalsFile | null,
  selectedScope: string,
) {
  const agent = (form?.agents ?? {})[selectedScope] as ExecApprovalsAgent | undefined;
  const allowlist = Array.isArray(agent?.allowlist) ? agent.allowlist : [];

  return html`
    <div class="permissions-section">
      <div class="permissions-section__header">
        <div>
          <h4 class="permissions-section__title">命令允许列表</h4>
          <p class="permissions-section__desc">
            配置允许执行的命令模式。使用 glob 模式匹配命令（不区分大小写）。
          </p>
        </div>
        <button
          class="mc-btn mc-btn--sm"
          ?disabled=${props.saving}
          @click=${() => props.onAddAllowlistEntry(selectedScope)}
        >
          添加规则
        </button>
      </div>

      <div class="permissions-allowlist">
        ${allowlist.length === 0
          ? html`
              <div class="permissions-allowlist__empty">
                <p>暂无允许列表规则。</p>
                <p class="muted">点击"添加规则"来添加允许执行的命令模式。</p>
              </div>
            `
          : allowlist.map((entry, index) =>
              renderAllowlistEntry(props, entry, selectedScope, index),
            )}
      </div>
    </div>
  `;
}

/**
 * 渲染允许列表条目
 */
function renderAllowlistEntry(
  props: PermissionsContentProps,
  entry: ExecApprovalsAllowlistEntry,
  selectedScope: string,
  index: number,
) {
  const lastUsed = formatAgo(entry.lastUsedAt);
  const pattern = entry.pattern?.trim() || "";

  return html`
    <div class="permissions-allowlist__item">
      <div class="permissions-allowlist__item-main">
        <div class="permissions-allowlist__item-pattern">
          <input
            type="text"
            class="permissions-input"
            placeholder="例如: git *, npm run *, /usr/bin/*"
            .value=${pattern}
            ?disabled=${props.saving}
            @input=${(event: Event) => {
              const target = event.target as HTMLInputElement;
              props.onPatch(
                ["agents", selectedScope, "allowlist", index, "pattern"],
                target.value,
              );
            }}
          />
        </div>
        <div class="permissions-allowlist__item-meta">
          <span class="muted">最后使用: ${lastUsed}</span>
          ${entry.lastUsedCommand
            ? html`<span class="mono muted" title=${entry.lastUsedCommand}>
                ${entry.lastUsedCommand.length > 50
                  ? entry.lastUsedCommand.slice(0, 50) + "..."
                  : entry.lastUsedCommand}
              </span>`
            : nothing}
        </div>
      </div>
      <div class="permissions-allowlist__item-actions">
        <button
          class="mc-btn mc-btn--sm mc-btn--danger"
          ?disabled=${props.saving}
          @click=${() => props.onRemoveAllowlistEntry(selectedScope, index)}
        >
          删除
        </button>
      </div>
    </div>
  `;
}
