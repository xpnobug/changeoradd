# 新模块设计方案

## 模块概览

```
ui-zh-CN/
├── wizards/                  # 配置向导
│   ├── index.ts              # 统一导出
│   ├── types.ts              # 向导相关类型
│   ├── wizard-base.ts        # 向导基类/通用逻辑
│   ├── agent-wizard.ts       # Agent 创建向导 (~400行)
│   ├── channel-wizard.ts     # 通道配置向导 (~350行)
│   └── user-wizard.ts        # 用户添加向导 (~250行)
│
├── validators/               # 配置校验
│   ├── index.ts              # 统一导出
│   ├── types.ts              # 验证相关类型
│   ├── rules.ts              # 内置验证规则
│   ├── config-validator.ts   # 配置验证器 (~300行)
│   └── error-fixer.ts        # 自动修复建议 (~250行)
│
└── templates/                # 预设模板
    ├── index.ts              # 统一导出
    ├── types.ts              # 模板相关类型
    ├── agent-templates.ts    # Agent 预设模板 (~200行)
    └── channel-templates.ts  # 通道预设模板 (~150行)
```

**预估总代码量**: ~1900 行

**依赖关系**:
- wizards → validators (步骤验证)
- wizards → templates (从模板创建)
- validators 独立，可被其他模块复用

---

## 1. wizards/ - 配置向导

### 1.1 agent-wizard.ts

**目的**: 引导用户一步步创建 Agent，降低配置门槛

#### 步骤定义

```typescript
type WizardStep = {
  id: string;
  title: string;
  description?: string;
  validate?: (data: Partial<AgentConfig>) => ValidationResult;
  optional?: boolean;
};

const AGENT_WIZARD_STEPS: WizardStep[] = [
  { id: "basic", title: "基本信息", description: "名称、描述、头像" },
  { id: "model", title: "选择模型", description: "AI 模型和参数" },
  { id: "persona", title: "人设定义", description: "性格、语气、角色" },
  { id: "tools", title: "工具权限", description: "可用工具和限制", optional: true },
  { id: "channels", title: "绑定通道", description: "关联消息通道", optional: true },
  { id: "review", title: "确认创建", description: "预览并保存" },
];
```

#### Props 定义

```typescript
type AgentWizardProps = {
  onComplete: (config: AgentConfig) => void;
  onCancel: () => void;
  initialData?: Partial<AgentConfig>;
  templates?: AgentTemplate[];  // 可选：从模板开始
};

type WizardState = {
  currentStep: number;
  data: Partial<AgentConfig>;
  errors: Record<string, string[]>;
  touched: Set<string>;
};
```

#### UI 结构

```
┌─────────────────────────────────────────────────┐
│  创建 Agent                              [关闭] │
├─────────────────────────────────────────────────┤
│  ① 基本信息  ② 模型  ③ 人设  ④ 工具  ⑤ 确认   │  <- 步骤指示器
├─────────────────────────────────────────────────┤
│                                                 │
│  Agent 名称 *                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ my-assistant                            │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  显示名称                                       │
│  ┌─────────────────────────────────────────┐   │
│  │ 我的助手                                │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  头像 Emoji                                     │
│  ┌────┐                                        │
│  │ 🤖 │  [选择]                                │
│  └────┘                                        │
│                                                 │
├─────────────────────────────────────────────────┤
│  [上一步]                    [下一步 →]        │
└─────────────────────────────────────────────────┘
```

#### 关键函数

```typescript
// 步骤渲染器
function renderStep(step: WizardStep, state: WizardState, props: AgentWizardProps): TemplateResult;

// 步骤验证
function validateStep(stepId: string, data: Partial<AgentConfig>): ValidationResult;

// 步骤导航
function canProceed(state: WizardState): boolean;
function goToStep(state: WizardState, stepIndex: number): WizardState;

// 最终提交
function finalizeConfig(data: Partial<AgentConfig>): AgentConfig;
```

---

### 1.2 channel-wizard.ts

**目的**: 简化通道配置，自动检测和验证凭据

#### 步骤定义

```typescript
const CHANNEL_WIZARD_STEPS: WizardStep[] = [
  { id: "select", title: "选择通道", description: "Telegram、Discord、微信..." },
  { id: "credentials", title: "填写凭据", description: "Token、API Key 等" },
  { id: "test", title: "连接测试", description: "验证配置是否正确" },
  { id: "options", title: "高级选项", description: "消息格式、权限等", optional: true },
  { id: "confirm", title: "完成配置" },
];
```

#### Props 定义

```typescript
type ChannelWizardProps = {
  onComplete: (config: ChannelConfig) => void;
  onCancel: () => void;
  availableChannels: ChannelType[];
  existingChannels?: ChannelConfig[];  // 用于检测冲突
};
```

#### 凭据字段定义

```typescript
type ChannelCredentialField = {
  key: string;
  label: string;
  type: "text" | "password" | "textarea";
  required: boolean;
  placeholder?: string;
  helpText?: string;
  helpLink?: string;  // 文档链接
};

const CHANNEL_CREDENTIALS: Record<ChannelType, ChannelCredentialField[]> = {
  telegram: [
    { key: "botToken", label: "Bot Token", type: "password", required: true, 
      helpText: "从 @BotFather 获取", helpLink: "https://docs.openclaw.ai/channels/telegram" },
  ],
  discord: [
    { key: "botToken", label: "Bot Token", type: "password", required: true },
    { key: "applicationId", label: "Application ID", type: "text", required: true },
  ],
  wechat: [
    { key: "appId", label: "AppID", type: "text", required: true },
    { key: "appSecret", label: "AppSecret", type: "password", required: true },
  ],
  // ...
};
```

#### 连接测试

```typescript
type TestResult = {
  success: boolean;
  message: string;
  details?: {
    botName?: string;
    botUsername?: string;
    permissions?: string[];
  };
  error?: {
    code: string;
    suggestion: string;
  };
};

async function testChannelConnection(type: ChannelType, credentials: Record<string, string>): Promise<TestResult>;
```

---

### 1.3 user-wizard.ts

**目的**: 添加用户/管理员，配置权限

#### 步骤定义

```typescript
const USER_WIZARD_STEPS: WizardStep[] = [
  { id: "identity", title: "用户身份", description: "ID、来源通道" },
  { id: "role", title: "角色权限", description: "管理员/普通用户" },
  { id: "limits", title: "使用限制", description: "速率、配额", optional: true },
  { id: "confirm", title: "确认添加" },
];
```

#### Props 定义

```typescript
type UserWizardProps = {
  onComplete: (user: UserConfig) => void;
  onCancel: () => void;
  channels: ChannelConfig[];  // 用于选择用户来源
  existingUsers?: UserConfig[];
};
```

#### 角色预设

```typescript
const USER_ROLE_PRESETS = [
  { id: "owner", label: "所有者", description: "完全控制权限", permissions: ["*"] },
  { id: "admin", label: "管理员", description: "管理配置和用户", permissions: ["config.*", "users.*"] },
  { id: "user", label: "普通用户", description: "基本使用权限", permissions: ["chat", "tools.safe"] },
  { id: "guest", label: "访客", description: "只读权限", permissions: ["chat.readonly"] },
  { id: "custom", label: "自定义", description: "手动配置权限", permissions: [] },
];
```

---

## 2. validators/ - 配置校验

### 2.1 types.ts

```typescript
type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
};

type ValidationError = {
  path: string;           // 如 "agents.0.model"
  code: string;           // 如 "REQUIRED_FIELD"
  message: string;        // 用户可读消息
  value?: unknown;        // 当前值
};

type ValidationWarning = {
  path: string;
  code: string;
  message: string;
  suggestion?: string;
};

type ValidationRule<T = unknown> = {
  code: string;
  message: string | ((value: T) => string);
  validate: (value: T, context?: ValidationContext) => boolean;
  severity: "error" | "warning";
};

type ValidationContext = {
  fullConfig: OpenClawConfig;
  path: string;
  fieldMeta?: FieldMeta;
};
```

### 2.2 rules.ts - 内置验证规则

```typescript
const VALIDATION_RULES = {
  required: (field: string): ValidationRule => ({
    code: "REQUIRED_FIELD",
    message: `${field} 是必填项`,
    validate: (v) => v !== undefined && v !== null && v !== "",
    severity: "error",
  }),

  pattern: (field: string, regex: RegExp, hint: string): ValidationRule<string> => ({
    code: "INVALID_FORMAT",
    message: `${field} 格式不正确，${hint}`,
    validate: (v) => regex.test(v),
    severity: "error",
  }),

  uniqueIn: (field: string, array: unknown[]): ValidationRule => ({
    code: "DUPLICATE_VALUE",
    message: `${field} 已存在`,
    validate: (v) => !array.includes(v),
    severity: "error",
  }),

  deprecated: (field: string, alternative: string): ValidationRule => ({
    code: "DEPRECATED_FIELD",
    message: `${field} 已废弃，请使用 ${alternative}`,
    validate: () => true,
    severity: "warning",
  }),
};
```

### 2.3 config-validator.ts

```typescript
// 字段级验证定义
const AGENT_FIELD_VALIDATORS: Record<string, ValidationRule[]> = {
  "id": [
    VALIDATION_RULES.required("Agent ID"),
    VALIDATION_RULES.pattern("Agent ID", /^[a-z][a-z0-9-]*$/, "只能包含小写字母、数字和连字符"),
  ],
  "model": [
    VALIDATION_RULES.required("模型"),
  ],
  "systemPrompt": [
    {
      code: "PROMPT_TOO_LONG",
      message: "系统提示词超过 32000 字符，可能影响性能",
      validate: (v: string) => !v || v.length <= 32000,
      severity: "warning",
    },
  ],
};

// 配置验证器
class ConfigValidator {
  validateAgent(config: Partial<AgentConfig>): ValidationResult;
  validateChannel(config: Partial<ChannelConfig>): ValidationResult;
  validateUser(config: Partial<UserConfig>): ValidationResult;
  validateFullConfig(config: Partial<OpenClawConfig>): ValidationResult;
}
```

### 2.4 error-fixer.ts

```typescript
type FixSuggestion = {
  errorCode: string;
  description: string;
  autoFix?: () => Partial<OpenClawConfig>;  // 可自动修复
  manualSteps?: string[];                    // 手动修复步骤
  docLink?: string;
};

const FIX_SUGGESTIONS: Record<string, (error: ValidationError, context: ValidationContext) => FixSuggestion> = {
  
  REQUIRED_FIELD: (error) => ({
    errorCode: error.code,
    description: `请填写 ${error.path}`,
    manualSteps: [`在配置中添加 ${error.path} 字段`],
  }),

  INVALID_FORMAT: (error) => ({
    errorCode: error.code,
    description: `${error.path} 格式不正确`,
    manualSteps: [error.message],
  }),

  DUPLICATE_VALUE: (error, ctx) => ({
    errorCode: error.code,
    description: `${error.path} 值重复`,
    autoFix: () => {
      const base = String(error.value);
      const newValue = `${base}-${Date.now().toString(36).slice(-4)}`;
      return setPath(ctx.fullConfig, error.path, newValue);
    },
  }),

  MODEL_NOT_FOUND: (error) => ({
    errorCode: error.code,
    description: `模型 ${error.value} 不存在或未配置`,
    manualSteps: [
      "1. 检查模型名称是否正确",
      "2. 确认已配置对应的 Provider",
      "3. 验证 API Key 是否有效",
    ],
    docLink: "https://docs.openclaw.ai/providers",
  }),

  CHANNEL_AUTH_FAILED: (error) => ({
    errorCode: error.code,
    description: "通道认证失败",
    manualSteps: [
      "1. 检查 Token/API Key 是否正确",
      "2. 确认凭据未过期",
      "3. 检查网络连接",
    ],
  }),
};

class ErrorFixer {
  getSuggestion(error: ValidationError, context: ValidationContext): FixSuggestion | null;
  getSuggestions(errors: ValidationError[], context: ValidationContext): FixSuggestion[];
  applyAutoFix(suggestion: FixSuggestion): Partial<OpenClawConfig> | null;
  applyAllAutoFixes(suggestions: FixSuggestion[]): Partial<OpenClawConfig>;
}
```

#### UI 集成

```typescript
function renderValidationError(error: ValidationError, suggestion: FixSuggestion | null) {
  return html`
    <div class="validation-error">
      <span class="validation-error__icon">⚠️</span>
      <span class="validation-error__message">${error.message}</span>
      ${suggestion?.autoFix ? html`
        <button class="validation-error__fix-btn" @click=${() => applyFix(suggestion)}>
          自动修复
        </button>
      ` : nothing}
      ${suggestion?.manualSteps ? html`
        <details class="validation-error__details">
          <summary>修复步骤</summary>
          <ol>
            ${suggestion.manualSteps.map(step => html`<li>${step}</li>`)}
          </ol>
        </details>
      ` : nothing}
    </div>
  `;
}
```

---

## 3. templates/ - 预设模板

### 3.1 agent-templates.ts

```typescript
type AgentTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "assistant" | "coding" | "writing" | "analysis" | "custom";
  config: Partial<AgentConfig>;
  tags?: string[];
  popularity?: number;
};

const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "general-assistant",
    name: "通用助手",
    description: "日常问答、任务处理的全能助手",
    icon: "🤖",
    category: "assistant",
    tags: ["通用", "入门"],
    popularity: 100,
    config: {
      displayName: "助手",
      model: "claude-sonnet-4-20250514",
      systemPrompt: "你是一个友好、专业的 AI 助手...",
      temperature: 0.7,
    },
  },
  {
    id: "code-reviewer",
    name: "代码审查员",
    description: "专业的代码审查和优化建议",
    icon: "👨‍💻",
    category: "coding",
    tags: ["开发", "代码"],
    popularity: 85,
    config: {
      displayName: "代码审查员",
      model: "claude-sonnet-4-20250514",
      systemPrompt: "你是一位资深的代码审查专家...",
      temperature: 0.3,
      tools: {
        exec: { enabled: true, security: "allowlist" },
        read: { enabled: true },
      },
    },
  },
  {
    id: "translator",
    name: "翻译专家",
    description: "多语言翻译，保持原文风格",
    icon: "🌐",
    category: "writing",
    tags: ["翻译", "写作"],
    config: {
      displayName: "翻译",
      model: "claude-sonnet-4-20250514",
      systemPrompt: "你是一位专业的翻译专家...",
      temperature: 0.5,
    },
  },
  {
    id: "data-analyst",
    name: "数据分析师",
    description: "数据分析、可视化建议",
    icon: "📊",
    category: "analysis",
    tags: ["数据", "分析"],
    config: {
      displayName: "数据分析师",
      model: "claude-sonnet-4-20250514",
      systemPrompt: "你是一位数据分析专家...",
      temperature: 0.4,
    },
  },
  {
    id: "customer-service",
    name: "客服助手",
    description: "友好耐心的客户服务",
    icon: "💬",
    category: "assistant",
    tags: ["客服", "沟通"],
    config: {
      displayName: "客服",
      model: "claude-sonnet-4-20250514",
      systemPrompt: "你是一位专业的客服代表...",
      temperature: 0.6,
    },
  },
];
```

### 3.2 channel-templates.ts

```typescript
type ChannelTemplate = {
  id: string;
  channelType: ChannelType;
  name: string;
  description: string;
  config: Partial<ChannelConfig>;
  useCase: string;
};

const CHANNEL_TEMPLATES: ChannelTemplate[] = [
  {
    id: "telegram-personal",
    channelType: "telegram",
    name: "Telegram 个人助手",
    description: "私聊模式，仅自己可用",
    useCase: "个人使用",
    config: {
      allowlist: ["owner"],
      rateLimit: { messagesPerMinute: 30 },
    },
  },
  {
    id: "telegram-group",
    channelType: "telegram",
    name: "Telegram 群组机器人",
    description: "群聊模式，@提及触发",
    useCase: "团队协作",
    config: {
      groupMode: true,
      triggerOnMention: true,
      rateLimit: { messagesPerMinute: 10 },
    },
  },
  {
    id: "discord-server",
    channelType: "discord",
    name: "Discord 服务器机器人",
    description: "多频道支持，斜杠命令",
    useCase: "社区服务",
    config: {
      slashCommands: true,
      allowedChannels: [],
    },
  },
  {
    id: "wechat-service",
    channelType: "wechat",
    name: "微信客服",
    description: "微信公众号/企业微信",
    useCase: "客户服务",
    config: {
      autoReply: true,
      welcomeMessage: "您好，有什么可以帮您？",
    },
  },
];
```

---

## 实现优先级

| 顺序 | 模块 | 理由 |
|------|------|------|
| 1 | validators | 基础设施，其他模块依赖 |
| 2 | templates | 简单，快速出效果 |
| 3 | wizards | 最复杂，依赖前两者 |

---

## 样式文件

需要新增样式文件：

```
styles/
├── modules/
│   ├── wizard.css        # 向导通用样式
│   └── validation.css    # 验证提示样式
```

### wizard.css 关键样式

```css
.wizard {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.wizard__steps {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.wizard__step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--muted);
}

.wizard__step--active {
  background: var(--accent-bg);
  color: var(--accent);
}

.wizard__step--completed {
  color: var(--ok);
}

.wizard__content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.wizard__footer {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid var(--border);
}
```

### validation.css 关键样式

```css
.validation-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: var(--danger-bg);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.validation-error__icon {
  flex-shrink: 0;
}

.validation-error__message {
  flex: 1;
  color: var(--danger);
}

.validation-error__fix-btn {
  padding: 4px 8px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  cursor: pointer;
}

.validation-warning {
  background: var(--warning-bg);
}

.validation-warning .validation-error__message {
  color: var(--warning);
}
```
