# 子频道
## 获取频道列表
- getChannelList
- 将返回 [Channel](https://client.q.qq.com/wiki/develop/api-v2/server-inter/channel/manage/channel/model.html#channel)对象

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|
| guild_id|string|是|服务器id|
## Channel.Info
```typescript
export interface Info {
    /**
     * 频道id
     */
    id: string
    /**
     * 创建者id
     */
    user_id: string
    /**
     * 频道名称
     */
    /**
     * 父分组频道id
     */
    parent_id?: string
    name: string
    /**
     * 频道类型
     */
    type: ChannelType
    /**
     * 频道排序
     */
    level: number
    /**
     * 人数限制
     */
    limit_account: number
    is_category?: boolean
}
```
