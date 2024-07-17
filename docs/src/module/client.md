# 客户端(Client)
## 获取机器人信息
- getSelfInfo():Promise\<[User.Info](./user.md#user-info)[]>

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|
## 机器人上线
- setOnline():Promise\<boolean>

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|
## 机器人下线
- setOffline():Promise\<boolean>

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|
## 获取在线状态
- getOnlineStatus():Promise\<{online:boolean,online_os:string[]}>

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|
## 获取机器人加入的服务器列表
- getGuildList()：Promise\<[Guild.Info](./guild.md#guild-info)[]>

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|
## 获取指定服务器详情
- getGuildList(guild_id)：Promise\<[Guild.Info](./guild.md#guild-info)>

| 参数名 | 类型 | 是否必填 | 描述    |
|-----|----|------|-------|
| guild_id|string|true| 服务器id |
## 获取指定服务器频道列表
- getChannelList(guild_id)：Promise\<[Channel.Info](./channel.md#channel-info)[]>

| 参数名 | 类型 | 是否必填 | 描述    |
|-----|----|------|-------|
| guild_id|string|true| 服务器id |
## 获取指定服务器成员列表
- getGuildUserList(guild_id,channel_id?)：Promise\<[User.Info](./user.md#user-info)[]>

| 参数名        | 类型 | 是否必填  | 描述                 |
|------------|----|-------|--------------------|
| guild_id   |string| true  | 服务器id              |
| channel_id |string| false | 频道id，传入则获取指定频道成员列表 |

## 获取黑名单成员列表
- getGuildUserList(guild_id)：Promise\<[Guild.BlackInfo](./guild.md#guild-blackinfo)[]>

| 参数名        | 类型 | 是否必填  | 描述                 |
|------------|----|-------|--------------------|
| guild_id   |string| true  | 服务器id              |
## 发送私聊消息
- sendPrivateMsg(user_id,message,quote)：Promise\<Message.Ret>

| 参数名     | 类型        | 是否必填  | 描述   |
|---------|-----------|-------|------|
| user_id | string    | true  | 用户id |
| message | Sendable  | true  | 消息内容 |
| quote   | Quoteable | false | 引用内容 |
## 发送频道消息
- sendChannelMsg(channel_id,message,quote)：Promise\<Message.Ret>

| 参数名     | 类型        | 是否必填  | 描述   |
|---------|-----------|-------|------|
| channel_id | string    | true  | 频道id |
| message | Sendable  | true  | 消息内容 |
| quote   | Quoteable | false | 引用内容 |
## 获取私聊消息
- getPrivateMsg(channel_id,message_id)：Promise\<Message>

| 参数名        | 类型        | 是否必填  | 描述   |
|------------|-----------|-------|------|
| user_id    | string    | true  | 用户id |
| message_id | string    | true  | 消息id |
## 获取频道消息
- getChannelMsg(channel_id,message_id)：Promise\<Message>

| 参数名        | 类型        | 是否必填  | 描述   |
|------------|-----------|-------|------|
| channel_id | string    | true  | 频道id |
| message_id | string    | true  | 消息id |
## 撤回私聊消息
- recallPrivateMsg(channel_id,message_id)：Promise\<Message>

| 参数名        | 类型        | 是否必填  | 描述   |
|------------|-----------|-------|------|
| user_id    | string    | true  | 用户id |
| message_id | string    | true  | 消息id |
## 撤回频道消息
- recallChannelMsg(channel_id,message_id)：Promise\<Message>

| 参数名        | 类型        | 是否必填  | 描述   |
|------------|-----------|-------|------|
| channel_id | string    | true  | 频道id |
| message_id | string    | true  | 消息id |
## 获取私聊聊天历史
- getPrivateChatHistory(channel_id,message_id)：Promise\<Message[]>

| 参数名        | 类型        | 是否必填  | 描述   |
|------------|-----------|-------|------|
| user_id    | string    | true  | 用户id |
| message_id | string    | false | 消息id |
## 获取频道聊天历史
- getChannelChatHistory(channel_id,message_id)：Promise\<Message[]>

| 参数名        | 类型        | 是否必填  | 描述   |
|------------|-----------|-------|------|
| channel_id | string    | true  | 频道id |
| message_id | string    | false | 消息id |


