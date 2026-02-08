# ui-zh-CN 开发规范

> 最后更新: 2026-02-07  
> 版本: v1.0

## 📋 目录

- [代码规范](#代码规范)
- [Git 规范](#git-规范)
- [文档规范](#文档规范)
- [测试规范](#测试规范)
- [Code Review 规范](#code-review-规范)
- [发布规范](#发布规范)

---

## 💻 代码规范

### TypeScript 规范

#### 命名规范

```typescript
// ✅ 好：清晰的命名
type UserConfig = { name: string; email: string };
function loadUserConfig(): UserConfig { }
const isConfigValid = true;

// ❌ 差：模糊的命名
type UC = { n: string; e: string };
function load(): any { }
const flag = true;
```

| 类型 | 规范 | 示例 |
|------|------|------|
| **类型** | PascalCase | `UserConfig`, `ModelState` |
| **接口** | PascalCase | `IUserService`, `ConfigOptions` |
| **函数** | camelCase | `loadConfig`, `renderButton` |
| **变量** | camelCase | `userName`, `isValid` |
| **常量** | UPPER_SNAKE_CASE | `MAX_RETRY`, `API_URL` |
| **私有属性** | _camelCase | `_internalState` |

#### 类型定义

```typescript
// ✅ 好：严格类型
type ButtonVariant = "primary" | "secondary" | "danger";
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

// ❌ 差：any 类型
type ButtonVariant = string;
interface ButtonProps {
  label: any;
  onClick: any;
  variant?: any;
}
```

#### 函数规范

```typescript
// ✅ 好：单一职责、清晰的参数
function renderButton(props: ButtonProps): TemplateResult {
  const { label, onClick, variant = "primary" } = props;
  return html`<button class="btn btn--${variant}" @click=${onClick}>${label}</button>`;
}

// ❌ 差：职责混乱、参数过多
function render(a: any, b: any, c: any, d: any, e: any): any {
  // 做了太多事情
}
```

#### 导入顺序

```typescript
// 1. 第三方库
import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

// 2. 类型导入
import type { TemplateResult } from "lit";
import type { ButtonProps } from "./types";

// 3. 本地模块
import { renderButton } from "./components/button";
import { formatDate } from "./utils/format";

// 4. 样式
import "./styles/button.css";
```

---

### CSS 规范

#### BEM 命名

```css
/* ✅ 好：BEM 命名 */
.mc-btn { }
.mc-btn--primary { }
.mc-btn--disabled { }
.mc-btn__icon { }
.mc-btn__label { }

/* ❌ 差：随意命名 */
.button { }
.buttonPrimary { }
.btn-icon { }
```

#### CSS 变量

```css
/* ✅ 好：使用 CSS 变量 */
.mc-btn {
  background: var(--accent);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
}

/* ❌ 差：硬编码 */
.mc-btn {
  background: #ff4d4d;
  border-radius: 8px;
  padding: 8px 16px;
}
```

#### 选择器规范

```css
/* ✅ 好：低特异性 */
.mc-btn { }
.mc-btn--primary { }

/* ❌ 差：高特异性 */
div.container .sidebar .mc-btn.primary { }
```

---

### 文件组织

#### 目录结构

```
components/
├── button/
│   ├── index.ts          # 导出
│   ├── button.ts         # 组件实现
│   ├── types.ts          # 类型定义
│   ├── constants.ts      # 常量
│   └── __tests__/        # 测试
│       └── button.test.ts
```

#### 文件大小

| 规模 | 行数 | 评价 |
|------|------|------|
| **小文件** | <100 | 🟢 优秀 |
| **中文件** | 100-300 | 🟢 良好 |
| **大文件** | 300-500 | 🟡 可接受 |
| **超大文件** | >500 | 🔴 需拆分 |

---

## 🔀 Git 规范

### 分支策略

```
main (生产)
  ↓
develop (开发)
  ↓
feature/xxx (功能)
  ↓
bugfix/xxx (修复)
```

### 分支命名

| 类型 | 格式 | 示例 |
|------|------|------|
| **功能** | `feature/描述` | `feature/add-search` |
| **修复** | `bugfix/描述` | `bugfix/fix-login` |
| **优化** | `refactor/描述` | `refactor/split-css` |
| **文档** | `docs/描述` | `docs/update-readme` |
| **测试** | `test/描述` | `test/add-unit-tests` |

### Commit 规范

#### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| **feat** | 新功能 | `feat(ui): 添加搜索框` |
| **fix** | 修复 bug | `fix(api): 修复登录失败` |
| **refactor** | 重构 | `refactor(ui): 拆分大文件` |
| **style** | 样式调整 | `style(ui): 调整按钮样式` |
| **docs** | 文档更新 | `docs: 更新 README` |
| **test** | 测试相关 | `test: 添加单元测试` |
| **chore** | 构建/工具 | `chore: 更新依赖` |
| **perf** | 性能优化 | `perf: 优化列表渲染` |

#### 示例

```bash
# 好的 commit
feat(ui-zh-CN): 添加会话搜索功能

- 添加搜索框组件
- 实现搜索过滤逻辑
- 添加搜索结果高亮

Closes #123

# 差的 commit
update code
fix bug
修改
```

### Pull Request 规范

#### PR 标题

```
<type>(<scope>): <description>
```

#### PR 描述模板

```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档更新

## 变更说明
简要描述本次变更的内容和原因

## 测试
- [ ] 单元测试通过
- [ ] 手动测试通过
- [ ] 无回归问题

## 截图
（如有 UI 变更，请提供截图）

## 相关 Issue
Closes #123
```

---

## 📝 文档规范

### Markdown 规范

#### 标题层级

```markdown
# 一级标题（文档标题）
## 二级标题（章节）
### 三级标题（小节）
#### 四级标题（细节）
```

#### 代码块

```markdown
<!-- ✅ 好：指定语言 -->
```typescript
function hello() {
  console.log("Hello");
}
```

<!-- ❌ 差：不指定语言 -->
```
function hello() {
  console.log("Hello");
}
```
```

#### 表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 值1 | 值2 | 值3 |
```

### JSDoc 规范

```typescript
/**
 * 渲染按钮组件
 * 
 * @param props - 按钮属性
 * @param props.label - 按钮文字
 * @param props.onClick - 点击事件
 * @param props.variant - 按钮变体（默认 "primary"）
 * @returns Lit 模板结果
 * 
 * @example
 * ```typescript
 * renderButton({
 *   label: "保存",
 *   onClick: handleSave,
 *   variant: "primary"
 * });
 * ```
 */
export function renderButton(props: ButtonProps): TemplateResult {
  // ...
}
```

---

## 🧪 测试规范

### 测试文件命名

```
src/utils/format.ts → src/utils/__tests__/format.test.ts
```

### 测试结构

```typescript
describe('Component/Function Name', () => {
  // Setup
  beforeEach(() => {
    // 初始化
  });
  
  // Happy Path
  describe('正常情况', () => {
    it('should work correctly', () => {
      // 测试
    });
  });
  
  // Edge Cases
  describe('边界情况', () => {
    it('should handle empty input', () => {
      // 测试
    });
  });
  
  // Error Cases
  describe('错误情况', () => {
    it('should throw error on invalid input', () => {
      // 测试
    });
  });
  
  // Cleanup
  afterEach(() => {
    // 清理
  });
});
```

### 测试命名

```typescript
// ✅ 好：描述性命名
it('should merge two objects correctly', () => { });
it('should handle null values', () => { });
it('should throw error on invalid input', () => { });

// ❌ 差：模糊命名
it('test1', () => { });
it('works', () => { });
```

---

## 👀 Code Review 规范

### Review 清单

#### 代码质量
- [ ] 代码符合规范
- [ ] 无明显性能问题
- [ ] 无安全漏洞
- [ ] 错误处理完善

#### 测试
- [ ] 有单元测试
- [ ] 测试覆盖关键路径
- [ ] 测试通过

#### 文档
- [ ] 有 JSDoc 注释
- [ ] 复杂逻辑有说明
- [ ] README 已更新

#### Git
- [ ] Commit 信息清晰
- [ ] 无多余文件
- [ ] 无敏感信息

### Review 评论

```markdown
<!-- ✅ 好：建设性意见 -->
建议使用 `Array.filter()` 代替 `for` 循环，代码更简洁：
```typescript
const filtered = items.filter(item => item.active);
```

<!-- ❌ 差：不友好评论 -->
这代码写得太烂了！
```

---

## 🚀 发布规范

### 版本号

遵循语义化版本 (Semantic Versioning):

```
主版本号.次版本号.修订号

1.0.0 → 1.0.1 (修复 bug)
1.0.1 → 1.1.0 (新功能)
1.1.0 → 2.0.0 (破坏性变更)
```

### 发布流程

```bash
# 1. 更新版本号
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# 2. 更新 CHANGELOG
nano CHANGELOG.md

# 3. 提交变更
git add .
git commit -m "chore: release v1.0.1"

# 4. 打标签
git tag v1.0.1

# 5. 推送
git push origin main --tags

# 6. 发布
npm publish
```

### CHANGELOG 格式

```markdown
# Changelog

## [1.0.1] - 2026-02-07

### Added
- 添加会话搜索功能

### Fixed
- 修复配置保存失败的问题

### Changed
- 优化列表渲染性能

### Removed
- 移除废弃的 API
```

---

## 📋 检查清单

### 提交前检查

- [ ] 代码符合规范
- [ ] 测试通过
- [ ] 文档已更新
- [ ] Commit 信息清晰
- [ ] 无敏感信息
- [ ] 无调试代码

### 发布前检查

- [ ] 版本号已更新
- [ ] CHANGELOG 已更新
- [ ] 测试全部通过
- [ ] 文档已同步
- [ ] 无已知 bug
- [ ] 性能测试通过

---

## 🛠️ 工具配置

### ESLint

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### Prettier

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Husky

```bash
# .husky/pre-commit
#!/bin/sh
pnpm lint
pnpm test
```

---

*文档生成时间: 2026-02-07*
