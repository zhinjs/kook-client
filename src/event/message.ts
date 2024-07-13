import {Client,Sendable} from "@";
import {Message} from "@/message"

export interface MessageEvent {
    reply(message: Sendable, quote?: boolean): Promise<any>
}

export class PrivateMessageEvent extends Message implements MessageEvent {
    message_type:'private'
    constructor(client: Client, payload: Message.Payload) {
        super(client, payload);
        this.message_type = 'private'
    }
    async recall(){
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
    get channel(){
        return this.client.pickChannel(this.channel_id)
    }
    async reply(message: Sendable,quote=false) {
        return this.channel.sendMsg(message, quote&&this)
    }
}
