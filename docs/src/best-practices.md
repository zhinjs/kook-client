---
layout: doc
---

# 最佳实践

本文档总结了使用 kook-client 开发 KOOK 机器人的最佳实践和建议。

## 项目结构

### 推荐的目录结构

```
my-kook-bot/
├── src/
│   ├── commands/          # 命令处理器
│   │   ├── admin.js
│   │   ├── fun.js
│   │   └── utility.js
│   ├── events/            # 事件处理器
│   │   ├── message.js
│   │   └── ready.js
│   ├── utils/             # 工具函数
│   │   ├── permissions.js
│   │   └── logger.js
│   ├── config/            # 配置文件
│   │   └── index.js
│   └── index.js           # 入口文件
├── data/                  # 数据存储
│   └── users.json
├── logs/                  # 日志文件
├── .env                   # 环境变量
├── .gitignore
├── package.json
└── README.md
```

### 模块化代码

将功能拆分成独立模块：

```javascript
// src/commands/ping.js
module.exports = {
  name: 'ping',
  description: '测试延迟',
  execute: async (event) => {
    const start = Date.now()
    await event.reply('Pong!')
    const latency = Date.now() - start
    await event.reply(`延迟: ${latency}ms`)
  }
}

// src/index.js
const fs = require('fs')
const path = require('path')
const {Client} = require('kook-client')

const client = new Client({
  token: process.env.KOOK_TOKEN,
  mode: 'websocket'
})

// 动态加载命令
const commands = new Map()
const commandFiles = fs.readdirSync('./src/commands')

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.set(command.name, command)
}

client.on('message.channel', async (event) => {
  const content = event.content.trim()
  if (!content.startsWith('/')) return
  
  const [commandName, ...args] = content.slice(1).split(/\s+/)
  const command = commands.get(commandName)
  
  if (command) {
    try {
      await command.execute(event, args)
    } catch (error) {
      console.error(`执行命令 ${commandName} 时出错:`, error)
      event.reply('命令执行失败，请稍后重试')
    }
  }
})

client.connect()
```

## 安全性

### 保护敏感信息

使用环境变量存储 Token 等敏感信息：

```javascript
// 使用 dotenv
require('dotenv').config()

const client = new Client({
  token: process.env.KOOK_TOKEN,
  mode: process.env.KOOK_MODE || 'websocket'
})
```

`.env` 文件示例：

```
KOOK_TOKEN=your_bot_token_here
KOOK_MODE=websocket
LOG_LEVEL=info
```

**重要**: 将 `.env` 添加到 `.gitignore`，不要提交到版本控制系统。

### 输入验证

始终验证用户输入：

```javascript
client.on('message.channel', (event) => {
  const content = event.content.trim()
  
  if (content.startsWith('/kick ')) {
    const userId = content.split(' ')[1]
    
    // 验证输入
    if (!userId || !/^\d+$/.test(userId)) {
      event.reply('无效的用户ID')
      return
    }
    
    // 执行操作
    // ...
  }
})
```

### 权限管理

实现完善的权限检查：

```javascript
// src/utils/permissions.js
class PermissionManager {
  constructor() {
    this.adminUsers = new Set()
    this.moderators = new Set()
  }
  
  isAdmin(userId) {
    return this.adminUsers.has(userId)
  }
  
  isModerator(userId) {
    return this.moderators.has(userId)
  }
  
  hasPermission(userId, level) {
    if (level === 'admin') return this.isAdmin(userId)
    if (level === 'moderator') return this.isAdmin(userId) || this.isModerator(userId)
    return true
  }
}

module.exports = new PermissionManager()

// 使用
const permissions = require('./utils/permissions')

client.on('message.channel', (event) => {
  if (event.content === '/admin-command') {
    if (!permissions.hasPermission(event.author_id, 'admin')) {
      event.reply('你没有权限执行此命令')
      return
    }
    // 执行管理员命令
  }
})
```

### 速率限制

防止滥用和刷屏：

```javascript
class RateLimiter {
  constructor(maxRequests = 5, timeWindow = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = new Map()
  }
  
  check(userId) {
    const now = Date.now()
    const userRequests = this.requests.get(userId) || []
    
    // 移除过期的请求记录
    const validRequests = userRequests.filter(time => now - time < this.timeWindow)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(userId, validRequests)
    return true
  }
  
  reset(userId) {
    this.requests.delete(userId)
  }
}

const limiter = new RateLimiter(5, 60000) // 每分钟最多5次

client.on('message.channel', (event) => {
  if (!limiter.check(event.author_id)) {
    event.reply('你的操作太频繁了，请稍后再试')
    return
  }
  
  // 处理消息
})
```

## 错误处理

### 全局错误捕获

```javascript
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  // 记录日志、发送通知等
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
  // 记录日志、发送通知等
})
```

### 优雅的错误处理

```javascript
client.on('message.channel', async (event) => {
  try {
    // 可能出错的操作
    const result = await someAsyncOperation()
    await event.reply(`结果: ${result}`)
  } catch (error) {
    console.error('操作失败:', error)
    
    // 根据错误类型返回不同的消息
    if (error.code === 'NETWORK_ERROR') {
      await event.reply('网络错误，请稍后重试')
    } else if (error.code === 'PERMISSION_DENIED') {
      await event.reply('权限不足')
    } else {
      await event.reply('操作失败，请联系管理员')
    }
  }
})
```

## 性能优化

### 缓存策略

缓存常用数据减少 API 调用：

```javascript
class DataCache {
  constructor(ttl = 300000) { // 默认5分钟
    this.cache = new Map()
    this.ttl = ttl
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl
    })
  }
  
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  clear() {
    this.cache.clear()
  }
}

const cache = new DataCache()

async function getUserInfo(userId) {
  // 先从缓存获取
  let userInfo = cache.get(`user:${userId}`)
  if (userInfo) return userInfo
  
  // 缓存未命中，从 API 获取
  userInfo = await client.pickUser(userId).getInfo()
  cache.set(`user:${userId}`, userInfo)
  
  return userInfo
}
```

### 异步操作

合理使用异步操作，避免阻塞：

```javascript
client.on('message.channel', async (event) => {
  // 不好的做法：同步等待
  // const data1 = await fetchData1()
  // const data2 = await fetchData2()
  // const data3 = await fetchData3()
  
  // 好的做法：并行执行
  const [data1, data2, data3] = await Promise.all([
    fetchData1(),
    fetchData2(),
    fetchData3()
  ])
  
  event.reply(`结果: ${data1}, ${data2}, ${data3}`)
})
```

### 资源清理

定期清理不需要的资源：

```javascript
// 定期清理缓存
setInterval(() => {
  cache.clear()
  console.log('缓存已清理')
}, 3600000) // 每小时清理一次
```

## 日志记录

### 结构化日志

```javascript
const winston = require('winston')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

client.on('message.channel', (event) => {
  logger.info('收到消息', {
    channelId: event.channel_id,
    userId: event.author_id,
    content: event.content
  })
})
```

## 测试

### 单元测试

```javascript
// tests/commands/ping.test.js
const { expect } = require('chai')
const pingCommand = require('../../src/commands/ping')

describe('Ping Command', () => {
  it('should respond with Pong', async () => {
    const mockEvent = {
      reply: async (msg) => {
        expect(msg).to.equal('Pong!')
      }
    }
    
    await pingCommand.execute(mockEvent)
  })
})
```

## 文档

### 代码注释

```javascript
/**
 * 获取用户权限等级
 * @param {string} userId - 用户ID
 * @returns {Promise<string>} 权限等级 (admin, moderator, user)
 */
async function getUserPermissionLevel(userId) {
  // 实现逻辑
}
```

### README 文档

项目应包含清晰的 README：

```markdown
# My KOOK Bot

一个功能强大的 KOOK 机器人。

## 功能

- 命令系统
- 权限管理
- 数据持久化

## 安装

\`\`\`bash
npm install
\`\`\`

## 配置

复制 `.env.example` 为 `.env` 并填入配置。

## 运行

\`\`\`bash
npm start
\`\`\`

## 许可

MIT
```

## 部署

### 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start src/index.js --name kook-bot

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs kook-bot

# 重启应用
pm2 restart kook-bot
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "src/index.js"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  bot:
    build: .
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
```

## 总结

遵循这些最佳实践可以帮助你：

- 编写更安全、更健壮的代码
- 提高机器人的性能和可维护性
- 简化部署和运维工作
- 更好地处理错误和异常情况

记住，这些只是建议，你应该根据实际需求调整和优化。

## 相关链接

- [快速开始](./guide/start.md)
- [API 文档](./module/client.md)
- [常见问题](./faq.md)
