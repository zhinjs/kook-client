export interface Role{

}
export namespace Role{
    export interface Info{
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
}
