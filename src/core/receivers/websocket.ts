import {Receiver} from "@/core/receiver";
import {BaseClient} from "@";
import {WebSocket} from "ws";
import {OpCode} from "@/constans";

export class WebsocketReceiver extends Receiver{
    state:WebsocketReceiver.State
    ws:WebSocket
    url?:URL
    session_id?:string
    get logger(){
        return this.c.logger
    }
    timers:Map<string,NodeJS.Timer>=new Map<string, NodeJS.Timer>()
    constructor(client:BaseClient,public config:WebsocketReceiver.Config) {
        super(client);
        this.state=WebsocketReceiver.State.Initial
        this.compress=config.compress
    }
    async #getGateway(compress:0|1): Promise<string> {
        const res=await this.c.request.get('/v3/gateway/index',{params:{compress}})
        return res.data.url
    }
    async #receiveHelloCode(): Promise<number> {
        return new Promise((resolve,reject)=>{
            const timer=setTimeout(()=>{
                reject(new Error('WebSocket receive hello code timeout'))
            },5000)
            this.once('hello',(data:Receiver.HelloPacket['d'])=>{
                clearTimeout(timer)
                this.session_id=data.session_id
                resolve(data.code)
            })
        })
    }
    #sendPing(){
        this.ws?.send(JSON.stringify({s:OpCode.Ping}))
    }
    #startListen(): void {
        this.ws?.on('message',(event)=>{
            const data=JSON.parse(this.decryptData(event.toString(),this.config.encrypt_key!))
            if(data.sn) this.sn=data.sn
            switch (data.s){
                case OpCode.Hello:
                    return this.emit('hello',data.d)
                case OpCode.Event:
                    return this.emit('event',data.d)
                case OpCode.Reconnect:
                    return this.reconnect()
                case OpCode.ResumeAck:
                    return this.emit('resume',data.d)
                case OpCode.Pong:
                    return this.logger.debug(`receive pong from server`)
                default:
            }
        })
    }
    async reconnect(){
        const {sn,session_id}=this
        this.buffer=[]
        return this.connect(true)
    }
    async connect(is_reconnect?:boolean): Promise<void> {
        this.state=WebsocketReceiver.State.PullingGateway
        let url=new URL(await this.#getGateway(this.config.compress?1:0))
        if(is_reconnect){
            const entries:readonly [string,string|number][]=[
                ['sn',this.sn],
                ['session_id',this.session_id],
                ['resume',1]
            ].filter(([_,value])=>value) as any
            const query=new Map<string,string|number>(entries)
            for(const [key,value] of query){
                url.searchParams.append(key,value.toString())
            }
        }
        this.url=url
        this.ws=new WebSocket(this.url)
        this.#startListen()
        const receiveCode=await this.#receiveHelloCode()
        if(receiveCode!==0){
            this.c.logger.error(`WebSocket connect failed, receive code: ${receiveCode}`)
            return this.connect()
        }
        this.#sendPing()
        this.timers.set('ping',setInterval(()=>{
            this.#sendPing()
        },25000+Math.random()*10000))
    }

    async disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }
}
export namespace WebsocketReceiver{
    export interface Config{
        token:string
        compress?:boolean
        encrypt_key?:string
    }
    export enum State{
        Initial,
        PullingGateway,
        Connecting,
        Open,
        Closed,
        Reconnection
    }
}
Receiver.register('websocket', WebsocketReceiver);
