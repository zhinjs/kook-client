---
layout: doc
---

# 事件系统

kook-client 使用事件驱动的方式处理消息和其他事件。开发者可以通过监听不同的事件来实现机器人的各种功能。

## 事件监听

使用 `client.on()` 方法监听事件：

```javascript
client.on('message', (event) => {
  console.log('收到消息:', event.content)
})
```

## 支持的事件类型

### message

所有消息事件，包括私聊和频道消息。

```javascript
client.on('message', (event) => {
  // event 可能是 PrivateMessageEvent 或 ChannelMessageEvent
  console.log('消息来源:', event.message_type) // 'private' 或 'channel'
})
```

### message.private

私聊消息事件。详见 [私聊事件](./private.md)

```javascript
client.on('message.private', (event) => {
  // event 是 PrivateMessageEvent 类型
  event.reply('收到私聊消息')
})
```

### message.channel

频道消息事件。详见 [频道消息事件](./channel.md)

```javascript
client.on('message.channel', (event) => {
  // event 是 ChannelMessageEvent 类型
  event.reply('收到频道消息')
})
```

## 事件对象通用属性

所有消息事件对象都继承自 Message 类，包含以下通用属性：

| 属性名 | 类型 | 描述 |
|-------|------|------|
| message_id | string | 消息ID |
| message_type | 'private' \| 'channel' | 消息类型 |
| content | string | 消息内容 |
| author_id | string | 发送者ID |
| author | User | 发送者用户对象 |
| timestamp | number | 消息时间戳 |
| elements | MessageSegment[] | 消息段数组 |

## 事件对象通用方法

### reply(message, quote?)

回复消息。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| message | Sendable | true | 要发送的消息内容 |
| quote | boolean | false | 是否引用原消息，默认 false |

```javascript
client.on('message', (event) => {
  // 普通回复
  event.reply('Hello!')
  
  // 引用回复
  event.reply('引用你的消息', true)
})
```

### recall()

撤回消息。

```javascript
client.on('message.channel', async (event) => {
  if (event.content === '撤回') {
    await event.recall()
  }
})
```

### update(message, quote?)

更新/编辑消息。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| message | Sendable | true | 新的消息内容 |
| quote | boolean | false | 是否引用（仅私聊支持） |

```javascript
client.on('message', async (event) => {
  const msg = await event.reply('处理中...')
  // 稍后更新消息
  setTimeout(() => {
    event.update('处理完成！')
  }, 2000)
})
```

### addReaction(emoji)

给消息添加表情反应。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| emoji | string | true | 表情 emoji |

```javascript
client.on('message', (event) => {
  event.addReaction('👍')
})
```

### deleteReaction(emoji, user_id?)

删除消息的表情反应。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| emoji | string | true | 表情 emoji |
| user_id | string | false | 要删除的用户ID，不传则删除自己的 |

```javascript
client.on('message', (event) => {
  event.deleteReaction('👍')
})
```

### getReactions(emoji?)

获取消息的表情反应列表。

| 参数名 | 类型 | 是否必填 | 描述 |
|--------|------|----------|------|
| emoji | string | false | 指定表情，不传则获取所有 |

```javascript
client.on('message', async (event) => {
  const reactions = await event.getReactions('👍')
  console.log('点赞人数:', reactions.length)
})
```

## 下一步

- 了解 [私聊事件](./private.md) 的详细信息
- 了解 [频道消息事件](./channel.md) 的详细信息
