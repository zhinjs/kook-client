import {BaseClient} from "./core/baseClient.js";
import {Guild} from "./entries/guild.js";
import {Channel} from "./entries/channel.js";
import {User} from "./entries/user.js";
import {GuildMember} from "./entries/guildMember.js";
import {ChannelMember} from "./entries/channelMember.js";
import {EventMap} from "./event/index.js";
import {Quotable, Sendable} from "./elements.js";
type MemberMap=Map<string,User.Info>
type BlackMap=Map<string,Guild.BlackInfo>
export class Client extends BaseClient {
    guilds:Map<string,Guild.Info>=new Map<string, Guild.Info>()
    blacklist:Map<string,BlackMap>=new Map<string, BlackMap>()
    channels:Map<string,Channel.Info>=new Map<string, Channel.Info>()
    guildMembers:Map<string,MemberMap>=new Map<string, MemberMap>()
    channelMembers:Map<string,MemberMap>=new Map<string, MemberMap>()
    users:Map<string,User.Info>=new Map<string, User.Info>()
    pickGuild=Guild.as.bind(this)
    pickGuildMember=GuildMember.as.bind(this)
    pickChannel=Channel.as.bind(this)
    pickChannelMember=ChannelMember.as.bind(this)
    pickUser=User.as.bind(this)
    constructor(config: Client.Config) {
        super(Object.assign({},Client.defaultConfig,config))
        const nodeVersion=parseInt(process.version.slice(1))
        if(nodeVersion<16){
            this.logger.warn(`你的node版本(${process.version}) <16，可能会出现不可预测的错误，请升级node版本，为确保服务正常运行，请升级node版本`)
        }
        process.on("uncaughtException",e=>{
            this.logger.debug(e.stack)
        })
    }
    get black_user_nums(){
        return [...this.blacklist.values()].reduce((a,b)=>a+b.size,0)
    }
    async getSelfInfo():Promise<User.Info>{
        const {data}=await this.request.get('/v3/user/me')
        return data
    }
    async setOnline(){
        const result = await this.request.post('/v3/user/online')
        return result['code']===0
    }
    async setOffline(){
        const result = await this.request.post('/v3/user/offline')
        return result['code']===0
    }
    async getOnlineStatus():Promise<{online:boolean,online_os:string[]}>{
        const {data}=await this.request.get('/v3/user/get-online-status')
        return data
    }
    /**
     * 获取频道列表
     */
    async getGuildList() {
        const _getGuildList = async (page=1,page_size=100) => {
            const res = await this.request.get('/v3/guild/list', {
                params: {
                    page,
                    page_size
                }
            }).catch(() => ({data: {items:[]}}))// 私域不支持获取频道列表，做个兼容
            if (!res.data.items?.length) return []
            const result = res.data.items || []
            const {meta:{page_total}}=res.data
            if(page===page_total) return result
            return [...result, ...await _getGuildList(page+1)]
        }
        return await _getGuildList() as Guild.Info[]
    }
    /**
     * 获取频道信息
     * @param guild_id
     */
    async getGuildInfo(guild_id:string):Promise<Guild.Info>{
        const {data}=await this.request.get(`/v3/guild/view`,{
            params:{guild_id}
        })
        return data
    }
    async getChannelList(guild_id:string):Promise<Channel.Info[]>{
        const _getChannelList = async (page=1,page_size=100) => {
            const res = await this.request.get(`/v3/channel/list`, {
                params: {
                    page,
                    page_size,
                    guild_id
                }
            }).catch(() => ({data: {items:[]}}))// 公域没有权限，做个兼容
            if (!res.data.items?.length) return []
            const result = res.data.items || []
            if(page===res.data.meta.page_total) return result
            return [...result, ...await _getChannelList(page+1)]
        }
        return await _getChannelList()
    }
    /**
     * 获取频道成员列表
     * @param guild_id
     * @param channel_id
     */
    async getGuildUserList(guild_id: string,channel_id?:string):Promise<User.Info[]> {
        const _getGuildMemberList = async (page=1,page_size=100) => {
            const res = await this.request.get(`/v3/guild/user-list`, {
                params: {
                    page,
                    page_size,
                    guild_id,
                    channel_id
                }
            }).catch(() => ({data: {items:[]}}))// 公域没有权限，做个兼容
            if (!res.data.items?.length) return []
            const result = res.data.items || []
            if(page===res.data.meta?.page_total) return result
            return [...result, ...await _getGuildMemberList(page+1)]
        }
        return await _getGuildMemberList()
    }
    async getBlacklist(guild_id:string):Promise<Guild.BlackInfo[]>{
        const {data:{items}}=await this.request.get('/v3/blacklist/list',{
            params:{
                guild_id
            }
        })
        return items
    }
    async sendPrivateMsg(user_id:string,message:Sendable,quote?:Quotable){
        return this.pickUser(user_id).sendMsg(message,quote)
    }
    async sendChannelMsg(channel_id:string,message:Sendable,quote?:Quotable){
        return this.pickChannel(channel_id).sendMsg(message,quote)
    }
    async getPrivateMsg(user_id:string,message_id:string){
        return this.pickUser(user_id).getMsg(message_id)
    }
    async getChannelMsg(channel_id:string,message_id:string){
        return this.pickChannel(channel_id).getMsg(message_id)
    }
    async recallPrivateMsg(user_id:string,message_id:string){
        return this.pickUser(user_id).recallMsg(message_id)
    }
    async recallChannelMsg(channel_id:string,message_is:string){
        return this.pickChannel(channel_id).recallMsg(message_is)
    }
    async getPrivateChatHistory(user_id:string,message_id?:string,len:number=50){
        return this.pickUser(user_id).getChatHistory(message_id,len)
    }
    async getChannelChatHistory(channel_id:string,message_id?:string,len:number=50){
        return this.pickChannel(channel_id).getChatHistory(message_id,len)
    }
    async #initChannels(guild_id:string){
        const channels = await this.getChannelList(guild_id)
        for(const channel of channels){
            this.channelMembers.set(channel.id,new Map<string, User.Info>())
            this.channels.set(channel.id,channel)
            const channelMembers=await this.getGuildUserList(guild_id,channel.id)
            for(const temp of channelMembers){
                const userInfo=this.users.get(temp.id)||temp
                this.channelMembers.get(channel.id)?.set(userInfo.id,userInfo)
            }
        }
    }
    async #initUsers(guild_id:string){
        this.guildMembers.set(guild_id,new Map<string, User.Info>())
        const users = await this.getGuildUserList(guild_id)
        for(const temp of users){
            const user=this.users.get(temp.id)||temp
            this.guildMembers.get(guild_id)?.set(user.id,user)
            this.users.set(user.id,user)
        }
    }
    async #initBlacklist(guild_id:string){
        this.blacklist.set(guild_id,new Map<string, Guild.BlackInfo>())
        const blacklist = await this.getBlacklist(guild_id)
        for(const temp of blacklist){
            this.blacklist.get(guild_id)?.set(temp.user_id,temp)
        }
    }
    async init(){
        const userInfo=await this.getSelfInfo()
        this.self_id=userInfo.id
        this.nickname=userInfo.nickname
        this.logger.info(`welcome ${this.nickname}, 正在加载资源...`)
        const guilds=await this.getGuildList()
        for(const guildInfo of guilds){
            this.guilds.set(guildInfo.id,guildInfo)
            await this.#initChannels(guildInfo.id)
            await this.#initUsers(guildInfo.id)
            await this.#initBlacklist(guildInfo.id)
        }
        this.logger.info(`加载了${this.guilds.size}个服务器，共计${this.channels.size}个频道,${this.users.size}个用户,${this.blacklist.size}个黑名单用户`)
    }
    async connect() {
        await this.receiver.connect()
        return this.init()
    }

    async disconnect() {
        await this.receiver.disconnect()
    }
}

export namespace Client {
    export interface Info {
        id: string
        username: string
        avatar: string
        union_openid?: string
        union_user_account?: string
    }

    export interface Config extends BaseClient.Config {
    }
    export const defaultConfig:Partial<Config>={

    }
}
export function defineConfig(config:Client.Config){
    return config
}
export function createClient(config:Client.Config){
    return new Client(config)
}
export interface Client extends BaseClient{
    on<T extends keyof EventMap>(event: T, listener: EventMap[T]): this;

    on<S extends string|symbol>(
        event: S & Exclude<S, keyof EventMap>,
        listener: (...args:any[])=>any,
    ): this;
    emit<T extends keyof EventMap>(event:T,...args:Parameters<EventMap[T]>):boolean
    emit<S extends string|symbol>(event: S & Exclude<S, keyof EventMap>,...args:any[]):boolean
    once<T extends keyof EventMap>(event: T, listener: EventMap[T]): this;

    once<S extends string|symbol>(
        event: S & Exclude<S, keyof EventMap>,
        listener: (...args:any[])=>any,
    ): this;
    off<T extends keyof EventMap>(event: T): this;

    off<S extends string|symbol>(event: S & Exclude<S, keyof EventMap>): this;
}
