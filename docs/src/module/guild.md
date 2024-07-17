# 服务器(Guild)
## 刷新服务器信息
- renew():Promise\<void>

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|

## 退出服务器
- quit():Promise\<void>

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|
## 获取服务器角色列表
- getRoleList():Promise\<[Guild.Role](./guild.md#guild-role)[]>

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|
## 创建新角色
- createRole(name):Promise\<[Guild.Role](./guild.md#guild-role)>

| 参数名 | 类型 | 是否必填 | 描述|
|-----|----|------|----|
|name|string|true|角色名称|
## 更新角色
- updateRole(role_id,update_info):Promise\<[Guild.Role](./guild.md#guild-role)>

| 参数名         | 类型                   | 是否必填 | 描述   |
|-------------|----------------------|------|------|
| role_id     | string               |true| 角色id |
| update_info | Omit\<Guild.Role,'id'> |true|更新信息|
## 删除角色
- deleteRole(role_id):Promise\<boolean>

| 参数名     | 类型                   | 是否必填 | 描述   |
|---------|----------------------|------|------|
| role_id | string               |true| 角色id |
## 踢出指定用户
- kick(user_id):Promise\<boolean>

| 参数名     | 类型                   | 是否必填 | 描述   |
|---------|----------------------|------|------|
| user_id | string               |true| 用户id |
## 创建频道
- createChannel(channel_info):Promise\<[Channel.Info](./channel.md#channel-info)>

| 参数名     | 类型                       | 是否必填 | 描述   |
|---------|--------------------------|------|------|
| channel_info | Omit\<[Channel.Info](./channel.md#channel-info),'id'> |true| 频道信息 |

## Guild.Info
```typescript
interface Info {
    /**
     * 服务器id
     */
    id: string
    /**
     * 服务器名称
     */
    name: string
    /**
     * 服务器主题
     */
    topic: string
    /**
     * 服务器主人id
     */
    user_id: string
    /**
     * icon url
     */
    icon: string
    /**
     * 通知类型
     */
    notify_type: NotifyType
    /**
     * 默认语音区域
     */
    region: string
    /**
     * 是否公开服务器
     */
    enable_open: number
    /**
     * 服务器公开id
     */
    open_id?: number
    /**
     * 默认频道
     */
    default_channel_id?: string
    /**
     * 欢迎频道
     */
    welcome_channel_id?: string
    /**
     * 助力数
     */
    boost_num?:number
    /**
     * 服务器等级
     */
    level?:number
}
```
## Guild.Role
```typescript
export interface Role{
        role_id:number
        name:string
        color:number
        position:number
        hoist:number
        mentionable:number
        permissions:number
    }
```
## Guild.Permission
```typescript
export enum Permission{
        Admin=1,
        ManageGuild,
        ViewAdminLog=4,
        CreateGuildInvite=8,
        ManageInvite=16,
        ManageChannel=32,
        KickUser=64,
        BanUser=128,
        ManageCustomFace=256,
        UpdateGuildName=512,
        ManageRole=1024,
        ViewContentOrVoiceChannel=2048,
        PublishMsg=4096,
        ManageMsg=8192,
        UploadFile=16384,
        VoiceLink=32768,
        ManageVoice=65536,
        AtAll=131072,
        AddReaction=262144,
        FollowReaction=524288,
        PassiveLinkVoiceChannel=1048576,
        PressKeyTalk=2097152,
        FreeTally=4194304,
        Talk=8388608,
        MuteGuild=16777216,
        CloseGuildWheat=33554432,
        UpdateOtherUserNickname=67108864,
        PlayMusic=134217728,
    }
```
## Guild.BlackInfo
```typescript
export interface BlackInfo{
    user_id:string
    created_time:number
    remark:string
    user:User.Info
}
```
