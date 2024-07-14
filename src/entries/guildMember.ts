import {User} from "@/entries/user";
import {Client} from "@";

export class GuildMember extends User{
    constructor(c:Client,public guild_id:string,info:User.Info) {
        super(c,info);
    }
    get guild(){
        return this.c.pickGuild(this.guild_id)
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
