项目主要解决 moltbot（clawdbot） 配置繁琐，权限安全问题，提供了可视化配置页面，持续更新。

1. Providers - LLM 提供商和模型管理
2. Agent - 代理默认参数和会话模型覆盖
3. Gateway - 网关网络设置（端口、绑定、认证）
4. Channels - 19+ 消息通道统一配置
5. Workspace - 工作区文件编辑器（SOUL.md、IDENTITY.md 等）
6. Permissions - 命令执行权限和工具权限管理

---

## 一、目录结构


因为 moltbot 每天都在更新，不想建分支了，本目录用于存放前端修改，避免与主仓库的文件产生冲突。

更新方式 暂存本地更改，拉取后恢复
```git
git stash # 暂存本地更改
git pull origin main # 拉取远程更新
git stash pop # 恢复本地更改（可能需要手动解决冲突）
```


```
changeoradd/
├── README.md                              # 模块说明文档
├── INTEGRATION.md                         # 集成点记录文档
├── views/                                 # 视图层
│   └── model-config.ts                   # 顶层视图，组装侧边栏和内容区域
├── controllers/                           # 控制器层
│   ├── model-config.ts                   # 核心控制器（1700+ 行，40+ 导出函数）
│   └── workspace.ts                      # 工作区文件操作辅助
├── components/                            # UI 组件
│   ├── config-sidebar.ts                 # 左侧导航栏（6 个配置区域）
│   ├── providers-content.ts              # LLM 提供商管理
│   ├── agent-content.ts                  # 代理默认参数 + 会话模型管理
│   ├── gateway-content.ts                # 网关网络设置
│   ├── channels-content.ts               # 消息通道配置（19+ 通道）
│   ├── workspace-content.ts              # 工作区启动文件编辑器
│   └── permissions-content.ts            # 命令执行权限 + 工具权限
├── types/                                 # 类型定义
│   ├── config-sections.ts                # 配置区域类型
│   └── channel-config.ts                 # 通道配置类型（19+ 通道定义）
└── docs/                                  # 设计文档
    ├── ANALYSIS-permissions.md           # 权限功能分析
    └── DESIGN-provider-rename.md         # 供应商重命名设计方案
```

---

## 二、架构设计

### 2.1 分层架构

模块采用 MVC 分层架构：

```
┌─────────────────────────────────────────────────────────────┐
│                         View 层                              │
│  views/model-config.ts - 顶层视图组装                        │
├─────────────────────────────────────────────────────────────┤
│                      Component 层                            │
│  components/*.ts - UI 组件（纯渲染，无副作用）                 │
├─────────────────────────────────────────────────────────────┤
│                     Controller 层                            │
│  controllers/model-config.ts - 业务逻辑、状态管理、API 调用    │
├─────────────────────────────────────────────────────────────┤
│                       Type 层                                │
│  types/*.ts - 类型定义                                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
Gateway RPC ──► Controller ──► State ──► View (props) ──► Components
    ▲                                         │
    │                                         ▼
    └──────────── UI Events (callbacks) ◄─────┘
```

1. **加载阶段**：Controller 通过 Gateway RPC 获取配置
2. **渲染阶段**：State 作为 props 传递给 View，Components 渲染 UI
3. **交互阶段**：UI 事件触发 callbacks，修改 Controller state
4. **保存阶段**：Controller 构建更新，发送到 Gateway

---

## 三、功能模块说明

### 3.1 Providers（提供商管理）


![](https://fastly.jsdelivr.net/gh/bucketio/img14@main/2026/01/30/1769739854704-11fe00ba-4faf-469e-b276-9a0a7f1f1bb8.png)

**文件**：`components/providers-content.ts`

**功能**：管理 LLM 模型提供商和模型配置。

**核心能力**：
- 添加/删除/重命名提供商
- 配置提供商 Base URL 和 API Key
- 选择 API 协议（OpenAI 兼容 / Anthropic 协议）
- 添加/删除模型
- 配置模型参数：上下文窗口、最大 tokens、推理能力

**数据结构**：
```typescript
interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  api: "openai-completions" | "anthropic-messages";
  models: ModelConfig[];
}

interface ModelConfig {
  id: string;
  name: string;
  reasoning: boolean;
  contextWindow: number;
  maxTokens: number;
  input?: string[];      // 支持的输入类型
  cost?: { input: number; output: number };
}
```

**解决的问题**：
- 避免手动编辑 JSON 配置文件
- 提供表单校验，防止无效配置
- 可视化展示模型参数，便于对比和调整

---


### 3.2 Agent（代理设置）


![](https://fastly.jsdelivr.net/gh/bucketio/img7@main/2026/01/30/1769739910169-a2a59d26-dba2-48a5-b698-5992ce03ec3b.png)


**文件**：`components/agent-content.ts`

**功能**：配置代理运行时默认值和会话级模型覆盖。

**代理默认值配置**：

| 字段 | 说明 | 示例值 |
|------|------|--------|
| model.primary | 主模型选择 | `modelscope/qwen-max` |
| maxConcurrent | 最大并发请求数 | 5 |
| subagents.maxConcurrent | 子代理并发数 | 3 |
| workspace | 工作空间目录 | `~/workspace` |
| contextPruning.mode | 上下文裁剪模式 | `cache-ttl` / `token-limit` |
| compaction.mode | 压缩模式 | `safeguard` / `aggressive` |

**会话模型管理**：
- 查看所有活跃会话
- 为每个会话单独设置模型覆盖
- 显示最后更新时间
- 点击会话名称可跳转到对应聊天

**API 调用**：
- `sessions.list` - 获取会话列表
- `sessions.patch` - 更新会话模型覆盖

---

### 3.3 Gateway（网关配置）


![](https://fastly.jsdelivr.net/gh/bucketio/img17@main/2026/01/30/1769740158099-b9932a50-3046-4be8-af71-afe7cbeb0d23.png)


**文件**：`components/gateway-content.ts`

**功能**：配置网关网络设置。

**配置项**：

| 字段 | 说明 | 选项 |
|------|------|------|
| port | 端口号 | 1-65535 |
| bind | 绑定模式 | loopback / LAN / auto |
| auth.mode | 认证模式 | token / password / none |
| auth.token | 认证凭据 | 字符串 |

**安全性考虑**：
- 默认绑定 loopback，仅本机可访问
- 支持 token 认证，防止未授权访问
- UI 隐藏敏感信息（密码字段使用 password 类型）

---

### 3.4 Channels（通道配置）

![](https://fastly.jsdelivr.net/gh/bucketio/img6@main/2026/01/30/1769739948515-cbda86e3-289a-41c6-8c17-3339fa11566e.png)

**文件**：`components/channels-content.ts`、`types/channel-config.ts`

**功能**：支持 19+ 消息通道的可视化配置。

**支持的通道**：

| 类型 | 通道列表 |
|------|----------|
| 内置通道 | Telegram, Discord, Slack, WhatsApp, Signal, Google Chat, iMessage, MS Teams |
| 扩展通道 | WeChat, Matrix, Mattermost, Nostr, LINE, Twitch, BlueBubbles, Zalo, Nextcloud Talk, Tlon |

**每个通道的通用配置**：
- `enabled` - 启用/禁用开关
- `dmPolicy` - DM 访问策略（pairing / allowlist / open / disabled）
- `groupPolicy` - 群组访问策略（open / disabled / allowlist）
- `allowFrom` / `groupAllowFrom` - 允许列表
- `historyLimit` / `dmHistoryLimit` - 历史记录限制
- `mediaMaxMb` - 媒体大小限制

**特定通道配置示例（Telegram）**：
```typescript
interface TelegramChannelConfig {
  botToken?: string;
  tokenFile?: string;
  streamMode?: "off" | "partial" | "block";
  chunkMode?: "length" | "newline";
  reactionNotifications?: "off" | "own" | "all" | "allowlist";
}
```

**解决的问题**：
- 统一管理 19+ 通道配置，避免分散在多个配置文件
- 字段级别的校验和说明
- 敏感信息（token、secret）使用密码字段

---

### 3.5 Workspace（工作区文件）

![](https://fastly.jsdelivr.net/gh/bucketio/img4@main/2026/01/30/1769739977362-785d8a48-1241-4df0-8ac7-14400192a473.png)

**文件**：`components/workspace-content.ts`、`controllers/workspace.ts`

**功能**：可视化编辑代理工作区的启动文件。

**支持的文件（白名单）**：

| 文件名 | 用途 |
|--------|------|
| SOUL.md | Agent 灵魂/核心人格定义 |
| IDENTITY.md | Agent 身份信息 |
| TOOLS.md | Agent 工具说明 |
| USER.md | 用户信息 |
| HEARTBEAT.md | 心跳/定时任务配置 |
| BOOTSTRAP.md | 启动配置 |
| MEMORY.md / memory.md | 记忆文件 |
| AGENTS.md | 多 Agent 配置 |

**编辑器功能**：
- 三种模式切换：编辑 / 预览 / 分屏
- Markdown 实时预览（使用安全的 iframe srcdoc 渲染）
- 未保存更改提示（文件名旁显示红点）
- 文件不存在时自动创建

**API 调用**：
- `workspace.files.list` - 获取工作区文件列表
- `workspace.file.read` - 读取文件内容
- `workspace.file.write` - 写入文件内容

**安全性**：
- 仅允许访问白名单内的文件
- 防止路径遍历攻击（文件名校验）
- 通过 Gateway RPC 进行文件操作（不直接访问文件系统）

---

### 3.6 Permissions（权限管理）

**文件**：`components/permissions-content.ts`、`docs/ANALYSIS-permissions.md`

**功能**：双标签页权限管理系统，包括命令执行权限和工具权限。

#### 3.6.1 命令执行权限（Exec Tab）

![](https://fastly.jsdelivr.net/gh/bucketio/img0@main/2026/01/30/1769740071716-0ef49eb2-2dd8-41b2-af6c-151d287f0d56.png)


**目标选择**：
- 本地网关：配置在本机执行命令的权限
- 远程节点：配置在远程设备（如树莓派）执行命令的权限

**作用域配置**：
- 全局默认：应用于所有 Agent 的默认策略
- 通配符 (*)：匹配所有未单独配置的 Agent
- 特定 Agent：为指定 Agent 配置独立策略

**安全策略配置**：

| 配置项 | 选项 | 说明 |
|--------|------|------|
| security | deny / allowlist / full | 安全模式 |
| ask | off / on-miss / always | 用户确认方式 |
| askFallback | deny / allowlist / full | UI 不可用时的回退策略 |
| autoAllowSkills | true / false | 自动允许技能 CLI |

**允许列表**：
- 使用 glob 模式匹配命令（如 `git *`、`npm run *`）
- 显示最后使用时间和命令
- 支持添加/删除规则

**数据结构**：
```typescript
interface ExecApprovalsFile {
  version: number;
  defaults?: ExecApprovalsDefaults;
  agents?: Record<string, ExecApprovalsAgent>;
}

interface ExecApprovalsAgent {
  security?: "deny" | "allowlist" | "full";
  ask?: "off" | "on-miss" | "always";
  askFallback?: "deny" | "allowlist" | "full";
  autoAllowSkills?: boolean;
  allowlist?: ExecAllowlistEntry[];
}
```

#### 3.6.2 工具权限（Tools Tab）

![](https://fastly.jsdelivr.net/gh/bucketio/img11@main/2026/01/30/1769740023072-45c45c88-5198-435b-8382-7178450f3ca8.png)
**预设配置档案**：

| 档案 | 说明 |
|------|------|
| minimal | 仅 session_status |
| coding | 文件+运行时+会话+记忆+image |
| messaging | 消息+部分会话工具 |
| full | 所有工具 |

**工具分组**：

| 分组 | 工具列表 |
|------|----------|
| group:fs | read, write, edit, apply_patch |
| group:runtime | exec, process |
| group:web | web_search, web_fetch |
| group:ui | browser, canvas |
| group:sessions | sessions_list, sessions_history, sessions_send, sessions_spawn, session_status |
| group:memory | memory_search, memory_get |
| group:automation | cron, gateway |
| group:messaging | message |
| group:nodes | nodes |

**独立工具**：tts, image, agents_list

**权限控制方式**：
- 按分组批量启用/禁用
- 单独控制每个工具
- 支持全局配置和 Agent 级别覆盖

---

## 四、如何解决权限安全问题

### 4.1 分层安全模型

模块实现了三层安全控制：

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
│  - 通配符和 Agent 级别配置                │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│  第三层：工具权限                         │
│  - 预设档案（最小权限原则）                │
│  - 分组控制                              │
│  - 单工具禁用                            │
└─────────────────────────────────────────┘
```

### 4.2 关键安全特性

**命令执行安全**：

1. **默认拒绝策略**：`security` 默认值为 `deny`，所有命令默认被拒绝
2. **白名单机制**：`allowlist` 模式下，只有明确允许的命令才能执行
3. **用户确认**：`ask` 配置允许每次执行前提示用户确认
4. **回退策略**：UI 不可用时，`askFallback` 控制是否执行

**工具权限安全**：

1. **最小权限原则**：默认使用 `minimal` 档案
2. **分组隔离**：不同功能分组独立控制
3. **deny 列表**：可以明确禁用特定工具或分组

**工作区文件安全**：

1. **白名单文件**：仅允许访问预定义的文件列表
2. **路径校验**：防止路径遍历攻击
3. **RPC 代理**：所有文件操作通过 Gateway RPC，不直接访问文件系统

**敏感信息保护**：

1. **密码字段**：API Key、Token 等使用 password 类型输入
2. **数据脱敏**：`exec.approvals.get` 返回时自动移除 `socket.token`
3. **配置隔离**：权限配置与主配置分离存储

### 4.3 乐观并发控制

配置更新使用 `baseHash` 机制防止并发冲突：

```typescript
// 保存时携带 baseHash
await client.request("config.set", {
  raw: configContent,
  baseHash: state.modelConfigHash,  // 加载时获取的 hash
});

// 权限配置同样使用 baseHash
await client.request("exec.approvals.set", {
  file: permissionsConfig,
  baseHash: state.execApprovalsSnapshot.hash,
});
```

---

## 五、如何解决配置复杂性问题

### 5.1 可视化配置界面

**传统方式的问题**：
- 需要手动编辑 JSON/YAML 配置文件
- 容易出现语法错误
- 字段含义不清楚
- 需要查阅文档了解可选值

**解决方案**：

1. **表单化配置**：所有配置项转换为表单字段
2. **下拉选择**：枚举类型使用 select 组件
3. **开关控制**：布尔值使用 toggle 组件
4. **实时校验**：输入时即时校验格式

### 5.2 分区导航

将复杂配置分为 6 个独立区域：

```
┌─────────────────┬───────────────────────────────────────────┐
│   Config        │                                           │
│   Sidebar       │         [Dynamic Content Section]         │
│                 │                                           │
│   ○ Providers   │   当前选中区域的配置表单                    │
│   ○ Agent       │                                           │
│   ○ Gateway     │   - 表单字段                               │
│   ○ Channels    │   - 下拉选择                               │
│   ○ Workspace   │   - 开关控制                               │
│   ○ Permissions │                                           │
│                 │                                           │
└─────────────────┴───────────────────────────────────────────┘
```

用户可以专注于当前关心的配置区域，不被其他配置干扰。

### 5.3 层级配置简化

**传统 JSON 配置**：
```json
{
  "models": {
    "providers": {
      "openai": {
        "baseUrl": "https://api.openai.com/v1",
        "apiKey": "sk-xxx",
        "api": "openai-completions",
        "models": [...]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "openai/gpt-4" },
      "maxConcurrent": 5
    }
  }
}
```

**UI 简化后**：
- Providers 区域：直接编辑提供商配置
- Agent 区域：直接选择主模型、设置并发数
- 无需了解 JSON 嵌套结构

### 5.4 配置继承与覆盖

**问题**：不同 Agent 可能需要不同的配置，但大部分配置相同。

**解决方案**：

1. **全局默认**：配置 `defaults` 作为基础
2. **通配符 (*)**：匹配所有未单独配置的 Agent
3. **特定 Agent**：仅配置需要覆盖的字段

UI 清晰展示继承关系：
```
安全模式: [使用默认 (deny) ▼]
用户确认: [使用默认 (on-miss) ▼]
```

### 5.5 变更检测与保存

**问题**：配置修改后容易忘记保存，或不清楚哪些修改了。

**解决方案**：

1. **实时变更检测**：`hasModelConfigChanges()` 比较当前值与原始值
2. **未保存提示**：标题栏显示未保存标记
3. **保存/应用分离**：
    - Save：仅保存配置，不重启服务
    - Apply：保存并重启相关服务

### 5.6 通道配置统一管理

**问题**：19+ 通道配置分散，每个通道字段不同。

**解决方案**：

1. **元数据驱动**：每个通道定义 `ChannelMeta`，包含：
    - 通道 ID、标签、图标、描述
    - 配置字段定义（类型、选项、验证规则）

2. **动态表单生成**：根据元数据自动生成配置表单

```typescript
const CHANNEL_METADATA: ChannelMeta[] = [
  {
    id: "telegram",
    label: "Telegram",
    icon: "send",
    description: "Telegram Bot 消息通道",
    configFields: [
      { key: "botToken", label: "Bot Token", type: "password", required: true },
      { key: "streamMode", label: "流式模式", type: "select", options: [...] },
      // ...
    ],
  },
  // ...
];
```

### 5.7 工作区文件编辑

**问题**：
- 需要 SSH 或文件管理器访问服务器
- 不同文件用途不清楚
- 编辑后需要手动确认格式

**解决方案**：

1. **内置编辑器**：直接在 UI 中编辑
2. **文件说明**：每个文件旁显示用途描述
3. **Markdown 预览**：支持编辑/预览/分屏模式
4. **自动创建**：文件不存在时保存后自动创建

---

## 六、技术实现细节

### 6.1 技术栈

- **UI 框架**：Lit (Web Components)
- **构建工具**：Vite
- **类型系统**：TypeScript
- **通信协议**：WebSocket RPC

### 6.2 状态管理

使用 Lit 的 `@state()` 装饰器管理组件状态：

```typescript
@state() modelConfigLoading = false;
@state() modelConfigProviders: Record<string, ProviderConfig> = {};
@state() permissionsDirty = false;
// ...
```

### 6.3 Gateway RPC 方法

| 方法 | 说明 |
|------|------|
| `config.get` | 获取完整配置快照 |
| `config.set` | 保存配置（不重启服务） |
| `config.apply` | 保存并应用配置（重启相关服务） |
| `sessions.list` | 获取会话列表 |
| `sessions.patch` | 更新会话模型覆盖 |
| `exec.approvals.get` | 获取本地网关执行权限配置 |
| `exec.approvals.set` | 保存本地网关执行权限配置 |
| `exec.approvals.node.get` | 获取远程节点执行权限配置 |
| `exec.approvals.node.set` | 保存远程节点执行权限配置 |
| `workspace.files.list` | 获取工作区文件列表 |
| `workspace.file.read` | 读取工作区文件内容 |
| `workspace.file.write` | 写入工作区文件内容 |

---

## 七、扩展指南

### 7.1 添加新的配置区域

1. 在 `types/config-sections.ts` 中添加新的 `ConfigSectionId`
2. 创建新的 content 组件 `components/xxx-content.ts`
3. 在 `views/model-config.ts` 的 `renderContentSection()` 中添加路由
4. 在 `config-sidebar.ts` 的 `SECTIONS` 中添加导航项
5. 在 `controllers/model-config.ts` 中添加数据提取和保存逻辑

### 7.2 添加新的消息通道

1. 在 `types/channel-config.ts` 中添加通道配置类型
2. 在 `components/channels-content.ts` 的 `CHANNEL_METADATA` 中添加元数据
3. 定义字段 schema（支持 toggle、text、password、number、select、array 类型）

### 7.3 添加新的工作区文件

1. 在 Gateway 后端的 `ALLOWED_FILES` 白名单中添加文件名
2. 文件将自动出现在工作区编辑器的文件列表中

---

## 八、总结

**权限安全**：
1. 分层安全模型（网关认证 -> 命令执行权限 -> 工具权限）
2. 默认拒绝策略 + 白名单机制
3. 用户确认机制
4. 工作区文件白名单
5. 敏感信息保护
6. 乐观并发控制

**配置简化**：
1. 可视化表单替代 JSON 编辑
2. 分区导航聚焦配置
3. 层级配置继承与覆盖
4. 实时变更检测
5. 通道配置统一管理
6. 内置 Markdown 编辑器

---

感兴趣可以加群探讨
![c39d018cc57b95c7a9bc8a61a6e6f956](https://github.com/user-attachments/assets/4b0e6772-fadc-4a5c-a759-96fe006fb118)
