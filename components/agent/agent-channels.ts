/**
 * Agent 通道类型定义
 * Agent channel type definitions
 */

// ─────────────────────────────────────────────────────────────────────────────
// 类型定义 / Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 通道状态类型
 * Channel status type
 */
export type ChannelStatus = {
  id: string;
  type: string;
  name: string;
  status: "connected" | "disconnected" | "error" | "pending";
  lastActivity?: string;
  error?: string;
};
