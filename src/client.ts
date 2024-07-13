import {BaseClient} from "./core/baseClient";
import {Guild} from "./entries/guild";
import {Channel} from "@/entries/channel";
import {User} from "@/entries/user";

export class Client extends BaseClient {
    guilds:Map<string,Guild.Info>=new Map<string, Guild.Info>()
    channels:Map<string,Channel.Info>=new Map<string, Channel.Info>()
    users:Map<string,User.Info>=new Map<string, User.Info>()
    pickGuild=Guild.as.bind(this)
    pickChannel=Channel.as.bind(this)
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
    async getGuildInfo(guild_id:string):Promise<Guild.ApiInfo>{
        const {data: {id: _, name: guild_name, joined_at, ...guild}}=await this.request.get(`/v3/guild/view`,{
            params:{guild_id}
        })
        return {
            guild_id,
            guild_name,
            join_time: new Date(joined_at).getTime() / 1000,
            ...guild
        }
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
     */
    async getGuildUserList(guild_id: string):Promise<User.Info[]> {
        const _getGuildMemberList = async (page=1,page_size=100) => {
            const res = await this.request.get(`/v3/guild/user-list`, {
                params: {
                    page,
                    page_size,
                    guild_id
                }
            }).catch(() => ({data: {items:[]}}))// 公域没有权限，做个兼容
            if (!res.data.items?.length) return []
            const result = res.data.items || []
            if(page===res.data.meta?.page_total) return result
            return [...result, ...await _getGuildMemberList(page+1)]
        }
        return await _getGuildMemberList()
    }
    async #initChannels(guild_id:string){
        const channels = await this.getChannelList(guild_id)
        for(const channelInfo of channels){
            this.channels.set(channelInfo.id,channelInfo)
        }
    }
    async #initUsers(guild_id:string){
        const users = await this.getGuildUserList(guild_id)
        for(const userInfo of users){
            this.users.set(userInfo.id,userInfo)
        }
    }
    async init(){
        const userInfo=await this.getSelfInfo()
        this.self_id=userInfo.id
        this.nickname=userInfo.nickname
        this.logger.info(`welcome ${this.nickname}, 正在加载资源...`)
        const guilds=await this.getGuildList()
        for(const guildInfo of guilds){
            await this.#initChannels(guildInfo.id)
            await this.#initUsers(guildInfo.id)
            this.guilds.set(guildInfo.id,guildInfo)
        }
        this.logger.info(`加载了${this.guilds.size}个服务器，共计${this.channels.size}个频道,${this.users.size}个用户`)
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
