import {Client, Sendable} from "../index.js";
import {Message} from "../message.js"
import {ChannelType} from "../constans.js";

export interface MessageEvent {
    reply(message: Sendable, quote?: boolean): Promise<any>
}

export class PrivateMessageEvent extends Message implements MessageEvent {
    message_type:'private'
    constructor(client: Client, payload: Message.Payload) {
        super(client, payload);
        this.message_type = 'private'
    }
    static fromDetail(client:Client,user_id:string,detail:Message.Detail){
        const payload:Message.Payload={
            target_id:client.self_id===detail.author.id?user_id:client.self_id,
            author_id:detail.author.id,
            type:detail.type,
            channel_type:ChannelType.Private,
            msg_id:detail.id,
            msg_timestamp:detail.create_at,
            content:detail.content,
            extra:detail
        }
        return new PrivateMessageEvent(client,payload)
    }
    getReactions(emoji?:string){
        return this.author.getMsgReactions(this.message_id,emoji)
    }
    addReaction(emoji:string){
        return this.author.addMsgReaction(this.message_id,emoji)
    }
    deleteReaction(emoji:string,user_id?:string){
        return this.author.deleteMsgReaction(this.message_id,emoji,user_id)
    }
    async recall(){
        return this.author.recallMsg(this.message_id)
    }
    async update(message:Sendable,quote?:boolean){
        return this.author.updateMsg(this.message_id,message,quote&&this)
    }
    async reply(message: Sendable,quote=false) {
        return this.author.sendMsg(message,quote && this)
    }
}

export class ChannelMessageEvent extends Message implements MessageEvent {
    channel_id: string
    message_type:'channel'
    channel_name:string
    constructor(client: Client, payload: Message.Payload) {
        super(client, payload);
        this.channel_id = payload.target_id
        this.channel_name=payload.extra.channel_name
        this.message_type = 'channel'
    }
    static fromDetail(client:Client,channel_id:string,detail:Message.Detail){
        const payload:Message.Payload={
            target_id:channel_id,
            author_id:detail.author.id,
            type:detail.type,
            channel_type:ChannelType.Channel,
            msg_id:detail.id,
            msg_timestamp:detail.create_at,
            content:detail.content,
            extra:detail
        }
        return new ChannelMessageEvent(client,payload)
    }
    get channel(){
        return this.client.pickChannel(this.channel_id)
    }
    async recall(){
        return this.channel.recallMsg(this.message_id)
    }
    async update(message:Sendable){
        return this.channel.updateMsg(this.message_id,message)
    }
    async reply(message: Sendable,quote=false) {
        return this.channel.sendMsg(message, quote&&this)
    }
    getReactions(emoji?:string){
        return this.channel.getMsgReactions(this.message_id,emoji)
    }
    addReaction(emoji:string){
        return this.channel.addMsgReaction(this.message_id,emoji)
    }
    deleteReaction(emoji:string,user_id?:string){
        return this.channel.deleteMsgReaction(this.message_id,emoji,user_id)
    }
}
