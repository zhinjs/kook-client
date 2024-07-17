# 用户(User)
## 发送消息
- sendMsg(message,quote):Promise\<Message.Ret>

| 参数名      | 类型       | 是否必填 | 描述        |
|----------|----------|------|-----------|
| message  | Sendable |是| 消息内容      |
## User.Info
```typescript
export interface Info {
        /**
         * 用户id
         */
        id: string
        /**
         * 频道id
         */
        guild_id?:string
        /**
         * 用户名称
         */
        username: string
        /**
         * 用户昵称
         */
        nickname:string
        /**
         * 用户名认证数字
         */
        identify_num:string
        /**
         * 是否在线
         */
        online:boolean
        /**
         * 是否机器人
         */
        bot:boolean
        /**
         * 用户状态
         */
        status:1|0|10
        /**
         * 用户头像
         */
        avatar: string
        /**
         * vip用户头像
         */
        vip_avatar:string
        /**
         * 是否验证了手机号
         */
        mobile_verified: boolean
        roles: number[]
    }
```

