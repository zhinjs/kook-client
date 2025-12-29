import { ChannelMessageEvent, PrivateMessageEvent } from "./message.js";

export * from "./message.js"


export interface EventMap {
    'message'(e: PrivateMessageEvent | ChannelMessageEvent): void

    'message.channel'(e: ChannelMessageEvent): void

    'message.private'(e: PrivateMessageEvent): void
}

export interface EventMaps {
    'message': [PrivateMessageEvent | ChannelMessageEvent]

    'message.channel': [ChannelMessageEvent]

    'message.private': [PrivateMessageEvent]
}