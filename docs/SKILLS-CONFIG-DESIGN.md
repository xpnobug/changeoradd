# Skills 可视化配置设计文档

## 一、系统分析

### 1.1 Skills 数据模型

```typescript
// 技能来源
type SkillSource =
  | "openclaw-bundled"  // 内置技能 (54个)
  | "managed"           // ~/.clawdbot/skills/
  | "workspace";        // <workspace>/skills/

// 技能状态条目
type SkillStatusEntry = {
  name: string;              // 技能名称
  description: string;       // 描述
  source: SkillSource;       // 来源
  filePath: string;          // SKILL.md 路径
  baseDir: string;           // 技能目录
  skillKey: string;          // 配置键
  primaryEnv?: string;       // 主环境变量
  emoji?: string;            // 图标
  homepage?: string;         // 主页链接
  always: boolean;           // 始终启用
  disabled: boolean;         // 已禁用
  blockedByAllowlist: boolean; // 被白名单阻止
  eligible: boolean;         // 是否可用
  requirements: {            // 需求条件
    bins: string[];
    anyBins: string[];
    env: string[];
    config: string[];
    os: string[];
  };
  missing: {                 // 缺失项
    bins: string[];
    anyBins: string[];
    env: string[];
    config: string[];
    os: string[];
  };
  install: SkillInstallOption[];  // 安装选项
};

// 配置结构 (openclaw.json)
type SkillsConfig = {
  allowBundled?: string[];   // 内置技能白名单
  load?: {
    extraDirs?: string[];    // 额外技能目录
    watch?: boolean;         // 文件监视
    watchDebounceMs?: number;
  };
  install?: {
    preferBrew?: boolean;
    nodeManager?: "npm" | "pnpm" | "yarn" | "bun";
  };
  entries?: Record<string, {
    enabled?: boolean;
    apiKey?: string;
    env?: Record<string, string>;
    config?: Record<string, unknown>;
  }>;
};
```

### 1.2 现有 UI 能力 (skills 标签页)

| 功能 | 支持 | 说明 |
|------|------|------|
| 查看技能列表 | ✅ | 展示所有技能状态 |
| 启用/禁用技能 | ✅ | 修改 entries.*.enabled |
| 保存 API Key | ✅ | 修改 entries.*.apiKey |
| 安装依赖 | ✅ | 调用 skills.install RPC |
| 搜索过滤 | ✅ | 按名称/描述筛选 |
| allowBundled 管理 | ❌ | **需要新增** |
| extraDirs 管理 | ❌ | **需要新增** |
| 安装偏好设置 | ❌ | **需要新增** |
| SKILL.md 编辑 | ❌ | **需要新增** |
| 环境变量管理 | ❌ | **需要新增** |

### 1.3 Gateway RPC API

| 方法 | 参数 | 说明 |
|------|------|------|
| `skills.status` | `{}` | 获取技能状态报告 |
| `skills.update` | `{ skillKey, enabled?, apiKey? }` | 更新技能配置 |
| `skills.install` | `{ name, installId, timeoutMs? }` | 安装技能依赖 |

---

## 二、可视化管理设计

### 2.1 整体架构

在 changeoradd 模块中新增 **skills** 区块，与现有区块并列：

```
config-sidebar
├── providers     - 模型供应商
├── agent         - Agent 设置
├── gateway       - 网关配置
├── channels      - 通道配置
├── workspace     - 工作区文件
├── permissions   - 权限管理
└── skills        - 技能管理 ⬅️ 新增
```

### 2.2 Skills 区块布局

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🎯 技能管理                                                          │
│ 管理 Agent 可用的技能、白名单和安装配置                               │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 📋 全局设置                                                      │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐ │ │
│ │ │ 文件监视    │ │ 安装偏好    │ │ 白名单模式                   │ │ │
│ │ │ [✓] 启用   │ │ [Brew ▾]   │ │ [○] 全部允许 [●] 仅白名单    │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 🔍 技能筛选  [搜索...                    ] [全部▾] [来源▾]      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ 📦 内置技能 (54)                                        [展开] │   │
│ ├───────────────────────────────────────────────────────────────┤   │
│ │ ┌─────────────────────────────────────────────────────────┐   │   │
│ │ │ ♊️ gemini                                      [白名单✓] │   │   │
│ │ │ Gemini CLI for one-shot Q&A, summaries...              │   │   │
│ │ │ ┌──────┐ ┌────────┐ ┌─────────────────────────────────┐│   │   │
│ │ │ │ 可用 │ │ bundled│ │ [启用] [禁用] [配置] [安装]    ││   │   │
│ │ │ └──────┘ └────────┘ └─────────────────────────────────┘│   │   │
│ │ └─────────────────────────────────────────────────────────┘   │   │
│ │ ┌─────────────────────────────────────────────────────────┐   │   │
│ │ │ 👀 peekaboo                                    [白名单✓] │   │   │
│ │ │ Capture and automate macOS UI with Peekaboo CLI        │   │   │
│ │ │ ┌──────┐ ┌────────┐ ┌──────────┐                       │   │   │
│ │ │ │ 可用 │ │ bundled│ │ macOS    │                       │   │   │
│ │ │ └──────┘ └────────┘ └──────────┘                       │   │   │
│ │ └─────────────────────────────────────────────────────────┘   │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ 📁 本地技能 (~/.clawdbot/skills/)                     [添加] │   │
│ ├───────────────────────────────────────────────────────────────┤   │
│ │ (空)                                                          │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ 📂 工作区技能 (<workspace>/skills/)                   [添加] │   │
│ ├───────────────────────────────────────────────────────────────┤   │
│ │ (空)                                                          │   │
│ └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 技能详情/配置弹窗

```
┌─────────────────────────────────────────────────────────────────┐
│ ♊️ gemini 配置                                            [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 基本信息                                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 名称: gemini                                                │ │
│ │ 来源: openclaw-bundled                                      │ │
│ │ 路径: /usr/local/lib/.../skills/gemini/SKILL.md            │ │
│ │ 主页: https://ai.google.dev/                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 状态设置                                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [✓] 启用此技能                                              │ │
│ │ [✓] 加入白名单 (仅内置技能)                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 环境变量                                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ GEMINI_API_KEY (主密钥)                                     │ │
│ │ [••••••••••••••••••••••••••••••••] [👁] [保存]              │ │
│ │                                                             │ │
│ │ + 添加自定义环境变量                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 依赖安装                                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 需要: gemini (二进制)                                       │ │
│ │ 状态: ✅ 已安装                                              │ │
│ │ [Install Gemini CLI (brew)]                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 自定义配置 (config)                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ {                                                           │ │
│ │   "model": "gemini-2.0-flash"                               │ │
│ │ }                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                              [取消] [保存配置]                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 白名单管理界面

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 内置技能白名单                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 模式选择                                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ○ 允许全部内置技能                                          │ │
│ │ ● 仅允许白名单中的技能                                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 白名单 (allowBundled)                    [全选] [全不选] [反选] │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [✓] ♊️ gemini          [✓] 👀 peekaboo                      │ │
│ │ [✓] 📝 apple-notes     [ ] 🐦 bird                          │ │
│ │ [✓] 🖼️ nano-banana-pro [ ] 📺 camsnap                       │ │
│ │ [ ] 🎵 spotify-player  [✓] 🐙 github                        │ │
│ │ ...                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 已选择: 12 / 54                          [保存白名单配置]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、组件设计

### 3.1 新增组件

```
changeoradd/components/
├── skills-content.ts           # 主内容区
├── skills-global-settings.ts   # 全局设置面板
├── skills-list.ts              # 技能列表
├── skills-item.ts              # 技能条目
├── skills-detail-modal.ts      # 技能详情弹窗
├── skills-allowlist.ts         # 白名单管理
└── skills-env-editor.ts        # 环境变量编辑器
```

### 3.2 类型定义

```typescript
// changeoradd/types/skills-config.ts

export type SkillsViewState = {
  // 加载状态
  loading: boolean;
  saving: boolean;
  error: string | null;

  // 技能数据
  report: SkillStatusReport | null;

  // 配置数据
  config: SkillsConfig | null;
  configOriginal: SkillsConfig | null;

  // UI 状态
  filter: string;
  sourceFilter: "all" | "bundled" | "managed" | "workspace";
  statusFilter: "all" | "eligible" | "blocked" | "disabled";
  expandedGroups: Set<string>;
  selectedSkill: string | null;

  // 白名单模式
  allowlistMode: "all" | "whitelist";
  allowlistDraft: Set<string>;

  // 编辑状态
  edits: Record<string, SkillEditState>;
};

export type SkillEditState = {
  enabled?: boolean;
  apiKey?: string;
  env?: Record<string, string>;
  config?: Record<string, unknown>;
  inAllowlist?: boolean;
};

export type SkillsContentProps = {
  // 状态
  loading: boolean;
  saving: boolean;
  error: string | null;
  report: SkillStatusReport | null;
  config: SkillsConfig | null;
  hasChanges: boolean;

  // UI 状态
  filter: string;
  sourceFilter: string;
  statusFilter: string;
  expandedGroups: Set<string>;
  selectedSkill: string | null;
  allowlistMode: "all" | "whitelist";
  allowlistDraft: Set<string>;
  edits: Record<string, SkillEditState>;

  // 回调
  onRefresh: () => void;
  onSave: () => void;
  onFilterChange: (filter: string) => void;
  onSourceFilterChange: (source: string) => void;
  onStatusFilterChange: (status: string) => void;
  onGroupToggle: (group: string) => void;
  onSkillSelect: (skillKey: string | null) => void;
  onSkillToggle: (skillKey: string, enabled: boolean) => void;
  onSkillEdit: (skillKey: string, field: string, value: unknown) => void;
  onAllowlistModeChange: (mode: "all" | "whitelist") => void;
  onAllowlistToggle: (skillKey: string, inList: boolean) => void;
  onInstall: (skillKey: string, installId: string) => void;
  onGlobalSettingChange: (field: string, value: unknown) => void;
};
```

### 3.3 控制器

```typescript
// changeoradd/controllers/skills-config.ts

export type SkillsConfigHost = {
  client: GatewayBrowserClient | null;
  connected: boolean;
  // ... skills state fields
};

// 加载技能状态
export async function loadSkillsConfig(host: SkillsConfigHost): Promise<void>;

// 保存技能配置
export async function saveSkillsConfig(host: SkillsConfigHost): Promise<void>;

// 更新单个技能
export async function updateSkillConfig(
  host: SkillsConfigHost,
  skillKey: string,
  update: Partial<SkillEditState>
): Promise<void>;

// 切换白名单
export function toggleAllowlist(
  host: SkillsConfigHost,
  skillKey: string,
  inList: boolean
): void;

// 应用白名单模式
export function setAllowlistMode(
  host: SkillsConfigHost,
  mode: "all" | "whitelist"
): void;

// 安装技能依赖
export async function installSkillDependency(
  host: SkillsConfigHost,
  skillKey: string,
  name: string,
  installId: string
): Promise<void>;

// 检测是否有未保存更改
export function hasSkillsConfigChanges(host: SkillsConfigHost): boolean;
```

---

## 四、用户交互流程

### 4.1 查看技能列表

```
用户进入 Skills 区块
  ↓
系统调用 skills.status RPC
  ↓
展示技能分组列表
  ├── 内置技能 (可折叠)
  ├── 本地技能
  └── 工作区技能
  ↓
用户可筛选/搜索
```

### 4.2 启用/禁用技能

```
用户点击技能的 [启用/禁用] 按钮
  ↓
更新本地编辑状态
  ↓
显示 "有未保存更改" 提示
  ↓
用户点击 [保存配置]
  ↓
调用 skills.update RPC
  ↓
刷新技能状态
```

### 4.3 管理白名单

```
用户切换到 "仅白名单" 模式
  ↓
显示技能勾选列表
  ↓
用户勾选/取消勾选技能
  ↓
更新 allowlistDraft 状态
  ↓
用户点击 [保存配置]
  ↓
更新 skills.allowBundled 配置
```

### 4.4 配置 API Key

```
用户点击技能的 [配置] 按钮
  ↓
打开技能详情弹窗
  ↓
用户输入 API Key
  ↓
点击 [保存配置]
  ↓
调用 skills.update RPC
```

---

## 五、样式设计

### 5.1 新增 CSS 类

```css
/* Skills 容器 */
.skills-content { }
.skills-header { }
.skills-toolbar { }

/* 全局设置 */
.skills-global-settings { }
.skills-setting-item { }

/* 技能分组 */
.skills-group { }
.skills-group__header { }
.skills-group__body { }
.skills-group--collapsed { }

/* 技能条目 */
.skills-item { }
.skills-item--eligible { }
.skills-item--blocked { }
.skills-item--disabled { }
.skills-item__icon { }
.skills-item__info { }
.skills-item__status { }
.skills-item__actions { }

/* 白名单标签 */
.skills-item__allowlist-badge { }
.skills-item__allowlist-badge--active { }

/* 筛选器 */
.skills-filter { }
.skills-filter__input { }
.skills-filter__select { }

/* 弹窗 */
.skills-modal { }
.skills-modal__header { }
.skills-modal__body { }
.skills-modal__section { }

/* 环境变量编辑器 */
.skills-env-editor { }
.skills-env-row { }
.skills-env-row__key { }
.skills-env-row__value { }
```

---

## 六、集成要点

### 6.1 app.ts 新增状态

```typescript
// 技能管理状态
@state() skillsConfigLoading = false;
@state() skillsConfigSaving = false;
@state() skillsConfigError: string | null = null;
@state() skillsConfigReport: SkillStatusReport | null = null;
@state() skillsConfig: SkillsConfig | null = null;
@state() skillsConfigOriginal: SkillsConfig | null = null;
@state() skillsFilter = "";
@state() skillsSourceFilter: "all" | "bundled" | "managed" | "workspace" = "all";
@state() skillsStatusFilter: "all" | "eligible" | "blocked" | "disabled" = "all";
@state() skillsExpandedGroups: Set<string> = new Set(["bundled"]);
@state() skillsSelectedSkill: string | null = null;
@state() skillsAllowlistMode: "all" | "whitelist" = "all";
@state() skillsAllowlistDraft: Set<string> = new Set();
@state() skillsEdits: Record<string, SkillEditState> = {};
```

### 6.2 config-sidebar.ts 新增条目

```typescript
{
  id: "skills",
  label: "技能管理",
  desc: "管理 Agent 可用技能和白名单",
  icon: icons.zap  // 或自定义技能图标
}
```

### 6.3 model-config.ts 新增渲染分支

```typescript
case "skills":
  return renderSkillsContent({
    loading: props.skillsLoading,
    saving: props.skillsSaving,
    // ... 所有 props
  });
```

---

## 七、实现优先级

### Phase 1: 基础功能
1. Skills 区块入口和布局
2. 技能列表展示（复用现有 skills.status RPC）
3. 启用/禁用技能
4. 保存 API Key

### Phase 2: 白名单管理
5. allowBundled 白名单界面
6. 白名单模式切换
7. 批量勾选操作

### Phase 3: 高级功能
8. 环境变量编辑器
9. 自定义 config 编辑
10. 安装偏好设置
11. extraDirs 管理

### Phase 4: 增强功能
12. SKILL.md 预览/编辑
13. 技能搜索高亮
14. 安装进度显示
15. 技能使用统计

---

## 八、与现有 skills 标签页的关系

| 功能 | 现有 skills 标签页 | changeoradd skills 区块 |
|------|-------------------|------------------------|
| 定位 | 快速操作入口 | 完整配置管理 |
| 技能列表 | 平铺展示 | 分组折叠 |
| 白名单 | 不支持 | **完整支持** |
| 全局设置 | 不支持 | **完整支持** |
| 环境变量 | 仅 apiKey | **完整 env 编辑** |
| 批量操作 | 不支持 | **支持** |
| 保存确认 | 即时保存 | 统一保存按钮 |

**建议**：保留现有 skills 标签页作为快速操作入口，changeoradd 的 skills 区块提供完整的配置管理能力。

---

## 九、实现状态

### 9.1 已完成功能

| Phase | 功能 | 状态 | 实现文件 |
|-------|------|------|----------|
| **Phase 1** | Skills 区块入口和布局 | ✅ | `config-sidebar.ts`, `model-config.ts` |
| | 技能列表展示 | ✅ | `skills-content.ts` |
| | 启用/禁用技能 | ✅ | `skills-config.ts` |
| | 保存 API Key | ✅ | `skills-config.ts` |
| **Phase 2** | allowBundled 白名单界面 | ✅ | `skills-content.ts` |
| | 白名单模式切换 | ✅ | `skills-config.ts` |
| | 技能勾选操作 | ✅ | `skills-content.ts` |
| **Phase 3** | 环境变量编辑器 | ✅ | `skills-content.ts` |
| | 自定义 config 编辑 | ✅ | `skills-content.ts` |
| | 安装偏好设置 | ✅ | `skills-content.ts` |
| | extraDirs 管理 | ✅ | `skills-content.ts` |
| | 全局设置 (watch, nodeManager, preferBrew) | ✅ | `skills-config.ts` |
| **Phase 4** | 技能搜索高亮 | ✅ | `skills-content.ts` (`highlightText`) |
| | 技能使用统计 | ✅ | `skills-content.ts` (`renderStatsBar`) |
| | 安装进度显示 | ✅ | `skills-content.ts` (`renderInstallProgress`) |
| | SKILL.md 文档链接 | ✅ | `skills-content.ts` (`renderSkillDocsLink`) |

### 9.2 实现文件结构

```
changeoradd/
├── components/
│   └── skills-content.ts      # 主内容组件 (合并了所有子组件)
├── controllers/
│   └── skills-config.ts       # 状态管理和 RPC 调用
├── types/
│   └── skills-config.ts       # 类型定义
├── styles/
│   └── model-config.css       # 样式 (包含 .skills-* 类)
└── views/
    └── model-config.ts        # 视图层集成
```

### 9.3 技术实现要点

#### config.patch API 规范

`config.patch` 使用 **RFC 7386 merge-patch** 语义，而非 JSON Patch：

```typescript
// ✅ 正确用法
await client.request("config.patch", {
  raw: JSON.stringify({
    skills: {
      allowBundled: ["gemini", "peekaboo"],
      load: { watch: true }
    }
  }),
  baseHash: state.skillsConfigBaseHash  // 必需！
});

// ❌ 错误用法 (JSON Patch 格式)
await client.request("config.patch", {
  operations: [{ op: "replace", path: "/skills/load/watch", value: true }]
});
```

#### baseHash 并发安全

- `baseHash` 从 `config.get` 响应获取
- 每次 `config.patch` 调用必须包含 `baseHash`
- 若 hash 过期会返回错误，需重新调用 `config.get`

```typescript
// 加载时保存 hash
const configRes = await client.request("config.get", {});
state.skillsConfigBaseHash = configRes.hash ?? null;

// patch 时验证
if (!state.skillsConfigBaseHash) {
  state.skillsConfigError = "Config hash missing; reload and retry.";
  return;
}
```

#### merge-patch 删除语义

使用 `null` 表示删除字段：

```typescript
// 删除 allowBundled (允许全部内置技能)
const patch = {
  skills: {
    allowBundled: null  // 删除此字段
  }
};
```

### 9.4 状态字段一览

```typescript
// app-view-state.ts 中的技能管理状态
skillsConfigLoading: boolean;
skillsConfigSaving: boolean;
skillsConfigError: string | null;
skillsConfigReport: SkillStatusReport | null;
skillsConfig: SkillsConfig | null;
skillsConfigOriginal: SkillsConfig | null;
skillsConfigBaseHash: string | null;          // RFC 7386 baseHash
skillsConfigFilter: string;
skillsConfigSourceFilter: SkillSourceFilter;
skillsConfigStatusFilter: SkillStatusFilter;
skillsConfigExpandedGroups: Set<string>;
skillsConfigSelectedSkill: string | null;
skillsConfigBusySkill: string | null;
skillsConfigMessages: Record<string, SkillMessage>;
skillsConfigAllowlistMode: "all" | "whitelist";
skillsConfigAllowlistDraft: Set<string>;
skillsConfigEdits: Record<string, SkillEditState>;
```

### 9.5 CSS 类清单 (Phase 4 新增)

```css
/* 统计栏 */
.skills-stats { }
.skills-stats__item { }
.skills-stats__item--ok { }
.skills-stats__item--warn { }
.skills-stats__item--disabled { }
.skills-stats__value { }
.skills-stats__label { }
.skills-stats__divider { }

/* 搜索高亮 */
.skills-highlight { }

/* 安装进度 */
.skills-progress { }
.skills-progress__header { }
.skills-progress__title { }
.skills-progress__status { }
.skills-progress__bar { }
.skills-progress__fill { }
.skills-progress__fill--indeterminate { }
.skills-progress__message { }

/* SKILL.md 文档预览 */
.skills-docs-preview { }
.skills-docs-preview__header { }
.skills-docs-preview__title { }
.skills-docs-preview__icon { }
.skills-docs-preview__link { }
.skills-docs-preview__content { }
.skills-docs-preview__empty { }
```

---

## 十、Skills 编辑/创建功能可行性分析

### 10.1 现有架构分析

#### 10.1.1 workspace-editor 扩展参考

项目中已有 `extensions/workspace-editor` 扩展，提供了工作区文件编辑能力：

```typescript
// Gateway RPC 方法
api.registerGatewayMethod("workspace.files.list", ...);  // 列出文件
api.registerGatewayMethod("workspace.file.read", ...);   // 读取文件
api.registerGatewayMethod("workspace.file.write", ...);  // 写入文件
```

**关键设计点：**
- 使用文件白名单限制访问：`SOUL.md`, `IDENTITY.md`, `TOOLS.md`, `USER.md` 等
- 支持 `memory/YYYY-MM-DD.md` 格式的记忆文件
- 安全措施：路径遍历防护、文件名验证
- 按 Agent 解析工作区目录

#### 10.1.2 Skills 加载位置

Skills 从 5 个位置加载（优先级从低到高）：

| 优先级 | 来源 | 路径 | 可编辑性 |
|--------|------|------|----------|
| 1 | extraDirs | 配置指定的额外目录 | ✅ 可编辑 |
| 2 | plugins | 扩展提供的技能 | ❌ 只读 |
| 3 | bundled | `<package>/skills/` | ❌ 只读 |
| 4 | managed | `~/.clawdbot/skills/` | ✅ 可编辑 |
| 5 | workspace | `<workspace>/skills/` | ✅ 可编辑 |

### 10.2 实现方案

#### 实际采用：在 workspace-editor 扩展中添加 skills 文件操作

在 `workspace-editor` 扩展中添加技能文件操作模块：

```
extensions/workspace-editor/
├── index.ts            # 插件入口，注册 RPC 方法（已更新）
├── skills-files.ts     # 技能文件操作实现（新增）
├── workspace-files.ts  # 工作区文件操作
└── utils.ts            # 工具函数
```

**已实现的 RPC 方法：**

```typescript
// 列出可编辑的技能目录
api.registerGatewayMethod("skills.files.list", async ({ params, respond }) => {
  // params: { agentId?: string, source?: "managed" | "workspace" }
  // 返回: { managedDir, workspaceDir, skills: SkillFileInfo[] }
});

// 读取技能文件 (SKILL.md)
api.registerGatewayMethod("skills.file.read", async ({ params, respond }) => {
  // params: { skillName: string, source: "managed" | "workspace", agentId?: string }
  // 返回: { name, path, source, exists, content }
});

// 写入技能文件 (SKILL.md)
api.registerGatewayMethod("skills.file.write", async ({ params, respond }) => {
  // params: { skillName: string, content: string, source: "managed" | "workspace", agentId?: string }
  // 返回: { ok, path, bytesWritten }
});

// 创建新技能目录
api.registerGatewayMethod("skills.file.create", async ({ params, respond }) => {
  // params: { skillName: string, source: "managed" | "workspace", content?: string, agentId?: string }
  // 返回: { ok, name, path, source }
});

// 删除技能
api.registerGatewayMethod("skills.file.delete", async ({ params, respond }) => {
  // params: { skillName: string, source: "managed" | "workspace", agentId?: string }
  // 返回: { ok, name, path }
});
```

**安全限制：**
- 仅允许编辑 `managed` 和 `workspace` 来源的技能
- 文件名验证：技能名只允许 `[a-z0-9-]` 格式（`^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$`）
- 路径遍历防护
- 仅操作 `SKILL.md` 文件

#### 备选方案：扩展现有 skills RPC（未采用）

> 此方案未采用，仅作参考。在 `src/gateway/server-methods/skills.ts` 中添加文件操作方法。

### 10.3 UI 组件设计

#### 10.3.1 新增组件

```
changeoradd/components/
├── skills-content.ts           # 现有：技能列表
├── skills-editor-modal.ts      # 新增：SKILL.md 编辑弹窗
├── skills-create-modal.ts      # 新增：创建技能弹窗
└── skills-markdown-preview.ts  # 新增：Markdown 预览
```

#### 10.3.2 编辑器弹窗布局

```
┌─────────────────────────────────────────────────────────────────┐
│ 📝 编辑技能: gemini                                        [×]   │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ [编辑] [预览] [分屏]                              [保存]  │   │
│ ├───────────────────────────────────────────────────────────┤   │
│ │                                                           │   │
│ │  ---                                                      │   │
│ │  name: gemini                                             │   │
│ │  emoji: ♊️                                                │   │
│ │  homepage: https://ai.google.dev/                        │   │
│ │  requirements:                                            │   │
│ │    bins:                                                  │   │
│ │      - gemini                                             │   │
│ │    env:                                                   │   │
│ │      - GEMINI_API_KEY                                    │   │
│ │  install:                                                 │   │
│ │    - id: brew-gemini                                     │   │
│ │      ...                                                  │   │
│ │  ---                                                      │   │
│ │                                                           │   │
│ │  # Gemini CLI                                            │   │
│ │  Use the Gemini CLI for one-shot Q&A...                  │   │
│ │                                                           │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ 路径: ~/.clawdbot/skills/gemini/SKILL.md                       │
│ 来源: managed                                                   │
│                                                                 │
│                              [取消] [保存更改]                   │
└─────────────────────────────────────────────────────────────────┘
```

#### 10.3.3 新增状态字段

```typescript
// app-view-state.ts
skillsEditorOpen: boolean;              // 编辑器是否打开
skillsEditorSkillKey: string | null;    // 当前编辑的技能
skillsEditorContent: string;            // 编辑器内容
skillsEditorOriginal: string;           // 原始内容（用于脏检查）
skillsEditorMode: "edit" | "preview" | "split";  // 编辑模式
skillsEditorSaving: boolean;            // 保存中
skillsEditorError: string | null;       // 错误信息

skillsCreateOpen: boolean;              // 创建弹窗是否打开
skillsCreateName: string;               // 新技能名称
skillsCreateSource: "managed" | "workspace"; // 创建位置
skillsCreateTemplate: string;           // 模板内容
```

### 10.4 实现优先级

#### Phase 5: 技能编辑功能

| 步骤 | 功能 | 复杂度 | 状态 |
|------|------|--------|------|
| 5.1 | 在 `workspace-editor` 扩展中添加 `skills-files.ts` | 中 | ✅ 已完成 |
| 5.2 | 实现 `skills.files.list` RPC | 低 | ✅ 已完成 |
| 5.3 | 实现 `skills.file.read` RPC | 低 | ✅ 已完成 |
| 5.4 | 实现 `skills.file.write` RPC | 低 | ✅ 已完成 |
| 5.5 | UI: 编辑器弹窗组件 | 中 | ⏳ 待实现 |
| 5.6 | UI: Markdown 预览 | 低 | ⏳ 待实现 |
| 5.7 | 集成到技能列表 | 低 | ⏳ 待实现 |

#### Phase 6: 技能创建功能

| 步骤 | 功能 | 复杂度 | 状态 |
|------|------|--------|------|
| 6.1 | 实现 `skills.file.create` RPC | 中 | ✅ 已完成 |
| 6.2 | 实现 `skills.file.delete` RPC | 低 | ✅ 已完成 |
| 6.3 | UI: 创建技能弹窗 | 中 | ⏳ 待实现 |
| 6.4 | 技能模板系统 | 低 | ✅ 已完成（内置默认模板） |
| 6.5 | 验证和错误处理 | 低 | ✅ 已完成 |

### 10.5 可行性结论

| 评估项 | 结论 | 说明 |
|--------|------|------|
| **技术可行性** | ✅ 完全可行 | 参照 workspace-editor 模式 |
| **安全性** | ✅ 可控 | 白名单 + 路径限制 |
| **复杂度** | 低 | 在现有扩展中添加，复用基础设施 |
| **工作量** | 约 1-2 天 | RPC 已完成，仅剩 UI |
| **依赖** | 无外部依赖 | 仅需 Node fs API |

**实际采用方案：在 workspace-editor 扩展中统一实现**

理由：
1. 避免创建新扩展目录，减少维护成本
2. 复用 workspace-editor 的基础设施（目录解析、配置访问等）
3. 保持扩展数量精简
4. Skills 文件操作与 Workspace 文件操作逻辑相似

**实现文件：**
```
extensions/workspace-editor/
├── index.ts            # RPC 方法注册（已更新）
├── skills-files.ts     # 技能文件操作实现（新增）
├── workspace-files.ts  # 工作区文件操作
└── utils.ts            # 工具函数
```

### 10.6 SKILL.md 模板

```markdown
---
name: my-skill
emoji: 🔧
description: A brief description of what this skill does
homepage: https://example.com
requirements:
  bins: []
  env: []
  config: []
  os: []
  anyBins: []
install: []
---

# My Skill

Detailed instructions for the agent on how to use this skill.

## Usage

Describe the typical use cases and commands.

## Examples

Provide concrete examples.
```
