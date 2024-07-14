import {Contact} from "@/entries/contact";
import {Client, Message, Quotable, Sendable} from "@";
import { PrivateMessageEvent} from "@/event";

export class User extends Contact{
    constructor(c:Client,public info:User.Info) {
        super(c);
    }
    async sendMsg(message: Sendable, quote?: Quotable): Promise<Message.Ret> {
        let isCard:boolean;
        [message,quote,isCard]=await Message.processMessage.call(this.c,message,quote)
        const {data}=await this.c.request.post('/v3/direct-message/create', {
            target_id: this.info.id,
            content:message,
            type: isCard?10:9,
            quote: quote?.message_id
        })
        if (!data) throw new Error('发送消息失败')
        this.c.logger.info(`send to User(${this.info.id}): `, message)
        return data
    }

    async recallMsg(message_id: string): Promise<boolean> {
        const result=await this.c.request.post('/v3/direct-message/delete',{
            msg_id:message_id
        })
        return result['code']===0
    }
    async getMsgReactions(message_id:string,emoji?:string):Promise<User.Info[]>{
        const result=await this.c.request.get('/v3/direct-message/reaction-list',{
            params:{
                msg_id:message_id,
                emoji:emoji?encodeURI(emoji):null
            }
        })
        return result.data
    }
    async addMsgReaction(message_id:string,emoji:string){
        await this.c.request.post('/v3/direct-message/add-reaction',{
            msg_id:message_id,
            emoji
        })
    }
    async deleteMsgReaction(message_id:string,emoji:string,user_id?:string){
        await this.c.request.post('/v3/direct-message/delete-reaction',{
            msg_id:message_id,
            emoji,
            user_id
        })
    }
    async updateMsg(message_id: string, newMessage: Sendable,quote?:Quotable): Promise<boolean> {
        [newMessage,quote]=await Message.processMessage.call(this.c,newMessage,quote)
        const result=await this.c.request.post('/v3/direct-message/update',{
            msg_id:message_id,
            content:newMessage,
            quote:quote?.message_id
        })
        return result['code']===0
    }
    /**
     * 获取指定消息之前的聊天历史
     * @param message_id {string} 消息id 不传则查询最新消息
     * @param len {number} 获取的聊天历史长度 默认50条
     */
    async getChatHistory(message_id?:string,len:number=50){
        const result= await this.c.request.post('/v3/direct-message/list',{
            target_id:this.info.id,
            msg_id:message_id,
            page_size:len
        })
        return (result?.data?.items||[]).map((item:Message.Detail)=>{
            return PrivateMessageEvent.fromDetail(this.c,this.info.id,item)
        })
    }
    async getMsg(message_id: string): Promise<Message> {
        const {data}=await this.c.request.get('/v3/direct-message/view',{
            params:{
                msg_id:message_id
            }
        })
        return PrivateMessageEvent.fromDetail(this.c,this.info.id,data)
    }
    asGuildMember(guild_id:string){
        return this.c.pickGuildMember(guild_id,this.info.id)
    }
    asChannelMember(channel_id:string){
        return this.c.pickChannelMember(channel_id,this.info.id)
    }
}
export namespace User {
    export const map:WeakMap<Info,User>=new WeakMap<Info, User>()
    export function as(this:Client,user_id:string,from_id?:never){
        const userInfo=this.users.get(user_id)
        if(!userInfo) throw new Error(`未找到${user_id}用户`)
        if(map.has(userInfo)) return map.get(userInfo)
        const user=new User(this,userInfo)
        map.set(userInfo,user)
        return user
    }
    export interface Info {
        /**
         * 用户id
         */
        id: string
        /**
         * 频道id
         */
        guild_id?:string
        /**
         * 用户名称
         */
        username: string
        /**
         * 用户昵称
         */
        nickname:string
        /**
         * 用户名认证数字
         */
        identify_num:string
        /**
         * 是否在线
         */
        online:boolean
        /**
         * 是否机器人
         */
        bot:boolean
        /**
         * 用户状态
         */
        status:1|0|10
        /**
         * 用户头像
         */
        avatar: string
        /**
         * vip用户头像
         */
        vip_avatar:string
        /**
         * 是否验证了手机号
         */
        mobile_verified: boolean
        roles: number[]
    }

    export enum Permission {
        normal = 1,
        admin = 2,
        owner = 4,
        channelAdmin = 5,
    }
}
