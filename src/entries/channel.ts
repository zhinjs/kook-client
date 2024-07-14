import {ChannelType} from "@/constans";
import {Contact} from "@/entries/contact";
import {Client, Message, Quotable, Sendable} from "@";
import {User} from "@/entries/user";
import {ChannelMessageEvent} from "@/event";
export class Channel extends Contact{
    constructor(c:Client,public info:Channel.Info) {
        super(c);
    }
    async update(newInfo:Omit<Channel.Info, 'id'>){
        const {data}=await this.c.request.post('/v3/channel/update',{
            channel_id:this.info.id,
            ...newInfo
        })
        // 更新缓存
        this.c.channels.set(this.info.id,data)
        Channel.map.delete(this.info)
        Channel.map.set(data,this)
        this.info=data
    }
    async getMsg(message_id: string): Promise<Message> {
        const {data}=await this.c.request.get('/v3/message/view',{
            params:{
                msg_id:message_id
            }
        })
        return ChannelMessageEvent.fromDetail(this.c,this.info.id,data)
    }

    async delete(){
        const result=await this.c.request.post('/v3/channel/delete',{
            channel_id:this.info.id
        })
        if(result['code']!==0) throw new Error(result['message'])
        // 清空本地缓存
        this.c.channels.delete(this.info.id)
        this.c.channelMembers.delete(this.info.id)
        Channel.map.delete(this.info)
    }

    /**
     * 获取指定消息之前的聊天历史
     * @param message_id {string} 消息id 不传则查询最新消息
     * @param len {number} 获取的聊天历史长度 默认50条
     */
    async getChatHistory(message_id?:string,len:number=50){
        const result= await this.c.request.post('/v3/message/list',{
            target_id:this.info.id,
            msg_id:message_id,
            page_size:len
        })
        return (result?.data?.items||[]).map((item:Message.Detail)=>{
            return ChannelMessageEvent.fromDetail(this.c,this.info.id,item)
        })
    }
    async sendMsg(message: Sendable, quote?: Quotable): Promise<Message.Ret> {
        let isCard:boolean;
        [message,quote,isCard]=await Message.processMessage.call(this.c,message,quote)
        const {data}=await this.c.request.post('/v3/message/create',{
            target_id:this.info.id,
            content:message,
            type:isCard?10:9,
            quote:quote?.message_id
        })
        if(!data) throw new Error('发送消息失败')
        this.c.logger.info(`send to Channel(${this.info.id}): `,message)
        return data
    }

    async recallMsg(message_id: string): Promise<boolean> {
        const result=await this.c.request.post('/v3/message/delete',{
            msg_id:message_id
        })
        return result['code']===0
    }

    async updateMsg(message_id: string, newMessage: Sendable,quote?:Quotable): Promise<boolean> {
        [newMessage,quote]=await Message.processMessage.call(this.c,newMessage,quote)
        const result=await this.c.request.post('/v3/message/update',{
            msg_id:message_id,
            content:newMessage,
            quote:quote?.message_id
        })
        return result['code']===0
    }
    async getMsgReactions(message_id:string,emoji?:string):Promise<User.Info[]>{
        const result=await this.c.request.get('/v3/message/reaction-list',{
            params:{
                msg_id:message_id,
                emoji:emoji?encodeURI(emoji):null
            }
        })
        return result.data
    }
    async addMsgReaction(message_id:string,emoji:string){
        await this.c.request.post('/v3/message/add-reaction',{
            msg_id:message_id,
            emoji
        })
    }
    async deleteMsgReaction(message_id:string,emoji:string,user_id?:string){
        await this.c.request.post('/v3/message/delete-reaction',{
            msg_id:message_id,
            emoji,
            user_id
        })
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
