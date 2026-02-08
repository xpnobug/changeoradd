# ui-zh-CN 故障排查手册

> 最后更新: 2026-02-07  
> 分析版本: v3.0

## 📋 目录

- [快速诊断](#快速诊断)
- [启动问题](#启动问题)
- [连接问题](#连接问题)
- [配置问题](#配置问题)
- [性能问题](#性能问题)
- [功能异常](#功能异常)
- [日志分析](#日志分析)
- [调试技巧](#调试技巧)

---

## 🚨 快速诊断

### 诊断流程

```
问题发生
    ↓
检查服务状态 → 服务未运行 → 查看启动日志 → 修复配置
    ↓
检查网络连接 → 连接失败 → 检查防火墙 → 调整规则
    ↓
检查配置文件 → 配置错误 → 验证语法 → 修正配置
    ↓
检查日志文件 → 发现错误 → 分析原因 → 解决问题
```

### 一键诊断脚本

```bash
#!/bin/bash
# openclaw-diagnose.sh

echo "=== OpenClaw 诊断工具 ==="

# 1. 检查服务状态
echo -e "\n[1/6] 检查服务状态..."
systemctl is-active openclaw && echo "✅ 服务运行中" || echo "❌ 服务未运行"

# 2. 检查端口
echo -e "\n[2/6] 检查端口..."
netstat -tuln | grep 19000 && echo "✅ 端口已监听" || echo "❌ 端口未监听"

# 3. 检查配置文件
echo -e "\n[3/6] 检查配置文件..."
node -e "JSON.parse(require('fs').readFileSync('config.json'))" && echo "✅ 配置文件有效" || echo "❌ 配置文件错误"

# 4. 检查 WebSocket
echo -e "\n[4/6] 检查 WebSocket..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:19000 | grep -q 200 && echo "✅ HTTP 可访问" || echo "❌ HTTP 不可访问"

# 5. 检查磁盘空间
echo -e "\n[5/6] 检查磁盘空间..."
df -h | grep -E "/$|/home" | awk '{if ($5+0 > 80) print "⚠️ 磁盘使用率:", $5; else print "✅ 磁盘空间充足:", $5}'

# 6. 检查内存
echo -e "\n[6/6] 检查内存..."
free -h | awk 'NR==2{if ($3/$2*100 > 80) print "⚠️ 内存使用率:", $3"/"$2; else print "✅ 内存充足:", $3"/"$2}'

echo -e "\n=== 诊断完成 ==="
```

---

## 🔴 启动问题

### 问题 1: 服务无法启动

**症状**:
```bash
$ systemctl start openclaw
Job for openclaw.service failed because the control process exited with error code.
```

**排查步骤**:

```bash
# 1. 查看详细日志
sudo journalctl -u openclaw -n 50 --no-pager

# 2. 检查配置文件
node -e "console.log(JSON.parse(require('fs').readFileSync('config.json')))"

# 3. 检查文件权限
ls -la config.json

# 4. 检查端口占用
sudo lsof -i :19000
```

**常见原因**:

| 原因 | 解决方案 |
|------|----------|
| 配置文件语法错误 | 使用 JSON 验证器检查 |
| 端口被占用 | 修改端口或停止占用进程 |
| 文件权限不足 | `chmod 600 config.json` |
| 依赖缺失 | `pnpm install` |
| Node.js 版本不兼容 | 升级到 22.20.0+ |

**解决方案**:

```bash
# 修复配置文件
nano config.json

# 修复权限
sudo chown openclaw:openclaw config.json
chmod 600 config.json

# 重启服务
sudo systemctl restart openclaw
```

---

### 问题 2: 启动后立即退出

**症状**:
```bash
$ systemctl status openclaw
Active: failed (Result: exit-code)
```

**排查步骤**:

```bash
# 查看退出原因
sudo journalctl -u openclaw -n 20 | grep -i error

# 手动启动查看错误
cd /home/openclaw/openclaw
node dist/gateway/index.js
```

**常见原因**:

| 原因 | 解决方案 |
|------|----------|
| 环境变量缺失 | 检查 `.env` 文件 |
| 数据库连接失败 | 检查数据库配置 |
| 依赖版本冲突 | 删除 `node_modules` 重新安装 |
| 内存不足 | 增加服务器内存 |

---

### 问题 3: 构建失败

**症状**:
```bash
$ pnpm build
ERROR: Build failed with 1 error
```

**排查步骤**:

```bash
# 清理缓存
pnpm store prune
rm -rf node_modules dist

# 重新安装
pnpm install

# 检查 Node.js 版本
node -v  # 应该是 22.20.0+

# 重新构建
pnpm build
```

---

## 🌐 连接问题

### 问题 4: WebSocket 连接失败

**症状**:
```
浏览器控制台: WebSocket connection to 'ws://localhost:19000' failed
```

**排查步骤**:

```bash
# 1. 检查服务是否运行
systemctl status openclaw

# 2. 检查端口监听
netstat -tuln | grep 19000

# 3. 测试 WebSocket
wscat -c ws://localhost:19000

# 4. 检查防火墙
sudo ufw status
```

**常见原因**:

| 原因 | 解决方案 |
|------|----------|
| Gateway 未运行 | 启动服务 |
| 端口未监听 | 检查绑定配置 |
| 防火墙阻止 | 开放端口 |
| Nginx 配置错误 | 检查 WebSocket 配置 |
| 浏览器缓存 | 清除缓存 |

**解决方案**:

```bash
# 开放防火墙端口
sudo ufw allow 19000/tcp

# 检查 Nginx WebSocket 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

### 问题 5: 认证失败

**症状**:
```
401 Unauthorized
```

**排查步骤**:

```bash
# 检查认证配置
grep -A 5 "auth" config.json

# 检查环境变量
echo $GATEWAY_TOKEN

# 测试认证
curl -H "Authorization: Bearer $GATEWAY_TOKEN" http://localhost:19000/health
```

**解决方案**:

```bash
# 生成新 token
openssl rand -hex 32

# 更新配置
nano config.json

# 重启服务
sudo systemctl restart openclaw
```

---

### 问题 6: CORS 错误

**症状**:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**排查步骤**:

```bash
# 检查 Gateway 配置
grep -A 5 "cors" config.json

# 检查 Nginx 配置
grep -A 5 "add_header" /etc/nginx/sites-available/openclaw
```

**解决方案**:

在 Nginx 配置中添加:

```nginx
add_header Access-Control-Allow-Origin "*" always;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
```

---

## ⚙️ 配置问题

### 问题 7: 配置不生效

**症状**:
修改配置后，行为未改变

**排查步骤**:

```bash
# 1. 检查配置文件位置
ls -la config.json

# 2. 检查配置是否被加载
grep "Loading config" /var/log/openclaw/gateway.log

# 3. 检查配置语法
node -e "console.log(JSON.parse(require('fs').readFileSync('config.json')))"

# 4. 重启服务
sudo systemctl restart openclaw
```

**常见原因**:

| 原因 | 解决方案 |
|------|----------|
| 未重启服务 | 重启 Gateway |
| 配置文件路径错误 | 检查工作目录 |
| 配置被环境变量覆盖 | 检查 `.env` |
| 配置缓存 | 清除缓存 |

---

### 问题 8: 模型配置错误

**症状**:
```
Error: Model not found: openai/gpt-4
```

**排查步骤**:

```bash
# 检查供应商配置
jq '.models.providers' config.json

# 检查模型 ID
jq '.agents.defaults.model' config.json

# 测试 API Key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

**解决方案**:

```json
{
  "models": {
    "providers": {
      "openai": {
        "baseURL": "https://api.openai.com/v1",
        "apiKey": "sk-your-api-key",
        "models": {
          "gpt-4": {
            "id": "gpt-4",
            "name": "GPT-4"
          }
        }
      }
    }
  }
}
```

---

### 问题 9: 权限配置不生效

**症状**:
命令仍然被执行，即使设置了 `security: "deny"`

**排查步骤**:

```bash
# 检查权限配置
jq '.agents.defaults.exec' config.json

# 检查 Agent 级别覆盖
jq '.agents.list[0].exec' config.json
```

**解决方案**:

确保配置正确:

```json
{
  "agents": {
    "defaults": {
      "exec": {
        "security": "allowlist",
        "ask": "on-miss",
        "allowlist": ["ls", "cat", "grep"]
      }
    }
  }
}
```

---

## 🐌 性能问题

### 问题 10: 响应慢

**症状**:
请求响应时间 >5 秒

**排查步骤**:

```bash
# 1. 检查 CPU 使用率
top -p $(pgrep -f "node.*gateway")

# 2. 检查内存使用
free -h

# 3. 检查磁盘 I/O
iostat -x 1 5

# 4. 检查网络延迟
ping -c 10 api.openai.com

# 5. 分析慢请求
grep "duration" /var/log/openclaw/gateway.log | awk '$NF > 5000'
```

**常见原因**:

| 原因 | 解决方案 |
|------|----------|
| CPU 不足 | 增加 CPU 核心 |
| 内存不足 | 增加内存 |
| 磁盘 I/O 慢 | 使用 SSD |
| 网络延迟高 | 使用 CDN |
| 并发请求过多 | 限制并发数 |

**优化方案**:

```json
{
  "gateway": {
    "maxConnections": 100,
    "requestTimeout": 30000
  }
}
```

---

### 问题 11: 内存泄漏

**症状**:
内存使用持续增长，最终 OOM

**排查步骤**:

```bash
# 监控内存使用
watch -n 1 'ps aux | grep "node.*gateway"'

# 生成堆快照
node --inspect dist/gateway/index.js

# 使用 Chrome DevTools 分析
chrome://inspect
```

**解决方案**:

```bash
# 限制内存使用
node --max-old-space-size=4096 dist/gateway/index.js

# 定期重启服务
# 在 systemd 中添加
RuntimeMaxSec=86400
```

---

### 问题 12: 高并发问题

**症状**:
并发请求时，部分请求失败

**排查步骤**:

```bash
# 检查连接数
netstat -an | grep 19000 | wc -l

# 检查文件描述符限制
ulimit -n

# 压力测试
ab -n 1000 -c 100 http://localhost:19000/health
```

**解决方案**:

```bash
# 增加文件描述符限制
echo "openclaw soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "openclaw hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# 重启服务
sudo systemctl restart openclaw
```

---

## 🐛 功能异常

### 问题 13: 配置保存失败

**症状**:
点击"保存配置"后，配置未生效

**排查步骤**:

```bash
# 检查文件权限
ls -la config.json

# 检查磁盘空间
df -h

# 查看错误日志
grep "config.apply" /var/log/openclaw/gateway.log | tail -20
```

**解决方案**:

```bash
# 修复权限
sudo chown openclaw:openclaw config.json
chmod 600 config.json

# 清理磁盘空间
sudo apt clean
sudo journalctl --vacuum-time=7d
```

---

### 问题 14: 会话列表为空

**症状**:
会话管理页面显示"暂无会话"

**排查步骤**:

```bash
# 检查会话目录
ls -la ~/.openclaw/sessions/

# 检查 RPC 请求
grep "sessions.list" /var/log/openclaw/gateway.log

# 手动测试 RPC
wscat -c ws://localhost:19000
> {"method": "sessions.list", "params": {}}
```

**解决方案**:

```bash
# 创建测试会话
curl -X POST http://localhost:19000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"name": "test-session"}'
```

---

### 问题 15: 技能安装失败

**症状**:
```
Error: Failed to install skill: weather
```

**排查步骤**:

```bash
# 检查技能目录
ls -la ~/.openclaw/skills/

# 检查网络连接
curl -I https://clawhub.com

# 查看详细错误
grep "skill.*install" /var/log/openclaw/gateway.log
```

**解决方案**:

```bash
# 手动安装技能
cd ~/.openclaw/skills/
git clone https://github.com/openclaw/skill-weather.git weather

# 重启服务
sudo systemctl restart openclaw
```

---

## 📝 日志分析

### 日志位置

| 日志类型 | 位置 | 说明 |
|----------|------|------|
| **Gateway 日志** | `/var/log/openclaw/gateway.log` | 主日志 |
| **Systemd 日志** | `journalctl -u openclaw` | 系统日志 |
| **Nginx 日志** | `/var/log/nginx/openclaw-*.log` | 代理日志 |
| **错误日志** | `/var/log/openclaw/error.log` | 错误日志 |

### 日志级别

```
TRACE < DEBUG < INFO < WARN < ERROR < FATAL
```

### 常用日志命令

```bash
# 实时查看日志
tail -f /var/log/openclaw/gateway.log

# 查看最近 100 行
tail -100 /var/log/openclaw/gateway.log

# 查看错误日志
grep ERROR /var/log/openclaw/gateway.log

# 统计错误类型
grep ERROR /var/log/openclaw/gateway.log | awk '{print $5}' | sort | uniq -c

# 查看慢请求
grep "duration" /var/log/openclaw/gateway.log | awk '$NF > 1000'

# 按时间过滤
grep "2026-02-07 19:" /var/log/openclaw/gateway.log
```

### 日志分析脚本

```bash
#!/bin/bash
# analyze-logs.sh

LOG_FILE="/var/log/openclaw/gateway.log"

echo "=== 日志分析报告 ==="

# 1. 错误统计
echo -e "\n[错误统计]"
grep ERROR "$LOG_FILE" | awk '{print $5}' | sort | uniq -c | sort -rn | head -10

# 2. 慢请求
echo -e "\n[慢请求 TOP 10]"
grep "duration" "$LOG_FILE" | awk '{print $NF, $0}' | sort -rn | head -10

# 3. 请求统计
echo -e "\n[请求统计]"
grep "RPC request" "$LOG_FILE" | awk '{print $6}' | sort | uniq -c | sort -rn

# 4. 平均响应时间
echo -e "\n[平均响应时间]"
grep "duration" "$LOG_FILE" | awk '{sum+=$NF; count++} END {print sum/count "ms"}'
```

---

## 🔍 调试技巧

### 启用调试模式

```bash
# 设置日志级别
export LOG_LEVEL=debug

# 启动服务
node dist/gateway/index.js
```

### 使用 Chrome DevTools

```bash
# 启动调试模式
node --inspect dist/gateway/index.js

# 打开 Chrome
chrome://inspect
```

### 使用 VS Code 调试

创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Gateway",
      "program": "${workspaceFolder}/dist/gateway/index.js",
      "env": {
        "LOG_LEVEL": "debug"
      }
    }
  ]
}
```

### 网络抓包

```bash
# 使用 tcpdump
sudo tcpdump -i any -w openclaw.pcap port 19000

# 使用 Wireshark 分析
wireshark openclaw.pcap
```

---

## 📞 获取帮助

### 提交 Issue

包含以下信息:

1. **系统信息**
```bash
uname -a
node -v
pnpm -v
```

2. **错误日志**
```bash
tail -100 /var/log/openclaw/gateway.log
```

3. **配置文件** (脱敏)
```bash
jq 'del(.models.providers[].apiKey)' config.json
```

4. **复现步骤**
- 详细描述操作步骤
- 预期结果 vs 实际结果

### 社区支持

- **GitHub**: https://github.com/openclaw/openclaw/issues
- **Discord**: https://discord.com/invite/clawd
- **文档**: https://docs.openclaw.ai

---

*文档生成时间: 2026-02-07*  
*下次更新: 根据用户反馈*
