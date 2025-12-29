import {User} from "./user.js";
import {Client} from "../index.js";

export class GuildMember extends User{
    constructor(c:Client,public guild_id:string,info:User.Info) {
        super(c,info);
    }
    get guild(){
        return this.c.pickGuild(this.guild_id)
    }
    async setNickname(nickname:string){
        const result = await this.c.request.post('/v3/guild/nickname', {
            guild_id:this.guild_id,
            nickname,
            user_id:this.info.id
        })
        return result['code']===0
    }
    async grant(role_id:string){
        const result = await this.c.request.post('/v3/guild/role', {
            guild_id:this.guild_id,
            role_id,
            user_id:this.info.id
        })
        return result['code']===0
    }
    async revoke(role_id:string){
        const result = await this.c.request.post('/v3/guild/role', {
            guild_id:this.guild_id,
            role_id,
            user_id:this.info.id
        })
        return result['code']===0
    }
    async addToBlackList(remark?:string,del_msg_days=0){
        if(this.c.blacklist.get(this.guild_id)?.has(this.info.id)) throw new Error(`用户(${this.info.id}) 已在黑名单中`)
        const result = await this.c.request.post('/v3/blacklist/create', {
            guild_id:this.guild_id,
            user_id:this.info.id,
            remark,
            del_msg_days
        })
        return result['code']===0
    }
    async removeFromBlackList(){
        const result = await this.c.request.post('/v3/blacklist/delete', {
            guild_id:this.guild_id,
            user_id:this.info.id
        })
        return result['code']===0
    }
    kick(){
        return this.guild.kick(this.info.id)
    }
}
export namespace GuildMember{
    export const map:WeakMap<User.Info,GuildMember>=new WeakMap<User.Info, GuildMember>()
    export function as(this:Client,guild_id:string,user_id:string){
        const memberInfo=this.guildMembers.get(guild_id)?.get(user_id)
        if(!memberInfo) throw new Error(`服务器(${guild_id}) 不存在成员(${user_id})`)
        if(map.has(memberInfo)) return map.get(memberInfo)
        const member=new GuildMember(this,guild_id,memberInfo)
        map.set(memberInfo,member)
        return member
    }
}
