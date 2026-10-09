---
layout: doc
---

# 配置项

| 属性名      | 类型                  | 描述                    | 默认值   |
|----------|---------------------|-----------------------|-------|
| token    | string              | kook机器人的token 必填      | -     |
| mode     | webhook\|websocket  | 接收方式 必填               | -     |
| ignore | bot\|self| 消息忽略方式 必填             |-|
| maxRetry | number              | 机器人与qq官方的通信端口时的最大重连次数 | 10    |
| timeout  | number              | 机器人与请求官方接口的超时时间，单位毫秒  | 5000  |

## 嵌入宿主运行时

- `handleProcessErrors?: boolean`：默认保持原有全局异常监听；设为 `false` 时由宿主处理进程异常。
- `autoReconnect?: boolean`：默认自动重连；设为 `false` 时不启用 SDK 网络监控及重连定时器，断线发出 `disconnected`，由宿主决定重连时机。
- `socketFactory?: (url: string) => WebSocket`：为当前实例创建传输，不修改全局 WebSocket 或 TLS 配置。

在宿主管理模式下，`receiver.canResume()` 表示是否可使用原网关 URL 与 session 恢复，`receiver.connect(true)` 等待恢复 ACK 后才进入 Open 并派发缓存事件。事件按照连续 `sn` 派发，重复事件被忽略；服务端要求重新连接时清除旧会话。`disconnect()` 取消尚未完成的发现、HELLO 与恢复等待，迟到结果不会创建新连接。
