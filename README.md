# kook-client

[![CI](https://github.com/zhinjs/kook-client/actions/workflows/release.yml/badge.svg?branch=master&event=push)](https://github.com/zhinjs/kook-client/actions/workflows/release.yml)
[![Docs](https://github.com/zhinjs/kook-client/actions/workflows/docs.yml/badge.svg?branch=master&event=push)](https://github.com/zhinjs/kook-client/actions/workflows/docs.yml)
[![npm version](https://img.shields.io/npm/v/kook-client/latest.svg)](https://www.npmjs.com/package/kook-client)
[![qq group](https://img.shields.io/badge/group-446290761-blue?style=flat-square&labelColor=FAFAFA&logo=data:image/png;base64,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&logoColor=000000)](https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=rYaL-gcqTjWYqwBs9TDoVSXKu-i5ircB&authKey=TO02faBOpfhmfkw3YQuUCG2HxUEwWCuFdMBf5nSt3qyWD%2FqaO453O9Dx%2BK8JwBdM&noverify=0&group_code=446290761)

基于 Node.js 的 KOOK 机器人开发 SDK。简单易用、功能全面、类型完善。

## 📚 文档

完整的文档请访问：**[https://zhinjs.github.io/kook-client/](https://zhinjs.github.io/kook-client/)**

- 📖 [快速开始](https://zhinjs.github.io/kook-client/guide/start.html)
- 📋 [API 文档](https://zhinjs.github.io/kook-client/module/client.html)
- 🎯 [事件系统](https://zhinjs.github.io/kook-client/event/)
- 💬 [消息段](https://zhinjs.github.io/kook-client/segment/)
- ❓ [常见问题](https://zhinjs.github.io/kook-client/faq.html)
- ✨ [最佳实践](https://zhinjs.github.io/kook-client/best-practices.html)

## ✨ 特性

- 🚀 **上手简单** - 方法使用参考 icqq 设计，更容易上手
- 📦 **化繁为简** - 内部封装官方 API 调用，让你无需关心连接机制和 API 使用方式
- ⚡ **功能全面** - 覆盖官方的所有功能，并以更合理的方式为你提供
- 📝 **TypeScript 支持** - 完整的类型定义，提供良好的开发体验
- 🔧 **灵活配置** - 丰富的配置选项，满足各种使用场景
- 📚 **完善文档** - 详细的文档和示例，帮助你快速上手

## 📦 安装

```bash
npm install kook-client
# 或
yarn add kook-client
# 或
pnpm install kook-client
```

## 🚀 快速开始

```javascript
const {Client} = require('kook-client')

// 创建机器人
const client = new Client({
	logLevel: 'info',      // 日志等级
	ignore: 'bot',         // 忽略消息配置，可选值为：bot|self
	token: '',             // 机器人秘钥
	mode: 'websocket'      // 连接模式：websocket | webhook
})

// 监听频道消息
client.on('message.channel', (event) => {
	console.log('收到消息:', event.content)
	event.reply('Hello World!')
})

// 监听私聊消息
client.on('message.private', (event) => {
	event.reply('你好！')
})

// 启动机器人
client.connect()
```

## 📖 使用示例

### 发送消息

```javascript
// 频道被动回复
client.on('message.channel', (event) => {
	event.reply('hello world')
})

// 频道私信被动回复
client.on('message.private', (event) => {
	event.reply('hello world')
})

// 主动发送频道消息
client.sendChannelMsg(channel_id, 'hello')

// 主动发送私聊消息
client.sendPrivateMsg(user_id, 'hello')
```

### 命令处理

```javascript
client.on('message.channel', (event) => {
	const content = event.content.trim()
	
	if (content === '/hello') {
		event.reply('Hello World!')
	}
	
	if (content === '/help') {
		event.reply('可用命令: /hello, /help, /ping')
	}
})
```

更多示例请查看[完整文档](https://zhinjs.github.io/kook-client/)。

## 🛠️ 开发

### 本地运行文档

```bash
# 安装依赖
pnpm install

# 启动文档开发服务器
pnpm run docs:dev

# 构建文档
pnpm run docs:build
```

### 构建项目

```bash
# 编译 TypeScript
pnpm run build
```

## 🤝 贡献

欢迎贡献代码！请查看[贡献指南](./CONTRIBUTING-DOCS.md)了解如何参与文档和代码的贡献。

## 📄 许可证

[MIT License](./LICENSE) © 2023-present lc-cn

## 🔗 相关链接

- [KOOK 开发者平台](https://developer.kookapp.cn/)
- [KOOK 官方文档](https://developer.kookapp.cn/doc/intro)
- [项目文档](https://zhinjs.github.io/kook-client/)
- [GitHub Issues](https://github.com/zhinjs/kook-client/issues)
- [QQ 群：446290761](https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=rYaL-gcqTjWYqwBs9TDoVSXKu-i5ircB)
