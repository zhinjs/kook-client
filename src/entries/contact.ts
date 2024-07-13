import { BaseClient, Quotable, Sendable, Message} from "@";

export abstract class Contact {
    protected constructor(public c: BaseClient) {
    }

    abstract sendMsg(message:Sendable,quote?:Quotable):Promise<Message.Ret>
}
