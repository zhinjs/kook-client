import {MessageSegment, Quotable, segment, Sendable, validateCard} from "./elements.js";
import {BaseClient} from "./core/baseClient.js";
import {Client} from "./client.js";
import {User} from "./entries/user.js";
import {ChannelType, UnsupportedMethodError} from "./constans.js";
import {Guild} from "./entries/guild.js";

export abstract class Message {
    message_type: Message.Type
    timestamp: number

    get self_id() {
        return this.client.self_id
    }

    message_id: string
    author_id: string

    protected constructor(public client: Client, payload: Message.Payload) {
        this.author_id = payload.author_id
        this.raw_message = payload.content
        this.timestamp = payload.msg_timestamp
        this.message_id = payload.msg_id
        this.message = Message.convertMessage(payload.content, payload.extra)
    }
    abstract recall():Promise<boolean>
    abstract update(message:Sendable):Promise<boolean>
    abstract reply(message:Sendable,quote?:boolean):Promise<Message.Ret>
    abstract getReactions(emoji?:string):Promise<User.Info[]>
    abstract addReaction(emoji:string):Promise<void>
    abstract deleteReaction(emoji:string,user_id?:string):Promise<void>

    get author() {
        return this.client.pickUser(this.author_id)
    }

    raw_message: string
    message: MessageSegment[]


    get [Symbol.unscopables]() {
        return {
            client: true
        }
    }


    toJSON() {
        return Object.fromEntries(Object.keys(this)
            .filter(key => {
                return typeof this[key] !== "function" && !(this[key] instanceof BaseClient)
            })
            .map(key => [key, this[key]])
        )
    }
}

export namespace Message {
    export type Ret = {
        message_id: string
    }
    export type Type = 'private' | 'channel'
}
export namespace Message {
    export type Extra = {
        type: number
        guild_id?: string
        channel_name?: string
        mention: string[]
        mention_all: boolean
        mention_roles: string[]
        mention_here: boolean
        author: User.Info
        quote?:Detail
        mention_info?:{
            mention_part:User.Info[]
            mention_role_part:Guild.Role[]
        }
        attachments?: AttachmentInfo
        kmarkdown?: MarkdownInfo
    }
    export type MarkdownInfo = {
        raw_content: string
        mention_part: string[]
        mention_role_part: string[]
    }
    export type AttachmentInfo = {
        type: string
        url: string
        name?: string
        file_type?: string
        size?: number
    }
    export type Payload = {
        channel_type: ChannelType
        type: number
        target_id: string
        author_id: string
        content: string
        msg_id: string
        msg_timestamp: number
        nonce?: string
        extra: Extra
    }
    export interface Detail extends Extra{
        id:string
        type:number
        content:string
        embeds:Embed[]
        create_at:number
        update_at:number
        reactions:ReactionInfo[]
    }
    export type ReactionInfo={
        emoji:{
            id:string
            name:string
        }
        count:number
        me:boolean
    }
    export type Embed={
        type:string
        url:string
        origin_or:string
        av_no:string
        iframe_path:string
        duration:number
        title:string
        pic:string
    }
    export function convertMessage(content: string, extra: Extra): MessageSegment[] {
        if(extra.type===1) return [segment.text(content)]
        if(extra.type===2) return [segment.image(content)]
        if(extra.type===3) return [segment.video(content)]
        if(extra.type===4) return [segment.file(content)]
        if(extra.type===8) return [segment.audio(content)]
        if(extra.type===10) return JSON.parse(content)
        const segments: MessageSegment[] = []
        const pushAtInfo=(atMatch:RegExpExecArray)=>{
            const idx=content.indexOf(atMatch[0])
            segments.push(segment.markdown(content.slice(0,idx)))
            segments.push(segment.at(atMatch[1]))
            content=content.slice(idx+atMatch[0].length)
        }
        while (content.length) {
            const atMatch=/\(met\)(\d+|here|all)\(met\)/.exec(content)
            if(atMatch) pushAtInfo(atMatch)
            else break;
        }
        if (content.length) segments.push(segment.markdown(content))
        return segments
    }
    export async function processMessage(this: Client, message: Sendable, quote?: Quotable): Promise<[string, Quotable?, number?]> {
        if (!Array.isArray(message)) message = [message];
        let result: string = '';
        let messageType: number = 1; // 默认文本消息类型


        for (const seg of message) {
            if (typeof seg === 'object' && (seg as any).__isCard) {
                const card = { ...(seg as any) };
                delete card.__isCard;

                // 递归处理卡片中的所有图片
                const processImages = async (obj: any) => {
                    if (Array.isArray(obj)) {
                        for (const item of obj) {
                            await processImages(item);
                        }
                    } else if (obj && typeof obj === 'object') {
                        // 处理图片元素
                        if (obj.type === 'image' && obj.src) {
                            // 如果是本地文件，自动上传
                            if (obj.src.startsWith('file://')) {
                                obj.src = await this.uploadMedia(obj.src);
                            }
                            // 如果是base64数据，也上传
                            else if (obj.src.startsWith('data:image/')) {
                                obj.src = await this.uploadMedia(obj.src);
                            }
                        }

                        // 递归处理子对象
                        for (const key in obj) {
                            if (obj[key] && typeof obj[key] === 'object') {
                                await processImages(obj[key]);
                            }
                        }
                    }
                };

                await processImages(card);

                validateCard(card);
                result = JSON.stringify([card]);
                messageType = 10;
                break;
            }
            // 处理特殊卡片对象
            if (typeof seg === 'object' && (seg as any).__isCard) {
                const { __isCard, ...cardData } = seg as any;

                // 最终验证（确保在发送前）
                validateCard(cardData);

                // 将卡片包装在数组中
                result = JSON.stringify([cardData]);
                messageType = 10;
                break;
            }

            // 处理字符串类型的消息段
            if (typeof seg === 'string') {
                result += seg;
                continue;
            }

            // 处理对象类型的消息段
            switch (seg.type) {
                case "text":
                    result += seg.text;
                    break;
                case "at":
                    result += `(met)${seg.user_id}(met)`;
                    break;
                case "audio":
                    result = await this.uploadMedia(seg.url);
                    messageType = 8; // 音频消息类型
                    break;
                case "video":
                    result = await this.uploadMedia(seg.url);
                    messageType = 3; // 视频消息类型
                    break;
                case "file":
                    throw new Error(`can't send file`);
                case "card":
                    // 最终验证（确保在发送前）
                    validateCard(seg);

                    // 将卡片包装在数组中
                    result = JSON.stringify([seg]);
                    messageType = 10;
                    break;
                case "image":
                    result = await this.uploadMedia(seg.url);
                    messageType = 2; // 图片消息类型
                    break;
                case "markdown":
                    result = seg.text;
                    messageType = 9; // Markdown 消息类型
                    break;
                case "reply":
                    if (!quote) {
                        quote = {
                            message_id: seg.id
                        };
                    }
                    break;
            }

            // 如果是非文本消息，处理完第一个有效段后退出循环
            if (messageType !== 1) break;
        }

        return [result, quote, messageType];
    }
}

