---
layout: doc
---

# 频道消息事件

频道消息事件在机器人收到频道消息时触发。事件对象为 `ChannelMessageEvent` 类型。

## 监听频道消息事件

```javascript
const {Client} = require('kook-client')

const client = new Client({
  token: 'your-bot-token',
  mode: 'websocket'
})

client.on('message.channel', (event) => {
  console.log('频道:', event.channel_name)
  console.log('消息:', event.content)
  console.log('发送者:', event.author.username)
})

client.connect()
```

## 事件对象属性

ChannelMessageEvent 继承自 Message，包含以下特有属性：

| 属性名 | 类型 | 描述 |
|-------|------|------|
| message_type | 'channel' | 固定为 'channel' |
| channel_id | string | 频道ID |
| channel_name | string | 频道名称 |
| author | User | 发送者用户对象 |
| author_id | string | 发送者用户ID |
| message_id | string | 消息ID |
| content | string | 消息内容 |
| timestamp | number | 消息时间戳 |
| elements | MessageSegment[] | 消息段数组 |

## 事件对象方法

### channel

获取频道对象。

**类型**: Channel

```javascript
client.on('message.channel', (event) => {
  const channel = event.channel
  console.log('频道名称:', channel.name)
})
```

### reply(message, quote?)

在频道中回复消息。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| message | Sendable | true | 要发送的消息内容 |
| quote | boolean | false | 是否引用原消息，默认 false |

**返回值**: Promise\<Message.Ret>

```javascript
client.on('message.channel', (event) => {
  // 普通回复
  event.reply('收到！')
  
  // 引用回复
  event.reply('这是引用回复', true)
  
  // 发送复杂消息
  event.reply([
    { type: 'text', data: { text: '你好 ' } },
    { type: 'at', data: { user_id: event.author_id } }
  ])
})
```

### recall()

撤回频道消息。

**返回值**: Promise\<boolean>

```javascript
client.on('message.channel', async (event) => {
  // 检测违禁词
  if (event.content.includes('违禁词')) {
    await event.recall()
    await event.reply('检测到违禁内容，消息已撤回')
  }
})
```

### update(message)

更新频道消息内容。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| message | Sendable | true | 新的消息内容 |

**返回值**: Promise\<any>

```javascript
client.on('message.channel', async (event) => {
  if (event.content === '天气') {
    const msg = await event.reply('正在查询天气...')
    // 模拟API调用
    setTimeout(async () => {
      await event.update('今天天气晴朗，温度 25°C')
    }, 2000)
  }
})
```

### addReaction(emoji)

给频道消息添加表情反应。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| emoji | string | true | 表情符号 |

**返回值**: Promise\<any>

```javascript
client.on('message.channel', (event) => {
  // 自动点赞包含特定关键词的消息
  if (event.content.includes('感谢')) {
    event.addReaction('❤️')
  }
})
```

### deleteReaction(emoji, user_id?)

删除频道消息的表情反应。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| emoji | string | true | 表情符号 |
| user_id | string | false | 用户ID，不传则删除自己的反应 |

**返回值**: Promise\<any>

```javascript
client.on('message.channel', (event) => {
  // 删除自己的反应
  event.deleteReaction('👍')
  
  // 管理员删除他人的反应
  event.deleteReaction('👍', 'user_id')
})
```

### getReactions(emoji?)

获取频道消息的表情反应列表。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| emoji | string | false | 指定表情，不传则获取所有反应 |

**返回值**: Promise\<Reaction[]>

```javascript
client.on('message.channel', async (event) => {
  // 统计所有反应
  const reactions = await event.getReactions()
  console.log('反应总数:', reactions.length)
  
  // 统计特定反应
  const likes = await event.getReactions('👍')
  console.log('点赞数:', likes.length)
})
```

## 使用示例

### 命令机器人

```javascript
client.on('message.channel', async (event) => {
  const content = event.content.trim()
  
  // 只响应以 / 开头的命令
  if (!content.startsWith('/')) return
  
  const [command, ...args] = content.slice(1).split(/\s+/)
  
  switch (command) {
    case 'hello':
      await event.reply('Hello World!')
      break
      
    case 'help':
      await event.reply('可用命令:\n/hello - 打招呼\n/help - 显示帮助\n/roll - 掷骰子')
      break
      
    case 'roll':
      const num = Math.floor(Math.random() * 100) + 1
      await event.reply(`🎲 掷出了 ${num} 点！`, true)
      break
      
    default:
      await event.reply('未知命令，输入 /help 查看帮助')
  }
})
```

### At 消息处理

```javascript
client.on('message.channel', (event) => {
  // 检查是否 @ 了机器人
  const atBot = event.elements.some(
    seg => seg.type === 'at' && seg.data.user_id === event.client.self_id
  )
  
  if (atBot) {
    event.reply([
      { type: 'text', data: { text: '你好 ' } },
      { type: 'at', data: { user_id: event.author_id } },
      { type: 'text', data: { text: '，有什么可以帮你的吗？' } }
    ])
  }
})
```

### 消息过滤和管理

```javascript
client.on('message.channel', async (event) => {
  const content = event.content.toLowerCase()
  
  // 违禁词列表
  const bannedWords = ['违禁词1', '违禁词2', '违禁词3']
  
  // 检查是否包含违禁词
  const hasBannedWord = bannedWords.some(word => content.includes(word))
  
  if (hasBannedWord) {
    // 撤回消息
    await event.recall()
    
    // 发送警告
    await event.reply([
      { type: 'at', data: { user_id: event.author_id } },
      { type: 'text', data: { text: ' 请勿发送违规内容！' } }
    ])
  }
})
```

### 投票系统

```javascript
client.on('message.channel', async (event) => {
  const content = event.content.trim()
  
  if (content.startsWith('/vote ')) {
    const question = content.slice(6)
    
    // 发送投票消息
    const msg = await event.reply(`📊 投票: ${question}`)
    
    // 添加投票选项表情
    await event.addReaction('👍')
    await event.addReaction('👎')
    await event.addReaction('🤷')
    
    // 10秒后统计结果
    setTimeout(async () => {
      const thumbsUp = await event.getReactions('👍')
      const thumbsDown = await event.getReactions('👎')
      const shrug = await event.getReactions('🤷')
      
      await event.reply(
        `投票结果:\n` +
        `👍 赞成: ${thumbsUp.length - 1}\n` +
        `👎 反对: ${thumbsDown.length - 1}\n` +
        `🤷 弃权: ${shrug.length - 1}`
      )
    }, 10000)
  }
})
```

### 引用回复处理

```javascript
client.on('message.channel', (event) => {
  // 检查消息是否包含引用
  const quoteSegment = event.elements.find(seg => seg.type === 'quote')
  
  if (quoteSegment) {
    const quotedMsgId = quoteSegment.data.id
    console.log('引用的消息ID:', quotedMsgId)
    
    // 可以根据引用的消息做特殊处理
    event.reply('我看到你引用了一条消息')
  }
})
```

### 多媒体消息处理

```javascript
client.on('message.channel', (event) => {
  // 处理图片
  const imageSegment = event.elements.find(seg => seg.type === 'image')
  if (imageSegment) {
    console.log('收到图片:', imageSegment.data.url)
    event.addReaction('📷')
  }
  
  // 处理视频
  const videoSegment = event.elements.find(seg => seg.type === 'video')
  if (videoSegment) {
    console.log('收到视频:', videoSegment.data.url)
    event.addReaction('🎬')
  }
  
  // 处理音频
  const audioSegment = event.elements.find(seg => seg.type === 'audio')
  if (audioSegment) {
    console.log('收到音频:', audioSegment.data.url)
    event.addReaction('🎵')
  }
})
```

## 权限检查

```javascript
client.on('message.channel', async (event) => {
  // 只有管理员才能执行的命令
  if (event.content === '/clear') {
    // 获取服务器成员信息检查权限
    const member = event.guild?.pickMember(event.author_id)
    
    // 这里需要实现权限检查逻辑
    // if (member.hasPermission('MANAGE_MESSAGES')) {
    //   // 执行清理操作
    // }
  }
})
```

## 注意事项

1. 频道消息会被所有成员看到，注意消息内容的合规性
2. 机器人需要有相应的权限才能发送消息、撤回消息等
3. 使用 `quote` 参数可以实现消息引用，方便用户知道机器人在回复谁
4. 频道消息可能包含多种消息段，需要解析 `elements` 数组
5. 表情反应可以用于投票、互动等场景
6. 撤回消息通常有时间限制

## 相关链接

- [私聊事件](./private.md)
- [消息段](../segment/index.md)
- [频道模块](../module/channel.md)
- [用户模块](../module/user.md)
