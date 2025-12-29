import {User} from "./user.js";
import {Client} from "../index.js";

export class ChannelMember extends User{
    constructor(c:Client,public channel_id:string,info:User.Info) {
        super(c,info);
    }
    get channel(){
        return this.c.pickChannel(this.channel_id)
    }
    async move(channel_id:string){
        return this.channel.addUsers([this.info.id])
    }
}
export namespace ChannelMember{
    export const map:WeakMap<User.Info,ChannelMember>=new WeakMap<User.Info, ChannelMember>()
    export function as(this:Client,channel_id:string,user_id:string){
        const memberInfo=this.channelMembers.get(channel_id)?.get(user_id)
        if(!memberInfo) throw new Error(`频道(${channel_id}) 不存在成员(${user_id})`)
        if(map.has(memberInfo)) return map.get(memberInfo)
        const member=new ChannelMember(this,channel_id,memberInfo)
        map.set(memberInfo,member)
        return member
    }
}
