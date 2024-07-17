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
