/**
 * 权限管理类型定义
 * Permissions management type definitions
 */
import type {
  ToolProfileId,
  ToolPolicyConfig,
  ToolsConfig,
  AgentWithTools,
  PermissionsTabId,
  ExecApprovalsTarget,
  ExecApprovalsTargetNode,
} from "../../controllers/model-config";

// ─── Exec Approvals 类型 ────────────────────────────────────────────────────

export type ExecSecurity = "deny" | "allowlist" | "full";
export type ExecAsk = "off" | "on-miss" | "always";

export type ExecApprovalsDefaults = {
  security?: string;
  ask?: string;
  askFallback?: string;
  autoAllowSkills?: boolean;
};

export type ExecApprovalsAllowlistEntry = {
  id?: string;
  pattern: string;
  lastUsedAt?: number;
  lastUsedCommand?: string;
  lastResolvedPath?: string;
};

export type ExecApprovalsAgent = ExecApprovalsDefaults & {
  allowlist?: ExecApprovalsAllowlistEntry[];
};

export type ExecApprovalsFile = {
  version?: number;
  socket?: { path?: string };
  defaults?: ExecApprovalsDefaults;
  agents?: Record<string, ExecApprovalsAgent>;
};

export type ExecApprovalsSnapshot = {
  path: string;
  exists: boolean;
  hash: string;
  file: ExecApprovalsFile;
};

// ─── 通用类型 ───────────────────────────────────────────────────────────────

export type AgentOption = {
  id: string;
  name?: string;
  isDefault?: boolean;
};

// ─── Props 类型 ─────────────────────────────────────────────────────────────

export type PermissionsContentProps = {
  // 加载状态
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  connected: boolean;

  // 标签页状态
  activeTab: PermissionsTabId;
  onTabChange: (tab: PermissionsTabId) => void;

  // Exec Approvals 目标选择
  execTarget: ExecApprovalsTarget;
  execTargetNodeId: string | null;
  execTargetNodes: ExecApprovalsTargetNode[];
  onExecTargetChange: (target: ExecApprovalsTarget, nodeId: string | null) => void;

  // Exec Approvals 数据
  execApprovalsSnapshot: ExecApprovalsSnapshot | null;
  execApprovalsForm: ExecApprovalsFile | null;
  selectedAgent: string | null;
  agents: AgentOption[];

  // 回调函数
  onLoad: () => void;
  onSave: () => void;
  onSelectAgent: (agentId: string | null) => void;
  onAddAgent: (agentId: string) => void;
  onRemoveAgent: (agentId: string) => void;
  onPatch: (path: Array<string | number>, value: unknown) => void;
  onRemove: (path: Array<string | number>) => void;
  onAddAllowlistEntry: (agentId: string) => void;
  onRemoveAllowlistEntry: (agentId: string, index: number) => void;

  // 工具权限数据
  toolsConfig: ToolsConfig | null;
  agentToolsConfigs: AgentWithTools[];
  toolsAgents: AgentOption[];
  toolsSelectedAgent: string | null;
  toolsExpanded: boolean;

  // 工具权限回调
  onToolsSelectAgent: (agentId: string | null) => void;
  onToolsToggleExpanded: () => void;
  onToolsUpdateGlobal: (field: keyof ToolPolicyConfig, value: unknown) => void;
  onToolsUpdateAgent: (agentId: string, field: keyof ToolPolicyConfig, value: unknown) => void;
  onToolsAddGlobalDeny: (entry: string) => void;
  onToolsRemoveGlobalDeny: (entry: string) => void;
  onToolsAddAgentDeny: (agentId: string, entry: string) => void;
  onToolsRemoveAgentDeny: (agentId: string, entry: string) => void;
  onToolsToggleDeny: (tool: string, denied: boolean) => void;
};

// ─── 重新导出依赖类型 ───────────────────────────────────────────────────────

export type {
  ToolProfileId,
  ToolPolicyConfig,
  ToolsConfig,
  AgentWithTools,
  PermissionsTabId,
  ExecApprovalsTarget,
  ExecApprovalsTargetNode,
};
