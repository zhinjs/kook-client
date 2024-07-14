// 心跳参数
export enum OpCode {
    Event = 0, // 服务端进行消息推送
    Hello = 1, // 客户端发送心跳
    Ping = 2, // 心跳包
    Pong = 3, // 心跳回包
    Reconnect = 5, // 需要重连
    ResumeAck = 6, // 连接恢复
}

export const UnsupportedMethodError = new Error('暂未支持')
export enum ChannelType{
    Channel='GROUP',
    Private='PERSON',
    Notice='BROADCAST'
}
export enum NotifyType{
    Default,
    All,
    At,
    Off
}
