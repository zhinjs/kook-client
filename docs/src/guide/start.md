---
layout: doc
---
# 快速开始
由于 `kook-client` 是基于 `NodeJS` 编写，要使用 "kook-client"，你可以按照以下步骤进行操作：
## 1. 安装 Node.js
首先，确保你的计算机上已经安装了 Node.js。你可以在 Node.js 的官方网站上下载并安装适合你操作系统的版本。
## 2. 创建新项目
在你的项目文件夹中，打开终端或命令行界面，并运行以下命令来初始化一个新的 Node.js 项目：
```shell
npm init # 这将会引导你创建一个新的 `package.json` 文件，用于管理你的项目依赖和配置。
```
## 3. 安装 `kook-client` 包
运行以下命令来安装 `kook-client` 包:
```shell
npm install kook-client
```
## 4. 编写代码
创建一个 JavaScript 或 TypeScript 文件（例如 client.js），并在其中编写你的 QQ 群机器人代码。你可以使用下面的示例代码作为起点：
```javascript
const {Client} = require('kook-client');

const client = new Client({
	// 在这里配置你的 机器人的token和连接模式等信息
	ignore:'bot',
	token:'你的机器人token',
	mode:'websocket'
});

// 监听消息事件
client.on('message.channel', (event) => {
	// 在这里处理消息
	console.log('收到消息:', event.message);
	// 回复消息
	event.reply('hello world')
});

// 启动机器人
client.connect();
```

- 注意：在配置中，你需要填写你的 `token`和 `mode`。请确保妥善保管token信息，并遵循相关使用条款和隐私政策。
- 示例中的配置仅为基础配置，更多配置信息请查看 [配置项](../config.md) 章节


