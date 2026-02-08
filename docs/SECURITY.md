# ui-zh-CN 安全设计文档

> 最后更新: 2026-02-07  
> 分析版本: v3.0

## 📋 目录

- [安全架构](#安全架构)
- [威胁模型](#威胁模型)
- [安全机制](#安全机制)
- [权限管理](#权限管理)
- [数据安全](#数据安全)
- [安全最佳实践](#安全最佳实践)
- [安全审计](#安全审计)

---

## 🏗️ 安全架构

### 分层安全模型

```
┌─────────────────────────────────────────────────────────┐
│  第一层：网络访问控制                                      │
│  - Gateway 认证（token/password）                        │
│  - 绑定模式限制（loopback/LAN/public）                    │
│  - HTTPS 加密传输                                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  第二层：命令执行权限                                      │
│  - deny/allowlist/full 安全模式                          │
│  - 用户确认机制                                          │
│  - Agent 级别配置                                        │
│  - 命令白名单/黑名单                                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  第三层：工具权限                                         │
│  - 预设档案（最小权限原则）                               │
│  - 分组控制（文件系统、网络、系统等）                      │
│  - 单工具禁用                                            │
│  - Agent 级别覆盖                                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  第四层：数据访问控制                                      │
│  - 工作区文件白名单                                       │
│  - 敏感信息保护（API Key、Token）                         │
│  - 配置文件权限                                          │
│  - 日志脱敏                                              │
└─────────────────────────────────────────────────────────┘
```

### 安全边界

| 边界 | 保护对象 | 威胁 | 防护措施 |
|------|----------|------|----------|
| **网络边界** | Gateway 服务 | 未授权访问 | 认证、绑定限制 |
| **执行边界** | 系统命令 | 恶意命令执行 | 白名单、用户确认 |
| **工具边界** | Agent 工具 | 权限滥用 | 工具权限控制 |
| **数据边界** | 配置文件 | 数据泄露 | 文件白名单、加密 |

---

## 🎯 威胁模型

### 威胁分类

#### 1. 网络攻击 🔴 高风险

**威胁**:
- 未授权访问 Gateway
- 中间人攻击（MITM）
- DDoS 攻击

**影响**:
- 配置被篡改
- 敏感信息泄露
- 服务不可用

**防护措施**:
- ✅ Gateway 认证（token/password）
- ✅ 绑定模式限制（loopback/LAN）
- ⚠️ HTTPS 加密（建议启用）
- ⚠️ 速率限制（待实现）

---

#### 2. 命令注入 🔴 高风险

**威胁**:
- 恶意命令执行
- 系统文件访问
- 权限提升

**影响**:
- 系统被控制
- 数据被窃取
- 服务被破坏

**防护措施**:
- ✅ 命令白名单
- ✅ 用户确认机制
- ✅ 安全模式（deny/allowlist/full）
- ✅ 参数过滤

**示例**:
```typescript
// 危险：直接执行用户输入
exec(`rm -rf ${userInput}`);  // ❌ 命令注入风险

// 安全：白名单验证
const allowedCommands = ['ls', 'cat', 'grep'];
if (!allowedCommands.includes(command)) {
  throw new Error('命令不在白名单中');
}
```

---

#### 3. 配置篡改 🟡 中风险

**威胁**:
- 配置被恶意修改
- 权限被提升
- 后门被植入

**影响**:
- 系统行为异常
- 安全策略失效
- 数据泄露

**防护措施**:
- ✅ 配置文件权限控制
- ✅ 配置验证
- ⚠️ 配置审计日志（待实现）
- ⚠️ 配置回滚（待实现）

---

#### 4. 敏感信息泄露 🟡 中风险

**威胁**:
- API Key 泄露
- Token 泄露
- 密码泄露

**影响**:
- 第三方服务被滥用
- 账号被盗用
- 经济损失

**防护措施**:
- ✅ 密码字段（type="password"）
- ✅ 日志脱敏
- ⚠️ 加密存储（待实现）
- ⚠️ 定期轮换（建议）

---

#### 5. XSS 攻击 🟢 低风险

**威胁**:
- 恶意脚本注入
- Cookie 窃取
- 会话劫持

**影响**:
- 用户数据泄露
- 操作被劫持

**防护措施**:
- ✅ Lit 自动转义
- ✅ CSP 策略（Content Security Policy）
- ✅ 输入验证

**示例**:
```typescript
// Lit 自动转义，防止 XSS
html`<div>${userInput}</div>`  // ✅ 安全

// 危险：使用 unsafeHTML
html`<div>${unsafeHTML(userInput)}</div>`  // ❌ XSS 风险
```

---

## 🔒 安全机制

### 1. Gateway 认证

**认证方式**:
- **Token 认证**: 随机生成的 token
- **密码认证**: 用户设置的密码
- **无认证**: 仅限 loopback 模式

**配置**:
```typescript
// Gateway 配置
{
  gateway: {
    bind: "loopback",  // loopback/LAN/public
    port: 19000,
    auth: {
      enabled: true,
      token: "random-token-here",  // 或
      password: "user-password"
    }
  }
}
```

**安全建议**:
- ✅ 生产环境必须启用认证
- ✅ Token 定期轮换
- ✅ 密码使用强密码
- ⚠️ 避免在公网暴露

---

### 2. 绑定模式

| 模式 | 绑定地址 | 访问范围 | 安全级别 | 适用场景 |
|------|----------|----------|----------|----------|
| **loopback** | 127.0.0.1 | 仅本机 | 🟢 高 | 本地开发 |
| **LAN** | 0.0.0.0 | 局域网 | 🟡 中 | 团队协作 |
| **public** | 0.0.0.0 | 公网 | 🔴 低 | 不推荐 |

**安全建议**:
- ✅ 默认使用 loopback
- ✅ LAN 模式必须启用认证
- ❌ 避免使用 public 模式
- ✅ 使用反向代理（Nginx）+ HTTPS

---

### 3. 命令执行权限

#### 安全模式

| 模式 | 说明 | 安全级别 | 适用场景 |
|------|------|----------|----------|
| **deny** | 拒绝所有命令 | 🟢 最高 | 生产环境 |
| **allowlist** | 仅允许白名单命令 | 🟡 中 | 受控环境 |
| **full** | 允许所有命令 | 🔴 最低 | 开发环境 |

**配置**:
```typescript
// Agent 配置
{
  agents: {
    defaults: {
      exec: {
        security: "allowlist",  // deny/allowlist/full
        ask: "on-miss",         // off/on-miss/always
        allowlist: [
          "ls", "cat", "grep", "find",
          "git status", "git diff"
        ]
      }
    }
  }
}
```

**安全建议**:
- ✅ 生产环境使用 deny 或 allowlist
- ✅ 白名单尽可能精确
- ✅ 启用用户确认（ask: "on-miss"）
- ❌ 避免使用 full 模式

---

#### 用户确认机制

**确认模式**:
- **off**: 不确认，直接执行
- **on-miss**: 白名单外的命令需确认
- **always**: 所有命令都需确认

**流程**:
```
用户请求 → Agent 解析 → 检查白名单
                              ↓
                        在白名单？
                        ↙        ↘
                      是          否
                      ↓           ↓
                   直接执行    需要确认
                              ↓
                        用户确认？
                        ↙        ↘
                      是          否
                      ↓           ↓
                    执行        拒绝
```

---

### 4. 工具权限

#### 预设档案

| 档案 | 说明 | 权限范围 | 适用场景 |
|------|------|----------|----------|
| **minimal** | 最小权限 | 仅基础工具 | 生产环境 |
| **standard** | 标准权限 | 常用工具 | 日常使用 |
| **developer** | 开发权限 | 开发工具 | 开发环境 |
| **full** | 完全权限 | 所有工具 | 测试环境 |

**配置**:
```typescript
// 工具权限配置
{
  tools: {
    profile: "standard",  // minimal/standard/developer/full
    
    // 全局禁用
    disabled: ["exec", "gateway"],
    
    // 分组控制
    groups: {
      filesystem: { enabled: true },
      network: { enabled: true },
      system: { enabled: false }
    },
    
    // Agent 级别覆盖
    agents: {
      "dev-agent": {
        profile: "developer",
        disabled: []
      }
    }
  }
}
```

#### 工具分组

| 分组 | 工具 | 风险级别 | 默认状态 |
|------|------|----------|----------|
| **filesystem** | read, write, exec | 🟡 中 | 启用 |
| **network** | web_search, web_fetch, browser | 🟢 低 | 启用 |
| **system** | exec, gateway, nodes | 🔴 高 | 禁用 |
| **messaging** | message, tts, voice_call | 🟢 低 | 启用 |
| **data** | memory_search, memory_get | 🟢 低 | 启用 |

---

## 🗄️ 数据安全

### 1. 敏感信息保护

#### 敏感字段

| 字段 | 类型 | 保护措施 |
|------|------|----------|
| **API Key** | 密码 | type="password" |
| **Token** | 密码 | type="password" |
| **Password** | 密码 | type="password" |
| **Secret** | 密码 | type="password" |

**实现**:
```typescript
// 密码字段
renderFormField({
  label: "API Key",
  value: apiKey,
  onChange: setApiKey,
  type: "password",  // 隐藏输入
  required: true
});

// 日志脱敏
function sanitizeLog(message: string): string {
  return message
    .replace(/api[_-]?key[=:]\s*[\w-]+/gi, 'api_key=***')
    .replace(/token[=:]\s*[\w-]+/gi, 'token=***')
    .replace(/password[=:]\s*[\w-]+/gi, 'password=***');
}
```

---

### 2. 配置文件安全

#### 文件权限

| 文件 | 权限 | 说明 |
|------|------|------|
| `config.json` | 600 | 仅所有者可读写 |
| `workspace/` | 700 | 仅所有者可访问 |
| `extensions/` | 755 | 所有者可写，其他可读 |

**安全建议**:
```bash
# 设置配置文件权限
chmod 600 config.json

# 设置工作区权限
chmod 700 workspace/

# 检查权限
ls -la config.json
```

---

### 3. 工作区文件白名单

**允许访问的文件**:
```typescript
const WORKSPACE_FILE_WHITELIST = [
  // 身份文件
  "IDENTITY.md",
  "SOUL.md",
  "USER.md",
  
  // 配置文件
  "AGENTS.md",
  "TOOLS.md",
  "BOOTSTRAP.md",
  
  // 记忆文件
  "MEMORY.md",
  "HEARTBEAT.md",
  
  // 自定义文件
  "*.md"  // 仅 Markdown 文件
];
```

**安全检查**:
```typescript
function isAllowedFile(filename: string): boolean {
  return WORKSPACE_FILE_WHITELIST.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(filename);
    }
    return filename === pattern;
  });
}

// 使用
if (!isAllowedFile(filename)) {
  throw new Error('文件不在白名单中');
}
```

---

### 4. 数据传输安全

#### WebSocket 安全

**当前状态**: 使用 WebSocket (ws://)

**安全建议**:
- ⚠️ 生产环境使用 WSS (wss://)
- ✅ 启用 Gateway 认证
- ✅ 限制绑定地址

**配置**:
```typescript
// 使用 WSS
const client = new GatewayBrowserClient({
  url: "wss://localhost:19000",  // 使用 wss://
  token: "your-token-here"
});
```

---

## 🛡️ 安全最佳实践

### 开发阶段

#### 1. 输入验证

```typescript
// ✅ 好：严格验证
function validatePort(port: number): boolean {
  return Number.isInteger(port) && port >= 1024 && port <= 65535;
}

// ❌ 差：不验证
function setPort(port: any) {
  config.port = port;  // 可能是非法值
}
```

---

#### 2. 输出转义

```typescript
// ✅ 好：Lit 自动转义
html`<div>${userInput}</div>`

// ❌ 差：手动拼接 HTML
element.innerHTML = `<div>${userInput}</div>`;  // XSS 风险
```

---

#### 3. 错误处理

```typescript
// ✅ 好：不泄露敏感信息
try {
  await client.request("config.apply", { config });
} catch (err) {
  showToast({ message: "保存失败，请重试", type: "error" });
  console.error("Config save error:", err);  // 仅在控制台
}

// ❌ 差：泄露错误详情
try {
  await client.request("config.apply", { config });
} catch (err) {
  showToast({ message: err.message, type: "error" });  // 可能泄露敏感信息
}
```

---

### 部署阶段

#### 1. 环境配置

```bash
# ✅ 好：使用环境变量
export GATEWAY_TOKEN=$(openssl rand -hex 32)
export GATEWAY_BIND=loopback

# ❌ 差：硬编码
GATEWAY_TOKEN=123456
GATEWAY_BIND=public
```

---

#### 2. 反向代理

```nginx
# Nginx 配置
server {
  listen 443 ssl;
  server_name openclaw.example.com;
  
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  location / {
    proxy_pass http://127.0.0.1:19000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

#### 3. 防火墙规则

```bash
# 仅允许本地访问
sudo ufw allow from 127.0.0.1 to any port 19000

# 允许局域网访问
sudo ufw allow from 192.168.1.0/24 to any port 19000

# 拒绝公网访问
sudo ufw deny from any to any port 19000
```

---

### 运维阶段

#### 1. 定期审计

**审计清单**:
- [ ] 检查 Gateway 认证是否启用
- [ ] 检查绑定模式是否合理
- [ ] 检查命令白名单是否过于宽松
- [ ] 检查工具权限是否最小化
- [ ] 检查配置文件权限
- [ ] 检查日志是否脱敏

---

#### 2. 安全更新

**更新策略**:
- ✅ 定期更新 OpenClaw
- ✅ 定期更新依赖库
- ✅ 订阅安全公告
- ✅ 及时修复漏洞

---

#### 3. 备份恢复

**备份内容**:
- 配置文件 (`config.json`)
- 工作区文件 (`workspace/`)
- 扩展文件 (`extensions/`)

**备份脚本**:
```bash
#!/bin/bash
BACKUP_DIR="backup/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

cp config.json "$BACKUP_DIR/"
cp -r workspace/ "$BACKUP_DIR/"
cp -r extensions/ "$BACKUP_DIR/"

echo "备份完成: $BACKUP_DIR"
```

---

## 🔍 安全审计

### 审计清单

#### 网络安全

- [ ] Gateway 认证已启用
- [ ] 绑定模式设置合理（loopback/LAN）
- [ ] 使用 HTTPS/WSS 加密传输
- [ ] 配置防火墙规则
- [ ] 使用反向代理

#### 权限安全

- [ ] 命令执行使用 allowlist 模式
- [ ] 命令白名单精确
- [ ] 启用用户确认机制
- [ ] 工具权限使用预设档案
- [ ] 高风险工具已禁用

#### 数据安全

- [ ] 敏感字段使用密码类型
- [ ] 日志已脱敏
- [ ] 配置文件权限正确（600）
- [ ] 工作区文件白名单生效
- [ ] 定期备份配置

#### 代码安全

- [ ] 无 XSS 漏洞
- [ ] 无命令注入漏洞
- [ ] 输入验证完善
- [ ] 错误处理不泄露敏感信息
- [ ] 依赖库无已知漏洞

---

### 安全评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **网络安全** | ⭐⭐⭐⭐ | 认证完善，建议启用 HTTPS |
| **权限安全** | ⭐⭐⭐⭐⭐ | 三层权限控制，最小权限原则 |
| **数据安全** | ⭐⭐⭐⭐ | 敏感信息保护，建议加密存储 |
| **代码安全** | ⭐⭐⭐⭐⭐ | Lit 自动转义，输入验证完善 |

**总体评分**: ⭐⭐⭐⭐ (4/5)

**优势**:
- ✅ 三层权限控制
- ✅ 最小权限原则
- ✅ 输入验证完善
- ✅ 自动转义防 XSS

**待改进**:
- ⚠️ 建议启用 HTTPS/WSS
- ⚠️ 建议加密存储敏感信息
- ⚠️ 建议实现配置审计日志
- ⚠️ 建议实现速率限制

---

## 📝 安全事件响应

### 事件分类

| 级别 | 说明 | 响应时间 | 处理流程 |
|------|------|----------|----------|
| **P0** | 严重安全漏洞 | 立即 | 停服修复 |
| **P1** | 高风险漏洞 | 24h | 紧急修复 |
| **P2** | 中风险漏洞 | 7d | 计划修复 |
| **P3** | 低风险漏洞 | 30d | 常规修复 |

### 应急预案

#### 1. 发现漏洞

```
1. 记录漏洞详情
2. 评估影响范围
3. 确定严重级别
4. 通知相关人员
```

#### 2. 修复漏洞

```
1. 隔离受影响系统
2. 开发修复补丁
3. 测试修复效果
4. 部署修复补丁
```

#### 3. 事后总结

```
1. 分析根本原因
2. 更新安全策略
3. 改进开发流程
4. 发布安全公告
```

---

*文档生成时间: 2026-02-07*  
*下次更新: 安全审计后*
