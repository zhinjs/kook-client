import {Contact} from "@/entries/contact";
import {Client, Message, Quotable, Sendable} from "@";
import {UnsupportedMethodError} from "@/constans";

export class User extends Contact{
    constructor(c:Client,public info:User.Info) {
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
        const {data}=await this.c.request.post('/v3/direct-message/create', {
            target_id: this.info.id,
            content,
            type: 9,
            quote: quote && quote.message_id
        })
        if (!data) throw new Error('发送消息失败')
        this.c.logger.info(`send to User(${this.info.id}): `, message)
        return data
    }
}
export namespace User {
    export const map:WeakMap<Info,User>=new WeakMap<Info, User>()
    export function as(this:Client,user_id:string){
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
