---
layout: doc
---

# 角色(Role)

角色模块用于管理服务器中的角色权限。角色可以赋予成员不同的权限和显示颜色。

## 角色信息

### Guild.Role

```typescript
interface Role {
    role_id: number        // 角色ID
    name: string          // 角色名称
    color: number         // 角色颜色(十进制RGB)
    position: number      // 角色位置
    hoist: number         // 是否在成员列表中单独显示
    mentionable: number   // 是否允许任何人@此角色
    permissions: number   // 权限值(位运算)
}
```

## 获取角色列表

通过 Guild 对象获取服务器的角色列表：

```javascript
const guild = client.pickGuild(guild_id)
const roles = await guild.getRoleList()

roles.forEach(role => {
  console.log(`角色名称: ${role.name}`)
  console.log(`角色颜色: #${role.color.toString(16)}`)
  console.log(`权限值: ${role.permissions}`)
})
```

## 创建角色

创建新角色，默认拥有最基本的权限：

```javascript
const guild = client.pickGuild(guild_id)

// 创建角色
const newRole = await guild.createRole('版主')

console.log('创建的角色ID:', newRole.role_id)
```

## 更新角色

更新角色的属性，包括名称、颜色、权限等：

```javascript
const guild = client.pickGuild(guild_id)

// 更新角色信息
await guild.updateRole(role_id, {
  name: '超级版主',
  color: 0xFF0000,  // 红色
  permissions: 1024, // 管理角色权限
  hoist: 1,         // 在成员列表中单独显示
  mentionable: 1    // 允许@此角色
})
```

## 删除角色

删除指定的角色：

```javascript
const guild = client.pickGuild(guild_id)

// 删除角色
const success = await guild.deleteRole(role_id)
if (success) {
  console.log('角色删除成功')
}
```

## 角色权限

### Guild.Permission

kook-client 提供了权限枚举，方便进行权限管理：

```typescript
enum Permission {
    Admin = 1,                          // 管理员
    ManageGuild = 2,                    // 管理服务器
    ViewAdminLog = 4,                   // 查看管理日志
    CreateGuildInvite = 8,              // 创建邀请
    ManageInvite = 16,                  // 管理邀请
    ManageChannel = 32,                 // 管理频道
    KickUser = 64,                      // 踢出用户
    BanUser = 128,                      // 封禁用户
    ManageCustomFace = 256,             // 管理自定义表情
    UpdateGuildName = 512,              // 修改服务器名称
    ManageRole = 1024,                  // 管理角色
    ViewContentOrVoiceChannel = 2048,   // 查看文字/语音频道
    PublishMsg = 4096,                  // 发布消息
    ManageMsg = 8192,                   // 管理消息
    UploadFile = 16384,                 // 上传文件
    VoiceLink = 32768,                  // 语音连接
    ManageVoice = 65536,                // 管理语音
    AtAll = 131072,                     // @全体成员
    AddReaction = 262144,               // 添加反应
    FollowReaction = 524288,            // 跟随反应
    PassiveLinkVoiceChannel = 1048576,  // 被动连接语音频道
    PressKeyTalk = 2097152,             // 按键说话
    FreeTally = 4194304,                // 自由语音
    Talk = 8388608,                     // 语音发言
    MuteGuild = 16777216,               // 服务器静音
    CloseGuildWheat = 33554432,         // 服务器闭麦
    UpdateOtherUserNickname = 67108864, // 修改他人昵称
    PlayMusic = 134217728,              // 播放音乐
}
```

### 权限计算

权限使用位运算进行组合和判断：

```javascript
const {Permission} = require('kook-client')

// 组合多个权限
const permissions = Permission.ManageGuild | Permission.ManageChannel | Permission.ManageMsg

// 检查是否拥有某个权限
function hasPermission(userPermissions, requiredPermission) {
  return (userPermissions & requiredPermission) === requiredPermission
}

// 示例
const role = await guild.getRoleList().then(roles => roles[0])
if (hasPermission(role.permissions, Permission.ManageMsg)) {
  console.log('该角色可以管理消息')
}
```

## 使用示例

### 创建管理员角色

```javascript
const {Permission} = require('kook-client')

async function createAdminRole(guild) {
  // 创建角色
  const role = await guild.createRole('管理员')
  
  // 设置管理员权限
  const adminPermissions = 
    Permission.ManageGuild |
    Permission.ManageChannel |
    Permission.ManageMsg |
    Permission.KickUser |
    Permission.ManageRole
  
  // 更新角色
  await guild.updateRole(role.role_id, {
    name: '管理员',
    color: 0xFF5722,  // 橙红色
    permissions: adminPermissions,
    hoist: 1,
    mentionable: 1
  })
  
  return role
}

// 使用
client.on('message.channel', async (event) => {
  if (event.content === '/创建管理员角色') {
    const guild = client.pickGuild(event.channel.guild_id)
    const role = await createAdminRole(guild)
    event.reply(`管理员角色创建成功！角色ID: ${role.role_id}`)
  }
})
```

### 批量管理角色

```javascript
async function organizeRoles(guild) {
  const roles = await guild.getRoleList()
  
  console.log('服务器角色列表:')
  roles.forEach((role, index) => {
    console.log(`${index + 1}. ${role.name}`)
    console.log(`   颜色: #${role.color.toString(16).padStart(6, '0')}`)
    console.log(`   位置: ${role.position}`)
    console.log(`   可@: ${role.mentionable ? '是' : '否'}`)
  })
  
  return roles
}
```

### 权限检查工具

```javascript
const {Permission} = require('kook-client')

function checkPermissions(role) {
  const perms = []
  
  if (role.permissions & Permission.Admin) {
    perms.push('管理员')
  }
  if (role.permissions & Permission.ManageGuild) {
    perms.push('管理服务器')
  }
  if (role.permissions & Permission.ManageChannel) {
    perms.push('管理频道')
  }
  if (role.permissions & Permission.ManageMsg) {
    perms.push('管理消息')
  }
  if (role.permissions & Permission.KickUser) {
    perms.push('踢出用户')
  }
  if (role.permissions & Permission.BanUser) {
    perms.push('封禁用户')
  }
  
  return perms
}

// 使用示例
client.on('message.channel', async (event) => {
  if (event.content.startsWith('/角色权限 ')) {
    const roleId = parseInt(event.content.split(' ')[1])
    const guild = client.pickGuild(event.channel.guild_id)
    const roles = await guild.getRoleList()
    const role = roles.find(r => r.role_id === roleId)
    
    if (role) {
      const perms = checkPermissions(role)
      event.reply(
        `角色: ${role.name}\n` +
        `权限: ${perms.join(', ') || '无特殊权限'}`
      )
    }
  }
})
```

### 角色颜色管理

```javascript
// 常用颜色
const COLORS = {
  RED: 0xFF0000,
  GREEN: 0x00FF00,
  BLUE: 0x0000FF,
  YELLOW: 0xFFFF00,
  ORANGE: 0xFF5722,
  PURPLE: 0x9C27B0,
  PINK: 0xE91E63,
  CYAN: 0x00BCD4
}

async function setRoleColor(guild, roleId, colorName) {
  const color = COLORS[colorName.toUpperCase()]
  if (!color) {
    throw new Error('不支持的颜色')
  }
  
  await guild.updateRole(roleId, { color })
}

// 使用示例
client.on('message.channel', async (event) => {
  if (event.content.startsWith('/设置角色颜色 ')) {
    const [, roleId, colorName] = event.content.split(' ')
    const guild = client.pickGuild(event.channel.guild_id)
    
    try {
      await setRoleColor(guild, parseInt(roleId), colorName)
      event.reply('角色颜色设置成功！')
    } catch (error) {
      event.reply(`设置失败: ${error.message}`)
    }
  }
})
```

## 注意事项

1. 只有拥有管理角色权限的用户才能创建、修改、删除角色
2. 角色的 `position` 值越大，角色位置越靠前，权限优先级越高
3. 不能修改或删除比自己角色位置更高的角色
4. 权限值使用位运算，可以组合多个权限
5. 角色颜色使用十进制表示，可以通过 `0x` 前缀使用十六进制
6. `hoist` 为 1 时，该角色的成员会在成员列表中单独显示
7. `mentionable` 为 1 时，任何人都可以 @ 该角色的所有成员

## 相关链接

- [服务器模块](./guild.md)
- [用户模块](./user.md)
- [频道模块](./channel.md)
