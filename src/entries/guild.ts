import {Contact} from "./contact.js";
import {Client, Message, Quotable, Sendable} from "../index.js";
import {NotifyType, UnsupportedMethodError} from "../constans.js";
import {Channel} from "./channel.js";
import {User} from "./user.js";

export class Guild extends Contact{
    constructor(c:Client,public info:Guild.Info) {
        super(c);
    }
    async renew(){
        const {data}=await this.c.request.get('/v3/guild/view',{
            params:{
                guild_id:this.info.id
            }
        })
        this.info=data
    }
    async quit(){
        const result=await this.c.request.post('/v3/guild/leave',{
            guild_id:this.info.id
        })
        if(result['code']===0) return this.c.guilds.delete(this.info.id)
        throw new Error(result['message'])
    }
    async getRoleList():Promise<Guild.Role[]>{
        const _getRoleList=async (page:number=1,page_size=100)=>{
            const {data:{items=[],meta={page:1,total_page:1}}}=await this.c.request.get('/v3/guild-role/list',{
                params:{
                    guild_id:this.info.id,
                    page
                }
            })
            if(meta.total_page<=page) return items
            return items.concat(await _getRoleList(page+1,page_size))
        }
        return await _getRoleList()
    }
    async createRole(name:string):Promise<Guild.Role>{
        const {data}=await this.c.request.post('/v3/guild-role/create',{
            guild_id:this.info.id,
            name
        })
        return data
    }
    async updateRole(role_id:string,update_info:Partial<Omit<Guild.Role, 'id'>>):Promise<Guild.Role>{
        const {data}=await this.c.request.post('/v3/guild-role/update',{
            guild_id:this.info.id,
            role_id,
            ...update_info
        })
        return data
    }
    async deleteRole(role_id:string){
        const result=await this.c.request.post('/v3/guild-role/delete',{
            guild_id:this.info.id,
            role_id
        })
        if(result['code']===0) return true
        throw new Error(result['message'])
    }
    async kick(user_id:string){
        const result=await this.c.request.post('/v3/guild/kickout',{
            guild_id:this.info.id,
            target_id:user_id
        })
        if(result['code']===0) return true
        throw new Error(result['message'])
    }
    async createChannel(channel_info:Omit<Channel.Info,'id'>):Promise<Channel.Info>{
        const {data} = await this.c.request.post('/v3/channel/create',{
            guild_id:this.info.id,
            ...channel_info
        })
        return data
    }
    async sendMsg(message: Sendable, quote?: Quotable): Promise<Message.Ret> {
        throw UnsupportedMethodError
    }

    recallMsg(message_id: string): Promise<boolean> {
        throw UnsupportedMethodError
    }

    updateMsg(message_id: string, newMessage: Sendable): Promise<boolean> {
        throw UnsupportedMethodError
    }

    getMsg(message_id: string): Promise<Message> {
        throw UnsupportedMethodError
    }
}
export namespace Guild {
    export const map:WeakMap<Info,Guild>=new WeakMap<Guild.Info, Guild>()
    export function as(this:Client,guild_id:string){
        const guildInfo=this.guilds.get(guild_id)
        if(!guildInfo) throw new Error(`未找到${guild_id}服务器`)
        if(map.has(guildInfo)) return map.get(guildInfo)
        const guild=new Guild(this,guildInfo)
        map.set(guildInfo,guild)
        return guild
    }
    export interface Info {
        /**
         * 服务器id
         */
        id: string
        /**
         * 服务器名称
         */
        name: string
        /**
         * 服务器主题
         */
        topic: string
        /**
         * 服务器主人id
         */
        user_id: string
        /**
         * icon url
         */
        icon: string
        /**
         * 通知类型
         */
        notify_type: NotifyType
        /**
         * 默认语音区域
         */
        region: string
        /**
         * 是否公开服务器
         */
        enable_open: number
        /**
         * 服务器公开id
         */
        open_id?: number
        /**
         * 默认频道
         */
        default_channel_id?: string
        /**
         * 欢迎频道
         */
        welcome_channel_id?: string
        /**
         * 助力数
         */
        boost_num?:number
        /**
         * 服务器等级
         */
        level?:number
    }

    export interface Role{
        role_id:number
        name:string
        color:number
        position:number
        hoist:number
        mentionable:number
        permissions:number
    }

    export enum Permission{
        Admin=1,
        ManageGuild,
        ViewAdminLog=4,
        CreateGuildInvite=8,
        ManageInvite=16,
        ManageChannel=32,
        KickUser=64,
        BanUser=128,
        ManageCustomFace=256,
        UpdateGuildName=512,
        ManageRole=1024,
        ViewContentOrVoiceChannel=2048,
        PublishMsg=4096,
        ManageMsg=8192,
        UploadFile=16384,
        VoiceLink=32768,
        ManageVoice=65536,
        AtAll=131072,
        AddReaction=262144,
        FollowReaction=524288,
        PassiveLinkVoiceChannel=1048576,
        PressKeyTalk=2097152,
        FreeTally=4194304,
        Talk=8388608,
        MuteGuild=16777216,
        CloseGuildWheat=33554432,
        UpdateOtherUserNickname=67108864,
        PlayMusic=134217728,
    }
    export interface BlackInfo{
        user_id:string
        created_time:number
        remark:string
        user:User.Info
    }
}
