# Agent 列表 UI 改进分析

## 当前实现分析

### 文件位置
- 组件: `components/agent/agent-sidebar.ts`
- 样式: `styles/agents-config.css` (第 120-390 行)
- 类型: `AgentSidebarProps` (第 33-47 行)

### 现有功能
- Agent 列表展示 (名称、ID、emoji 头像)
- 默认 Agent 标记
- 设为默认操作
- 刷新按钮
- 全局配置入口
- 底部连接状态

---

## 改进方案

### 1. 状态指示器

**问题**: 无法直观看到 Agent 运行状态

**方案**: 在头像右下角添加状态点

```typescript
// agent-sidebar.ts - renderAgentRow 函数
type AgentStatus = "online" | "offline" | "error" | "idle";

function renderStatusDot(status: AgentStatus) {
  const statusClass = `agents-sidebar__status-indicator--${status}`;
  return html`<span class="agents-sidebar__status-indicator ${statusClass}"></span>`;
}
```

```css
/* agents-config.css */
.agents-sidebar__avatar {
  position: relative;
}

.agents-sidebar__status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-accent);
}

.agents-sidebar__status-indicator--online { background: var(--ok); }
.agents-sidebar__status-indicator--offline { background: var(--muted); }
.agents-sidebar__status-indicator--error { background: var(--danger); }
.agents-sidebar__status-indicator--idle { background: var(--warning); }
```

**Props 变更**:
```typescript
type AgentSidebarProps = {
  // ... existing
  agentStatusById?: Record<string, AgentStatus>;
};
```

---

### 2. 快捷操作菜单

**问题**: 只有"设为默认"一个操作，hover 才显示

**方案**: 添加更多操作 + 下拉菜单

```typescript
// 新增操作
const agentActions = [
  { id: "setDefault", label: "设为默认", icon: icons.star },
  { id: "duplicate", label: "复制配置", icon: icons.copy },
  { id: "export", label: "导出", icon: icons.download },
  { id: "delete", label: "删除", icon: icons.trash, danger: true },
];

function renderAgentActions(agentId: string, isDefault: boolean) {
  return html`
    <div class="agents-sidebar__actions">
      <button class="agents-sidebar__action-btn" @click=${(e) => toggleMenu(e, agentId)}>
        <svg>...</svg>
      </button>
      <!-- 下拉菜单通过 popover 或绝对定位实现 -->
    </div>
  `;
}
```

**交互**:
- 点击三点图标显示菜单
- 菜单外点击关闭
- 删除操作需二次确认

---

### 3. 搜索与筛选

**问题**: Agent 多时难以快速定位

**方案**: 添加搜索框 + 筛选标签

```typescript
// Props 新增
type AgentSidebarProps = {
  // ... existing
  searchQuery?: string;
  filterStatus?: AgentStatus | "all";
  onSearchChange?: (query: string) => void;
  onFilterChange?: (status: AgentStatus | "all") => void;
};

function renderSearchBar(props: AgentSidebarProps) {
  return html`
    <div class="agents-sidebar__search">
      <input
        type="text"
        class="agents-sidebar__search-input"
        placeholder="搜索 Agent..."
        .value=${props.searchQuery ?? ""}
        @input=${(e) => props.onSearchChange?.(e.target.value)}
      />
      ${props.searchQuery ? html`
        <button class="agents-sidebar__search-clear" @click=${() => props.onSearchChange?.("")}>
          ×
        </button>
      ` : nothing}
    </div>
  `;
}
```

```css
.agents-sidebar__search {
  padding: 0 12px 12px;
  position: relative;
}

.agents-sidebar__search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  font-size: 13px;
}

.agents-sidebar__search-input:focus {
  border-color: var(--accent);
  outline: none;
}

.agents-sidebar__search-clear {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
}
```

---

### 4. 分组显示

**问题**: 所有 Agent 平铺，无层次感

**方案**: 按类型/标签分组

```typescript
type AgentGroup = {
  id: string;
  label: string;
  agents: string[]; // agent IDs
  collapsed?: boolean;
};

// Props 新增
type AgentSidebarProps = {
  // ... existing
  groups?: AgentGroup[];
  onToggleGroup?: (groupId: string) => void;
};

function renderAgentGroup(group: AgentGroup, agents: Agent[], props: AgentSidebarProps) {
  const groupAgents = agents.filter(a => group.agents.includes(a.id));
  if (groupAgents.length === 0) return nothing;

  return html`
    <div class="agents-sidebar__group">
      <button
        class="agents-sidebar__group-header"
        @click=${() => props.onToggleGroup?.(group.id)}
      >
        <span class="agents-sidebar__group-chevron ${group.collapsed ? '' : 'agents-sidebar__group-chevron--open'}">
          ▶
        </span>
        <span class="agents-sidebar__group-label">${group.label}</span>
        <span class="agents-sidebar__group-count">${groupAgents.length}</span>
      </button>
      ${group.collapsed ? nothing : html`
        <div class="agents-sidebar__group-items">
          ${groupAgents.map(agent => renderAgentRow({ ... }))}
        </div>
      `}
    </div>
  `;
}
```

```css
.agents-sidebar__group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
}

.agents-sidebar__group-chevron {
  font-size: 8px;
  transition: transform 0.15s;
}

.agents-sidebar__group-chevron--open {
  transform: rotate(90deg);
}

.agents-sidebar__group-count {
  margin-left: auto;
  padding: 2px 6px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
}
```

---

## 实现优先级

| 优先级 | 功能 | 复杂度 | 影响 |
|--------|------|--------|------|
| P0 | 状态指示器 | 低 | 高 |
| P1 | 搜索功能 | 中 | 高 |
| P2 | 快捷操作 | 中 | 中 |
| P3 | 分组显示 | 高 | 中 |

---

## 数据依赖

### 状态指示器
需要后端提供 Agent 运行状态 API:
```typescript
// 可能的 API 响应
type AgentStatusResponse = {
  agentId: string;
  status: "online" | "offline" | "error" | "idle";
  lastActive?: string; // ISO timestamp
  errorMessage?: string;
};
```

### 分组显示
需要配置存储:
```typescript
// 用户自定义分组配置
type AgentGroupsConfig = {
  groups: AgentGroup[];
  ungroupedLabel?: string;
};
```

---

## 文件变更清单

1. `components/agent/agent-sidebar.ts`
   - 添加搜索/筛选渲染函数
   - 添加状态指示器
   - 添加分组渲染逻辑
   - 扩展 Props 类型

2. `styles/agents-config.css`
   - 添加搜索框样式
   - 添加状态指示器样式
   - 添加分组样式
   - 添加操作菜单样式

3. `styles/mobile.css`
   - 响应式适配

4. `types/agents-config.ts`
   - 添加新的类型定义
   - 添加 LABELS 条目
