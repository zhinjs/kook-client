---
layout: home

hero:
  name: kook-client
  text: 基于NodeJS的 KOOK 机器人开发SDK
  tagline: 简单易用、功能全面的 KOOK 机器人开发框架
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/start
    - theme: alt
      text: View on GitHub
      link: https://github.com/zhinjs/kook-client
    - theme: alt
      text: 常见问题
      link: /faq

features:
  - icon: 🚀
    title: 上手简单
    details: 方法使用参考icqq设计，更容易上手。清晰的API设计，完善的类型提示，让开发更加顺畅。
  - icon: 📦
    title: 化繁为简
    details: 内部封装官方API调用，让你无需关心连接机制和API使用方式。专注于业务逻辑，快速实现功能。
  - icon: ⚡
    title: 功能全面
    details: 覆盖官方的所有功能，并以更合理的方式为你提供。支持WebSocket和Webhook两种连接模式。
  - icon: 📝
    title: TypeScript 支持
    details: 完整的 TypeScript 类型定义，提供良好的开发体验和代码提示。
  - icon: 🔧
    title: 灵活配置
    details: 丰富的配置选项，满足各种使用场景。支持日志级别、重连策略、超时设置等。
  - icon: 📚
    title: 完善文档
    details: 详细的API文档、使用指南、最佳实践和常见问题解答，帮助你快速上手。
---

## 快速安装

::: code-group

```bash [npm]
npm install kook-client
```

```bash [yarn]
yarn add kook-client
```

```bash [pnpm]
pnpm install kook-client
```

:::

## 快速开始

```javascript
const {Client} = require('kook-client')

// 创建机器人实例
const client = new Client({
  token: 'YOUR_BOT_TOKEN',
  mode: 'websocket',
  ignore: 'bot'
})

// 监听频道消息
client.on('message.channel', (event) => {
  console.log('收到消息:', event.content)
  
  // 回复消息
  if (event.content === 'hello') {
    event.reply('Hello World!')
  }
})

// 启动机器人
client.connect()
```

## 为什么选择 kook-client?

- **易于使用**: 简洁的 API 设计，快速上手
- **可靠稳定**: 自动重连机制，确保服务稳定运行
- **活跃维护**: 持续更新，紧跟 KOOK 平台最新特性
- **社区支持**: 活跃的社区，快速响应问题和需求

## 社区

- [GitHub Issues](https://github.com/zhinjs/kook-client/issues) - 报告问题和提出建议
- [QQ 群：446290761](https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=rYaL-gcqTjWYqwBs9TDoVSXKu-i5ircB) - 加入社区讨论

## 开源协议

[MIT License](https://github.com/zhinjs/kook-client/blob/master/LICENSE) © 2023-present lc-cn
