import {Quotable, Sendable, Message, Client} from "@";

export abstract class Contact {
    protected constructor(public c: Client) {
    }

    abstract sendMsg(message:Sendable,quote?:Quotable):Promise<Message.Ret>
    abstract updateMsg(message_id:string,newMessage:Sendable,quote?:Quotable):Promise<boolean>
    abstract recallMsg(message_id:string):Promise<boolean>
    abstract getMsg(message_id:string):Promise<Message>
}
