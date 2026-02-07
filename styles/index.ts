/**
 * Agents Config 样式导出
 * 将 CSS 文件转换为 Lit CSSResult
 */
import { unsafeCSS } from "lit";
import agentsConfigCss from "./agents-config.css?inline";
import mobileCss from "./mobile.css?inline";

export const agentsConfigStyles = unsafeCSS(agentsConfigCss);
export const mobileStyles = unsafeCSS(mobileCss);
