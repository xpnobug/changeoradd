# OpenClaw 中文配置 UI 模块

> 自包含的中文可视化配置界面，解决配置繁琐和权限安全问题。

## 界面预览

### 页面整体

![页面整体预览](https://fastly.jsdelivr.net/gh/bucketio/img5@main/2026/02/05/1770287825627-a0662bdf-fc2d-4434-be94-9f37bcc91bec.png)

### Agent 配置

| 文件管理 | 工具权限 |
|:---:|:---:|
| ![文件管理](https://fastly.jsdelivr.net/gh/bucketio/img7@main/2026/02/05/1770288023563-0a136e31-afa8-46ed-a360-90023195d433.png) | ![工具权限](https://fastly.jsdelivr.net/gh/bucketio/img4@main/2026/02/05/1770288052621-ffc70ae6-c574-4d13-9b45-8a49066ee777.png) |

| 技能管理 | 定时任务 |
|:---:|:---:|
| ![技能管理](https://fastly.jsdelivr.net/gh/bucketio/img9@main/2026/02/05/1770288079872-4a2246bd-a74e-4e10-81f2-d160a2d80cac.png) | ![定时任务](https://fastly.jsdelivr.net/gh/bucketio/img2@main/2026/02/05/1770288103982-08a3e4f3-87d1-404d-bef1-8aa49c03c1e7.png) |

### 全局配置

| 模型供应商 | 渠道配置 |
|:---:|:---:|
| ![模型供应商](https://fastly.jsdelivr.net/gh/bucketio/img1@main/2026/02/05/1770288142016-060136a6-89e3-4c09-9b25-de480814cb85.png) | ![渠道配置](https://fastly.jsdelivr.net/gh/bucketio/img4@main/2026/02/05/1770288186075-f3671fb7-af41-4c62-baac-124a77766478.png) |

---

## 特性

- **Agent-centric 设计** - 以 Agent 为中心的配置管理
- **完全独立** - 自包含 Web Component，与主项目解耦
- **同步友好** - 同步上游代码时不会产生冲突
- **可视化配置** - 替代手动编辑 JSON 配置文件

## 功能模块

| 模块 | 说明 |
|------|------|
| **Providers** | LLM 提供商和模型管理 |
| **Agent** | 代理默认参数、身份配置、会话管理 |
| **Gateway** | 网关网络设置（端口、绑定、认证） |
| **Channels** | 19+ 消息通道统一配置 |
| **Workspace** | 工作区文件编辑器（SOUL.md、IDENTITY.md 等） |
| **Permissions** | 命令执行权限和工具权限管理 |
| **Skills** | 技能管理和配置 |
| **Cron** | 定时任务管理 |

---

## 目录结构

```
ui-zh-CN/
├── index.ts                    # 统一导出入口
├── openclaw-config-element.ts  # 主 Web Component
├── README.md                   # 本文档
│
├── views/                      # 视图层
│   ├── agents-config.ts        # Agent-centric 主视图
│   └── model-config.ts         # 模型配置视图
│
├── components/                 # UI 组件
│   ├── agent/                  # Agent 相关组件
│   │   ├── agent-overview.ts   # Agent 概览（身份、模型、会话）
│   │   ├── agent-sidebar.ts    # 左侧 Agent 列表
│   │   ├── agent-tabs.ts       # Tab 导航
│   │   ├── agent-header.ts     # Agent 头部信息
│   │   ├── agent-tools.ts      # 工具权限配置
│   │   ├── agent-skills.ts     # 技能管理
│   │   ├── agent-files.ts      # 工作区文件
│   │   ├── agent-channels.ts   # 通道配置
│   │   ├── agent-cron.ts       # 定时任务
│   │   └── index.ts            # 组件导出
│   ├── providers-content.ts    # 供应商配置
│   ├── gateway-content.ts      # 网关配置
│   ├── channels-content.ts     # 通道配置
│   ├── workspace-content.ts    # 工作区文件编辑器
│   ├── permissions-content.ts  # 权限管理
│   ├── skills-content.ts       # 技能管理
│   ├── cron-content.ts         # 定时任务
│   └── agent-content.ts        # Agent 内容
│
├── controllers/                # 控制器层
│   ├── model-config.ts         # 核心控制器（状态管理、API 调用）
│   ├── skills-config.ts        # 技能配置控制器
│   └── workspace.ts            # 工作区文件操作
│
├── types/                      # 类型定义
│   ├── agents-config.ts        # Agent 配置类型
│   ├── channel-config.ts       # 通道配置类型
│   ├── skills-config.ts        # 技能配置类型
│   └── cron-config.ts          # 定时任务类型
│
├── styles/                     # 样式文件
│   ├── index.ts                # 样式导出
│   ├── agents-config.css       # Agent 配置样式
│   └── model-config.css        # 模型配置样式
│
├── utils/                      # 工具函数
│   ├── index.ts                # 工具导出
│   ├── format.ts               # 格式化工具
│   └── presenter.ts            # 数据展示工具
│
├── extensions/                 # 自定义扩展（插件）
│   ├── wechat/                 # 微信通道插件
│   │   ├── index.ts            # 插件入口
│   │   ├── package.json        # 插件配置
│   │   └── src/                # 插件源码
│   └── workspace-editor/       # 工作区编辑器插件
│       ├── index.ts            # 插件入口
│       ├── workspace-files.ts  # 工作区文件操作
│       └── skills-files.ts     # 技能文件操作
│
└── docs/                       # 设计文档
    ├── agent-centric-refactor.md  # Agent-centric 重构设计
    └── integration-guide.md       # 主 UI 集成指南
```

---

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Component 入口                        │
│  openclaw-config-element.ts - 自包含组件，管理所有状态        │
├─────────────────────────────────────────────────────────────┤
│                         View 层                              │
│  views/*.ts - 顶层视图组装                                   │
├─────────────────────────────────────────────────────────────┤
│                      Component 层                            │
│  components/*.ts - UI 组件（纯渲染，无副作用）                │
├─────────────────────────────────────────────────────────────┤
│                     Controller 层                            │
│  controllers/*.ts - 业务逻辑、状态管理、API 调用              │
├─────────────────────────────────────────────────────────────┤
│                       Type 层                                │
│  types/*.ts - 类型定义                                       │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

```
Gateway RPC ──► Controller ──► State ──► View (props) ──► Components
    ▲                                         │
    │                                         ▼
    └──────────── UI Events (callbacks) ◄─────┘
```

### 模块独立性

本模块设计为**完全独立**，与主项目解耦：

```
外部依赖关系：
┌─────────────────────────────────────────────────────────────┐
│  app-render.ts                                              │
│    └── import "../ui-zh-CN"  (统一入口，仅注册 Web Component) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ui-zh-CN/index.ts                                          │
│    └── 导出 Web Component + 类型 + 函数                      │
└─────────────────────────────────────────────────────────────┘
```

**好处**：
- 仅需修改两个文件 navigation.ts，app-render.ts
- 同步上游代码时，只需保留 `ui-zh-CN` 整个目录
- 外部只通过 `import "../ui-zh-CN"` 导入
- 内部可自由重构，不影响外部

---

## 使用方式

### 在主 UI 中集成

详细集成步骤请参考 [集成指南](https://github.com/xpnobug/openclaw/blob/ui-zh-CN/ui/src/ui-zh-CN/docs/integration-guide.md)。

#### 快速配置清单

| 文件 | 配置项 |
|------|--------|
| `navigation.ts` | `TAB_GROUPS` - 添加到 Settings 分组 |
| `navigation.ts` | `Tab` 类型 - 添加 `"model-config"` |
| `navigation.ts` | `TAB_PATHS` - 路径映射 `/model-config` |
| `navigation.ts` | `iconForTab()` - 图标 `"brain"` |
| `navigation.ts` | `titleForTab()` - 标题 `"可视化配置"` |
| `navigation.ts` | `subtitleForTab()` - 副标题描述 |
| `app-render.ts` | 导入 `import "../ui-zh-CN"` |
| `app-render.ts` | 渲染 `<openclaw-config-zh>` 组件 |

### 在 HTML 中使用

```html
<openclaw-config-zh
  .client=${gatewayClient}
  .connected=${isConnected}
></openclaw-config-zh>
```

### 组件属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `.client` | `GatewayBrowserClient` | Gateway RPC 客户端实例 |
| `.connected` | `boolean` | 与 Gateway 的连接状态 |

### 事件监听

```typescript
// 会话导航事件
element.addEventListener('session-navigate', (e) => {
  const { sessionKey } = e.detail;
  // 跳转到对应会话
});

// 通道导航事件
element.addEventListener('navigate-channels', () => {
  // 跳转到通道配置页面
});
```

| 事件 | Detail 类型 | 说明 |
|------|-------------|------|
| `session-navigate` | `{ sessionKey: string }` | 请求跳转到指定会话 |
| `navigate-channels` | - | 请求跳转到 Channels 页面 |

---

## 扩展管理

自定义扩展存放在 `extensions/` 目录，通过符号链接与根目录 `extensions/` 关联：

```
extensions/wechat -> ../ui/src/ui-zh-CN/extensions/wechat
extensions/workspace-editor -> ../ui/src/ui-zh-CN/extensions/workspace-editor
```

### 添加新扩展

1. 在 `ui-zh-CN/extensions/` 创建扩展目录
2. 在根目录 `extensions/` 创建符号链接：
   ```bash
   ln -s ../ui/src/ui-zh-CN/extensions/your-extension extensions/your-extension
   ```

---

## 同步上游代码

### 1. 配置上游仓库

```bash
# 查看远程仓库
git remote -v

# 添加上游仓库（如果没有）
git remote add upstream https://github.com/openclaw/openclaw.git
```

### 2. 获取并合并更新

```bash
# 获取上游最新代码
git fetch upstream

# 合并到当前分支
git merge upstream/main

# 解决冲突（如有）后提交
git add .
git commit -m "merge: 合并 upstream/main 更新"

# 推送到远程
git push
```

### 3. 冲突解决

如果出现冲突：

```bash
# 查看冲突文件
git diff --name-only --diff-filter=U

# 编辑冲突文件，解决 <<<<<<<、=======、>>>>>>> 标记
# 然后标记已解决
git add <冲突文件>
git commit -m "merge: 解决合并冲突"
```

---

## 技术栈

| 技术 | 用途 |
|------|------|
| **Lit** | Web Components 框架 |
| **TypeScript** | 类型系统 |
| **Vite** | 构建工具 |
| **WebSocket RPC** | 与 Gateway 通信 |

---

## Gateway RPC 方法

| 方法 | 说明 |
|------|------|
| `config.get` | 获取完整配置快照 |
| `config.set` | 保存配置 |
| `config.apply` | 保存并应用配置 |
| `agents.list` | 获取 Agent 列表 |
| `sessions.list` | 获取会话列表 |
| `sessions.patch` | 更新会话配置 |
| `cron.list` | 获取定时任务列表 |
| `cron.add` | 添加定时任务 |
| `cron.update` | 更新定时任务 |
| `cron.remove` | 删除定时任务 |
| `exec.approvals.get` | 获取执行权限配置 |
| `exec.approvals.set` | 保存执行权限配置 |
| `workspace.files.list` | 获取工作区文件列表 |
| `workspace.file.read` | 读取工作区文件 |
| `workspace.file.write` | 写入工作区文件 |
| `skills.files.list` | 获取技能文件列表 |
| `skills.file.read` | 读取技能文件 |
| `skills.file.write` | 写入技能文件 |

---

## 安全特性

### 分层安全模型

```
┌─────────────────────────────────────────┐
│  第一层：UI 访问控制                      │
│  - Gateway 认证（token/password）        │
│  - 绑定模式限制（loopback/LAN）           │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│  第二层：命令执行权限                      │
│  - deny/allowlist/full 安全模式          │
│  - 用户确认机制                          │
│  - Agent 级别配置                        │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│  第三层：工具权限                         │
│  - 预设档案（最小权限原则）                │
│  - 分组控制                              │
│  - 单工具禁用                            │
└─────────────────────────────────────────┘
```

### 关键安全特性

- **默认拒绝策略**：命令执行默认被拒绝
- **白名单机制**：只有明确允许的命令才能执行
- **用户确认**：支持每次执行前提示确认
- **工作区文件白名单**：仅允许访问预定义的文件
- **敏感信息保护**：API Key、Token 使用密码字段
- **乐观并发控制**：使用 baseHash 防止并发冲突

---

## 开发指南

### 添加新的配置区域

1. 在 `types/` 中添加类型定义
2. 创建 `components/xxx-content.ts` 组件
3. 在 `views/agents-config.ts` 中添加路由
4. 在 `controllers/` 中添加数据处理逻辑

### 添加新的消息通道

1. 在 `types/channel-config.ts` 中添加通道配置类型
2. 在 `components/channels-content.ts` 的 `CHANNEL_METADATA` 中添加元数据

### 添加新的工作区文件

1. 在 `extensions/workspace-editor/workspace-files.ts` 的白名单中添加文件名
2. 文件将自动出现在工作区编辑器中

---
 
感兴趣可以加群探讨
![c39d018cc57b95c7a9bc8a61a6e6f956](https://github.com/user-attachments/assets/4b0e6772-fadc-4a5c-a759-96fe006fb118)
