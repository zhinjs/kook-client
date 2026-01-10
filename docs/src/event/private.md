---
layout: doc
---

# 私聊事件

私聊事件在机器人收到私聊消息时触发。事件对象为 `PrivateMessageEvent` 类型。

## 监听私聊事件

```javascript
const {Client} = require('kook-client')

const client = new Client({
  token: 'your-bot-token',
  mode: 'websocket'
})

client.on('message.private', (event) => {
  console.log('收到私聊消息:', event.content)
  console.log('发送者:', event.author.username)
})

client.connect()
```

## 事件对象属性

PrivateMessageEvent 继承自 Message，包含以下特有属性：

| 属性名 | 类型 | 描述 |
|-------|------|------|
| message_type | 'private' | 固定为 'private' |
| author | User | 发送者用户对象 |
| author_id | string | 发送者用户ID |
| message_id | string | 消息ID |
| content | string | 消息内容 |
| timestamp | number | 消息时间戳 |
| elements | MessageSegment[] | 消息段数组 |

## 事件对象方法

### reply(message, quote?)

回复私聊消息。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| message | Sendable | true | 要发送的消息内容 |
| quote | boolean | false | 是否引用原消息，默认 false |

**返回值**: Promise\<Message.Ret>

```javascript
client.on('message.private', (event) => {
  // 普通回复
  event.reply('你好！')
  
  // 引用回复
  event.reply('收到你的消息了', true)
  
  // 发送图片
  event.reply({
    type: 'image',
    data: { url: 'https://example.com/image.jpg' }
  })
})
```

### recall()

撤回私聊消息。

**返回值**: Promise\<boolean>

```javascript
client.on('message.private', async (event) => {
  if (event.content === '撤回') {
    await event.recall()
  }
})
```

### update(message, quote?)

更新私聊消息内容。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| message | Sendable | true | 新的消息内容 |
| quote | boolean | false | 是否引用 |

**返回值**: Promise\<any>

```javascript
client.on('message.private', async (event) => {
  const sent = await event.reply('处理中...')
  // 模拟处理任务
  setTimeout(async () => {
    await event.update('处理完成！')
  }, 2000)
})
```

### addReaction(emoji)

给私聊消息添加表情反应。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| emoji | string | true | 表情符号 |

**返回值**: Promise\<any>

```javascript
client.on('message.private', (event) => {
  // 点赞消息
  event.addReaction('👍')
})
```

### deleteReaction(emoji, user_id?)

删除私聊消息的表情反应。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| emoji | string | true | 表情符号 |
| user_id | string | false | 用户ID，不传则删除自己的反应 |

**返回值**: Promise\<any>

```javascript
client.on('message.private', (event) => {
  // 删除自己的反应
  event.deleteReaction('👍')
  
  // 删除指定用户的反应
  event.deleteReaction('👍', 'user_id')
})
```

### getReactions(emoji?)

获取私聊消息的表情反应列表。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| emoji | string | false | 指定表情，不传则获取所有反应 |

**返回值**: Promise\<Reaction[]>

```javascript
client.on('message.private', async (event) => {
  // 获取所有反应
  const allReactions = await event.getReactions()
  
  // 获取指定表情的反应
  const thumbsUp = await event.getReactions('👍')
  console.log('点赞人数:', thumbsUp.length)
})
```

## 使用示例

### 简单的问答机器人

```javascript
client.on('message.private', (event) => {
  const content = event.content.trim()
  
  if (content === '你好') {
    event.reply('你好！我是 KOOK 机器人')
  } else if (content === '时间') {
    event.reply(`当前时间: ${new Date().toLocaleString()}`)
  } else if (content.startsWith('复读 ')) {
    event.reply(content.slice(3))
  }
})
```

### 处理图片消息

```javascript
client.on('message.private', (event) => {
  // 查找图片消息段
  const imageSegment = event.elements.find(seg => seg.type === 'image')
  
  if (imageSegment) {
    console.log('收到图片:', imageSegment.data.url)
    event.reply('收到你的图片了！')
  }
})
```

### 命令处理

```javascript
client.on('message.private', async (event) => {
  const content = event.content.trim()
  
  if (!content.startsWith('/')) return
  
  const [command, ...args] = content.slice(1).split(/\s+/)
  
  switch (command) {
    case 'help':
      await event.reply('可用命令: /help, /info, /ping')
      break
    case 'info':
      await event.reply(`你的用户ID: ${event.author_id}`)
      break
    case 'ping':
      await event.reply('Pong!')
      break
    default:
      await event.reply('未知命令，输入 /help 查看帮助')
  }
})
```

## 注意事项

1. 私聊消息只能回复给发送者，不能指定其他用户
2. 撤回消息有时间限制，超过一定时间后无法撤回
3. 表情反应需要使用标准的 emoji 字符
4. 更新消息会替换原消息的全部内容

## 相关链接

- [频道消息事件](./channel.md)
- [消息段](../segment/index.md)
- [用户模块](../module/user.md)
