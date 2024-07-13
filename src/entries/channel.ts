import {ChannelType, UnsupportedMethodError} from "@/constans";
import {Contact} from "@/entries/contact";
import {Client, Message, Quotable, Sendable} from "@";
export class Channel extends Contact{
    constructor(c:Client,public info:Channel.Info) {
        super(c);
    }

    async sendMsg(message: Sendable, quote?: Quotable): Promise<Message.Ret> {
        let content=await Message.processMessage.call(this.c,message)
        const replyExec=/^\(reply\)([^(]+)\(reply\)/.exec(content)
        if(!quote && replyExec){
            quote={
                message_id:replyExec[1]
            }
            content=content.replace(replyExec[0],'')
        }
        const {data}=await this.c.request.post('/v3/message/create',{
            target_id:this.info.id,
            content,
            type:9,
            quote:quote&& quote.message_id
        })
        if(!data) throw new Error('发送消息失败')
        this.c.logger.info(`send to Channel(${this.info.id}): `,message)
        return data
    }
}
export namespace Channel {
    export const map:WeakMap<Info,Channel>=new WeakMap<Channel.Info, Channel>()
    export function as(this:Client,channel_id:string){
        const channelInfo=this.channels.get(channel_id)
        if(!channelInfo) throw new Error(`未找到${channel_id}频道`)
        if(map.has(channelInfo)) return map.get(channelInfo)
        const channel=new Channel(this,channelInfo)
        map.set(channelInfo,channel)
        return channel
    }
    export interface Info {
        /**
         * 频道id
         */
        id: string
        /**
         * 创建者id
         */
        user_id: string
        /**
         * 频道名称
         */
        /**
         * 父分组频道id
         */
        parent_id?: string
        name: string
        /**
         * 频道类型
         */
        type: ChannelType
        /**
         * 频道排序
         */
        level: number
        /**
         * 人数限制
         */
        limit_account: number
        is_category?: boolean
    }
}
