---
layout: doc
---

# 常见问题 (FAQ)

## 安装和配置

### 如何安装 kook-client？

使用 npm 或其他包管理器安装：

```bash
npm install kook-client
# 或
yarn add kook-client
# 或
pnpm install kook-client
```

### 支持哪些 Node.js 版本？

kook-client 要求 Node.js 版本 >= 16。建议使用 LTS 版本以获得更好的稳定性。

### 如何获取机器人 Token？

1. 访问 [KOOK 开发者平台](https://developer.kookapp.cn/)
2. 创建或选择一个应用
3. 在应用详情页获取 Bot Token

### WebSocket 和 Webhook 模式有什么区别？

- **WebSocket**: 机器人主动连接到 KOOK 服务器，适合大多数场景，配置简单
- **Webhook**: KOOK 服务器主动推送事件到你的服务器，需要配置公网 URL，适合有固定服务器的场景

推荐使用 WebSocket 模式，更加简单易用。

## 消息处理

### 如何判断消息是否 @ 了机器人？

检查消息中是否包含 at 类型的消息段，并且 user_id 匹配机器人：

```javascript
client.on('message.channel', (event) => {
  const atBot = event.elements.some(
    seg => seg.type === 'at' && seg.data.user_id === client.self_id
  )
  
  if (atBot) {
    event.reply('你 @ 了我！')
  }
})
```

### 如何发送图片？

使用图片消息段：

```javascript
// 使用 URL
event.reply({
  type: 'image',
  data: { url: 'https://example.com/image.jpg' }
})

// 使用本地文件（需要先上传）
// 具体实现依赖于 KOOK API
```

### 为什么机器人收不到消息？

检查以下几点：

1. Token 是否正确
2. 机器人是否已经加入服务器
3. 是否正确监听了事件 (`message.channel` 或 `message.private`)
4. 检查 `ignore` 配置，确保没有忽略相关消息
5. 查看控制台是否有错误信息

### 如何实现命令系统？

推荐的命令处理模式：

```javascript
client.on('message.channel', (event) => {
  const content = event.content.trim()
  
  // 只处理以 / 开头的消息
  if (!content.startsWith('/')) return
  
  // 解析命令和参数
  const [command, ...args] = content.slice(1).split(/\s+/)
  
  switch (command) {
    case 'help':
      event.reply('帮助信息...')
      break
    case 'ping':
      event.reply('Pong!')
      break
    // 更多命令...
  }
})
```

## 错误处理

### 如何处理 API 请求失败？

使用 try-catch 捕获错误：

```javascript
client.on('message.channel', async (event) => {
  try {
    await event.reply('Hello!')
  } catch (error) {
    console.error('发送消息失败:', error)
    // 可以尝试重试或通知管理员
  }
})
```

### 机器人频繁掉线怎么办？

1. 检查网络连接是否稳定
2. 查看是否有未捕获的异常导致程序崩溃
3. 检查日志中的错误信息
4. 可以设置 `maxRetry` 参数增加重连次数

### 如何调试机器人？

1. 设置日志级别为 debug：

```javascript
const client = new Client({
  token: 'your-token',
  mode: 'websocket',
  logLevel: 'debug'
})
```

2. 监听错误事件：

```javascript
client.on('error', (error) => {
  console.error('发生错误:', error)
})
```

3. 使用 Node.js 调试工具：

```bash
node --inspect your-bot.js
```

## 性能优化

### 如何提高机器人响应速度？

1. 使用异步操作，避免阻塞
2. 对于耗时操作，先快速回复用户，再更新消息
3. 缓存常用数据，减少 API 调用
4. 使用消息队列处理大量消息

### 机器人内存占用过高怎么办？

1. 定期清理不需要的缓存数据
2. 避免保存大量历史消息
3. 使用流式处理大文件
4. 监控内存使用，及时发现内存泄漏

### 如何处理高并发消息？

```javascript
const messageQueue = []
let processing = false

client.on('message.channel', async (event) => {
  messageQueue.push(event)
  
  if (!processing) {
    processing = true
    while (messageQueue.length > 0) {
      const msg = messageQueue.shift()
      await handleMessage(msg)
    }
    processing = false
  }
})
```

## 功能实现

### 如何实现权限检查？

```javascript
const ADMIN_USERS = ['admin_user_id_1', 'admin_user_id_2']

client.on('message.channel', (event) => {
  if (event.content === '/admin') {
    if (!ADMIN_USERS.includes(event.author_id)) {
      event.reply('你没有权限执行此命令')
      return
    }
    // 执行管理员命令
  }
})
```

### 如何实现定时任务？

```javascript
const schedule = require('node-schedule')

// 每天 9 点发送消息
schedule.scheduleJob('0 9 * * *', async () => {
  await client.sendChannelMsg(channel_id, '早上好！')
})
```

### 如何持久化数据？

可以使用多种方式：

1. **JSON 文件**:

```javascript
const fs = require('fs')

// 保存数据
function saveData(data) {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2))
}

// 读取数据
function loadData() {
  if (fs.existsSync('data.json')) {
    return JSON.parse(fs.readFileSync('data.json', 'utf-8'))
  }
  return {}
}
```

2. **数据库**: SQLite, MongoDB, MySQL 等

3. **KV 存储**: Redis 等

### 如何实现多语言支持？

```javascript
const messages = {
  'zh-CN': {
    hello: '你好',
    goodbye: '再见'
  },
  'en-US': {
    hello: 'Hello',
    goodbye: 'Goodbye'
  }
}

function getMessage(key, lang = 'zh-CN') {
  return messages[lang]?.[key] || key
}

client.on('message.channel', (event) => {
  const userLang = getUserLanguage(event.author_id) // 自定义函数
  event.reply(getMessage('hello', userLang))
})
```

## 部署相关

### 如何部署机器人？

1. **本地运行**: 直接使用 `node` 命令运行
2. **使用 PM2**: 进程管理工具，支持自动重启

```bash
npm install -g pm2
pm2 start bot.js --name "kook-bot"
pm2 save
```

3. **Docker**: 容器化部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "bot.js"]
```

4. **云服务**: 部署到云服务器（阿里云、腾讯云等）

### 如何保持机器人 24 小时运行？

1. 使用 PM2 等进程管理工具
2. 使用 Docker + 自动重启策略
3. 使用系统服务（systemd）
4. 使用云函数（Serverless）配合 Webhook 模式

### 如何实现热重载？

开发环境可以使用 nodemon：

```bash
npm install -g nodemon
nodemon bot.js
```

生产环境建议使用 PM2 的热重载功能：

```bash
pm2 reload bot
```

## 其他问题

### kook-client 是官方 SDK 吗？

kook-client 是社区开发的第三方 SDK，不是 KOOK 官方提供的。

### 如何贡献代码？

访问 [GitHub 仓库](https://github.com/zhinjs/kook-client) 提交 Issue 或 Pull Request。

### 在哪里获取帮助？

1. 查看 [文档](/)
2. 在 [GitHub Issues](https://github.com/zhinjs/kook-client/issues) 提问
3. 加入 QQ 群：446290761

### 可以商用吗？

可以。kook-client 使用 MIT 协议，允许商业使用。

## 更多问题

如果你的问题没有在这里找到答案，欢迎：

- 查看 [API 文档](/module/client)
- 在 [GitHub](https://github.com/zhinjs/kook-client/issues) 提出 Issue
- 加入社区群组交流
