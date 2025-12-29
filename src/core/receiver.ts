import {EventEmitter} from "events";
import {createDecipheriv} from 'crypto'
import {BaseClient, Client} from "../index.js";
import {ChannelType, OpCode} from "../constans.js";
import {ChannelMessageEvent, PrivateMessageEvent} from "../event/index.js";
export abstract class Receiver extends EventEmitter{
    sn:number=0
    buffer:Receiver.EventPacket[]=[]
    compress?:boolean
    protected constructor(public c:BaseClient) {
        super();
        this.on("event",this.#transformEvent.bind(this))
    }
    reset() {
        this.sn = 0;
        this.buffer = [];
    }
    #transformEvent(event:Receiver.EventPacket['d']){
        switch (event.channel_type){
            case ChannelType.Channel:
                return this.#transformChannelEvent(event)
            case ChannelType.Private:
                return this.#transformPrivateEvent(event)
            case ChannelType.Notice:
                return this.#transformNoticeEvent(event)
            default:
                throw new Error(`unknown channel type ${event.channel_type}`)
        }
    }
    #transformChannelEvent(event:Receiver.EventPacket['d']){
        if(event.type===255) return this.#transformNoticeEvent(event)
        if(event.extra?.author?.bot && this.c.config.ignore==='bot') return
        if(event.author_id===this.c.self_id && this.c.config.ignore==='self') return
        const messageEvent=new ChannelMessageEvent(this.c as Client,event)
        this.c.em('message.channel',messageEvent)
        this.c.logger.info(`recv from Channel(${messageEvent.channel_id}): ${messageEvent.raw_message}`)
    }
    #transformPrivateEvent(event:Receiver.EventPacket['d']){
        if(event.type===255) return this.#transformNoticeEvent(event)
        if(event.extra?.author?.bot && this.c.config.ignore==='bot') return
        if(event.author_id===this.c.self_id && this.c.config.ignore==='self') return
        const messageEvent=new PrivateMessageEvent(this.c as Client,event)
        this.c.em('message.private',messageEvent)
        this.c.logger.info(`recv from User(${messageEvent.author_id}): ${messageEvent.raw_message}`)
    }
    #transformNoticeEvent(event:Receiver.EventPacket['d']){

    }
    decryptData(data:string,key:string){
        if(!this.compress) return data
        const decodeData=Buffer.from(data,'base64')
        const iv=decodeData.subarray(0,16).toString('utf8')
        const encryptedData=decodeData.subarray(16)
        const finalKey=key.padEnd(32,'0')
        const finalKeyBuf=Buffer.from(finalKey,'utf8')
        const finalIvBuf=Buffer.from(iv,'utf8')
        const decipher=createDecipheriv('aes-256-cbc',finalKeyBuf,finalIvBuf)
        const decryptedData=decipher.update(encryptedData)
        return decryptedData.toString('utf8')+decipher.final().toString('utf8')
    }
    abstract connect():Promise<void>
    abstract disconnect():Promise<void>
}
export namespace Receiver{
    export type Mode='webhook'|'websocket'
    export type EventPacket<T=any>={
        s:OpCode
        d:T
        sn:number
    }
    /**
     * 信令[1] HELLO
     *
     * **方向：** server->client
     *
     * **说明：** 当我们成功连接websocket后，客户端应该在6s内收到该包，否则认为连接超时。
     *
     * | 状态码 | 含义 | 备注 |
     * | - | - | - |
     * | 0 | 成功 |
     * | 40100 | 缺少参数 | |
     * | 40101 | 无效的token | |
     * | 40102 | token验证失败 | |
     * | 40103 | token过期 | 需要重新连接 |
     */
    export interface HelloPacket{
        s:OpCode.Hello
        d:{
            code:0|40100|40101|40102|40103
            session_id?:string
        }
    }
    /**
     * 信令[2] PING
     *
     * **方向：** client -> server
     *
     * **说明：** 每隔30s(随机-5，+5),将当前的最大 `sn` 传给服务端,客户端应该在6s内收到PONG, 否则心跳超时。
     *
     * **参数列表：**
     *
     * | 参数 | 描述                              | 类型 | 必传 |
     * | ---- | --------------------------------- | ---- | ---- |
     * | sn   | 客户端目前收到的最新的消息 **sn** | number | Y    |
     */
    export interface PingEvent{
        s:OpCode.Ping
        sn:number
    }
    export interface PongEvent{
        s:OpCode.Pong
    }
    /**
     * 信令[5] RECONNECT
     * **方向：** server->client
     *
     * **说明：** 服务端通知客户端, 代表该连接已失效, 请重新连接。客户端收到后应该主动断开当前连接。
     *
     * **注意：**  客户端收到该信令代表因为某些原因导致当前连接已失效, 需要进行以下操作以避免消息丢失.
     * 1. 重新获取 gateway;
     * 2. 清空本地的 sn 计数;
     * 3. 清空本地消息队列.
     *
     * | 状态码 | 描述                                    |
     * | ------------ | --------------------------------------- |
     * | 40106        | resume 失败, 缺少参数                   |
     * | 40107        | 当前 `session` 已过期 (resume 失败, PING的sn无效)      |
     * | 40108        | 无效的 `sn` ,  或 `sn` 已经不存在 (resume 失败, PING的 `sn` 无效) |
     */
    export interface ReconnectEvent{
        s:OpCode.Reconnect
        d:{
            code: 40106 | 40107 | 40108;
        }
    }
    type Construct=new (...args:any[])=>Receiver
    const adapters:Map<Mode,Construct>=new Map<Mode,Construct>
    export function register(mode:Mode, receiver:Construct){
        adapters.set(mode,receiver)
    }
    export function create(mode:Mode,...args:any[]):Receiver{
        const Construct=adapters.get(mode)
        if(!Construct) throw new Error(`未找到${mode}模式的接收器`)
        return new Construct(...args)
    }
}
