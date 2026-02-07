/**
 * 供应商配置内容组件 - 主入口
 * Provider config content component - Main entry
 */
import { html } from "lit";
import type { ProvidersContentProps } from "./types";
import { icons, LABELS } from "./constants";
import { renderProviderCard } from "./provider-card";
import { renderAddProviderModal } from "./add-modal";

/**
 * 渲染供应商配置内容
 * Render providers content
 */
export function renderProvidersContent(props: ProvidersContentProps) {
  const providerKeys = Object.keys(props.providers);
  const onShowAddModal = props.onShowAddModal ?? (() => {});

  // 兼容旧逻辑：如果没有提供 onShowAddModal，则直接调用 onProviderAdd
  const handleAddClick = () => {
    if (props.onShowAddModal) {
      onShowAddModal(true);
    } else {
      props.onProviderAdd();
    }
  };

  return html`
    <div class="config-content">
      <div class="config-content__header">
        <div class="config-content__icon">${icons.provider}</div>
        <div class="config-content__titles">
          <h2 class="config-content__title">${LABELS.providersTitle}</h2>
          <p class="config-content__desc">${LABELS.providersDesc}</p>
        </div>
        <button class="mc-btn mc-btn--primary" @click=${handleAddClick}>
          ${icons.add}
          <span>${LABELS.addProvider}</span>
        </button>
      </div>

      <!-- 字段说明提示卡 -->
      <details class="cron-tip-card cron-tip-card--collapsible">
        <summary class="cron-tip-card__title">
          ${icons.info}
          <span>配置说明</span>
          ${icons.chevron}
        </summary>
        <div class="cron-tip-card__content">
          <div class="cron-tip-card__section">
            <div class="cron-tip-card__section-title">供应商配置</div>
            <table class="cron-tip-card__table">
              <tr>
                <td class="cron-tip-card__term">API 地址</td>
                <td class="cron-tip-card__def">供应商的 API 端点 URL，如 <b>https://api.openai.com/v1</b></td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">API 协议</td>
                <td class="cron-tip-card__def">选择 API 格式：<b>OpenAI</b>（大多数兼容）、<b>Anthropic</b>、<b>Google</b>、<b>Bedrock</b> 等</td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">认证方式</td>
                <td class="cron-tip-card__def"><b>API Key</b>（标准密钥）、<b>AWS SDK</b>（IAM 凭证）、<b>OAuth</b>、<b>Token</b></td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">API 密钥</td>
                <td class="cron-tip-card__def">填入密钥或使用 <b>\${ENV_VAR}</b> 引用环境变量</td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">自定义 Headers</td>
                <td class="cron-tip-card__def">可选，添加额外请求头（如 <b>x-api-version</b>）</td>
              </tr>
            </table>
          </div>
          <div class="cron-tip-card__section">
            <div class="cron-tip-card__section-title">模型配置</div>
            <table class="cron-tip-card__table">
              <tr>
                <td class="cron-tip-card__term">模型 ID</td>
                <td class="cron-tip-card__def">发送给 API 的模型标识符，如 <b>gpt-4o</b>、<b>claude-3-opus</b></td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">显示名称</td>
                <td class="cron-tip-card__def">在 UI 中展示的友好名称</td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">上下文窗口</td>
                <td class="cron-tip-card__def">模型支持的最大上下文长度（tokens）</td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">最大输出</td>
                <td class="cron-tip-card__def">单次请求的最大输出 tokens 数</td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">输入类型</td>
                <td class="cron-tip-card__def">模型支持的输入：<b>文本</b>（必选）、<b>图片</b>（多模态）</td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">推理模型</td>
                <td class="cron-tip-card__def">启用后支持 reasoning effort 参数（如 o1/o3 系列）</td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">成本配置</td>
                <td class="cron-tip-card__def">每百万 tokens 的价格（输入/输出/缓存读/缓存写）</td>
              </tr>
              <tr>
                <td class="cron-tip-card__term">兼容性</td>
                <td class="cron-tip-card__def">API 特性支持：Store、Developer Role、max_tokens 字段名</td>
              </tr>
            </table>
          </div>
        </div>
      </details>

      <div class="config-content__body">
        ${providerKeys.length === 0
          ? html`<div class="mc-empty">${LABELS.noProviders}</div>`
          : html`
              <div class="mc-providers-grid">
                ${providerKeys.map((key) =>
                  renderProviderCard(
                    key,
                    props.providers[key],
                    props.expandedProviders.has(key),
                    props,
                  ),
                )}
              </div>
            `}
      </div>

      <!-- 添加供应商弹窗 -->
      ${renderAddProviderModal(props)}
    </div>
  `;
}
