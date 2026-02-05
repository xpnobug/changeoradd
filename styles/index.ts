/**
 * Agents Config 样式导出
 * 将 CSS 文件转换为 Lit CSSResult
 */
import { css, unsafeCSS } from "lit";
import agentsConfigCss from "./agents-config.css?inline";

export const agentsConfigStyles = unsafeCSS(agentsConfigCss);
