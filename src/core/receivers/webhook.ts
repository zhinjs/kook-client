import {Receiver} from "@/core/receiver";
import {BaseClient} from "@";
export class WebhookReceiver extends Receiver{
    constructor(client:BaseClient,public config:WebhookReceiver.Config) {
        super(client);
    }
    connect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

}
export namespace WebhookReceiver{
    export interface Config{
        token:string
        encrypt_key:string
        verify_key:string
    }
}
Receiver.register('webhook', WebhookReceiver);
