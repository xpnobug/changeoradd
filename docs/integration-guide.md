# ui-zh-CN 集成指南

本文档记录如何将 `ui-zh-CN` 模块集成到主 UI 中。

## 导航配置

### 1. `ui/src/ui/navigation.ts`

#### TAB_GROUPS（第 3-11 行）

将 `model-config` 添加到 Settings 分组：

```typescript
export const TAB_GROUPS = [
  { label: "Chat", tabs: ["chat"] },
  {
    label: "Control",
    tabs: ["overview", "channels", "instances", "sessions", "cron"],
  },
  { label: "Agent", tabs: ["agents", "skills", "nodes"] },
  { label: "Settings", tabs: ["model-config", "config", "debug", "logs"] },  // <-- 添加 model-config
] as const;
```

#### Tab 类型（第 13-26 行）

```typescript
export type Tab =
  | "agents"
  | "overview"
  | "channels"
  | "instances"
  | "sessions"
  | "cron"
  | "skills"
  | "nodes"
  | "chat"
  | "model-config"  // <-- 添加
  | "config"
  | "debug"
  | "logs";
```

#### TAB_PATHS（第 28-42 行）

```typescript
const TAB_PATHS: Record<Tab, string> = {
  agents: "/agents",
  overview: "/overview",
  channels: "/channels",
  instances: "/instances",
  sessions: "/sessions",
  cron: "/cron",
  skills: "/skills",
  nodes: "/nodes",
  chat: "/chat",
  "model-config": "/model-config",  // <-- 添加
  config: "/config",
  debug: "/debug",
  logs: "/logs",
};
```

#### iconForTab（第 125-156 行）

```typescript
export function iconForTab(tab: Tab): IconName {
  switch (tab) {
    // ... 其他 case
    case "model-config":
      return "brain";  // <-- 添加
    // ...
  }
}
```

#### titleForTab（第 158-189 行）

```typescript
export function titleForTab(tab: Tab) {
  switch (tab) {
    // ... 其他 case
    case "model-config":
      return "可视化配置";  // <-- 添加
    // ...
  }
}
```

#### subtitleForTab（第 191-222 行）

```typescript
export function subtitleForTab(tab: Tab) {
  switch (tab) {
    // ... 其他 case
    case "model-config":
      return "可视化管理模型供应商、Agent 默认设置和网关配置";  // <-- 添加
    // ...
  }
}
```

---

## 渲染配置

### 2. `ui/src/ui/app-render.ts`

#### 导入组件（第 71-73 行）

```typescript
// 导入 ui-zh-CN 自包含组件（统一入口）
// Import ui-zh-CN self-contained component (unified entry)
import "../ui-zh-CN";
```

#### 渲染组件（第 998-1018 行）

```typescript
${state.tab === "model-config" ? html`
  <openclaw-config-zh
    .client=${state.client}
    .connected=${state.connected}
    @session-navigate=${(e: CustomEvent<{ sessionKey: string }>) => {
      state.sessionKey = e.detail.sessionKey;
      state.chatMessage = "";
      (state as unknown as OpenClawApp).resetToolStream();
      (state as unknown as OpenClawApp).applySettings({
        ...state.settings,
        sessionKey: e.detail.sessionKey,
        lastActiveSessionKey: e.detail.sessionKey,
      });
      void (state as unknown as OpenClawApp).loadAssistantIdentity();
      (state as unknown as OpenClawApp).setTab("chat");
    }}
    @navigate-channels=${() => {
      (state as unknown as OpenClawApp).setTab("channels");
    }}
  ></openclaw-config-zh>
` : nothing}
```

---

## 组件接口

### 属性（Properties）

| 属性 | 类型 | 说明 |
|------|------|------|
| `.client` | `GatewayBrowserClient` | Gateway RPC 客户端实例 |
| `.connected` | `boolean` | 与 Gateway 的连接状态 |

### 事件（Events）

| 事件 | Detail 类型 | 说明 |
|------|-------------|------|
| `session-navigate` | `{ sessionKey: string }` | 请求跳转到指定会话的 Chat 页面 |
| `navigate-channels` | - | 请求跳转到 Channels 配置页面 |

---

## 配置清单

| 文件 | 位置 | 配置项 | 值 |
|------|------|--------|-----|
| `navigation.ts` | 第 10 行 | `TAB_GROUPS` | Settings 分组 |
| `navigation.ts` | 第 23 行 | `Tab` 类型 | `"model-config"` |
| `navigation.ts` | 第 38 行 | `TAB_PATHS` | `/model-config` |
| `navigation.ts` | 第 145-146 行 | `iconForTab()` | `"brain"` |
| `navigation.ts` | 第 178-179 行 | `titleForTab()` | `"可视化配置"` |
| `navigation.ts` | 第 211-212 行 | `subtitleForTab()` | 副标题描述 |
| `app-render.ts` | 第 71-73 行 | 导入语句 | `import "../ui-zh-CN"` |
| `app-render.ts` | 第 998-1018 行 | 组件渲染 | `<openclaw-config-zh>` |

---

## 注意事项

1. **统一入口**：只需导入 `../ui-zh-CN`，组件会自动注册
2. **自包含设计**：`ui-zh-CN` 模块内部管理自己的状态和数据加载
3. **事件通信**：通过自定义事件与主 UI 通信，保持解耦
4. **同步友好**：同步上游代码时，只需保留这些配置点
