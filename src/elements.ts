type ElementMap={
    'plain-text':{
        content:string
        emoji?:boolean
    }
    'kmarkdown':{
        content:string
    }
    'image':{
        src:string
        alt?:string
        size?:'sm'|'lg'
        circle?:boolean
    }
    'button':{
        theme:'primary'|'warning'|'danger'|'info'
        value:string
        click?:'link'|'return-val'
        text:string
    }
    paragraph:{
        cols:1|2|3
        fields:(TextElement|MarkdownElement)[]
    }
}
export type ElementType=keyof ElementMap
export type Element<T extends ElementType=ElementType>={
    type:T
}&ElementMap[T]
export type TextElement=Element<'plain-text'>
export type MarkdownElement=Element<'kmarkdown'>
export type ImageElement=Element<'image'>
export type ButtonElement=Element<'button'>
export type ParagraphElement=Element<'paragraph'>
export type ElementGenerator={
    <T extends ElementType=ElementType>(type:T,data:ElementMap[T]):Element<T>
    text(content:string,emoji?:boolean):TextElement
    markdown(content:string):MarkdownElement
    image(src:string,alt?:string,size?:'sm'|'lg',circle?:boolean):ImageElement
    button(text:string,value:string,theme:'primary'|'warning'|'danger'|'info',click?:'link'|'return-val'):ButtonElement
    paragraph(cols:1|2|3,fields:(TextElement|MarkdownElement)[]):ParagraphElement
}
export const element:ElementGenerator=function (type,data){
    return {
        type,
        ...data
    }
} as ElementGenerator
element.text=(content,emoji)=>({
    type:'plain-text',
    content,
    emoji
})
element.markdown=(content)=>({
    type:'kmarkdown',
    content
})
element.image=(src,alt,size,circle)=>({
    type:'image',
    src,
    alt,
    size,
    circle
})
element.button=(text,value,theme,click)=>({
    type:'button',
    text,
    value,
    theme,
    click
})
element.paragraph=(cols,fields)=>({
    type:'paragraph',
    cols,
    fields
})
type ModuleMap={
    header:{
        text:TextElement
    }
    section:{
        text?:TextElement|MarkdownElement|ParagraphElement
        mode:'left'|'right'
        accessory:ImageElement|ButtonElement
    }
    'image-group':{
        elements:ImageElement[]
    }
    'container':{
        elements:ImageElement[]
    }
    'action-group':{
        elements:ButtonElement[]
    }
    'context':{
        elements:(TextElement|MarkdownElement|ImageElement)[]
    }
    'divider':{}
    file:{
        src:string
        title:string
    }
    audio:{
        src:string
        title:string
        cover?:string
    }
    video:{
        src:string
        title:string
    }
    countdown:{
        startTime:number
        endTime:number
        mode:'day'|'hour'|'second'
    }
    invite:{
        code:string
    }
}
export type ModuleType=keyof ModuleMap
export type Module<T extends ModuleType=ModuleType>={
    type:T
}&ModuleMap[T]
export type HeaderModule=Module<'header'>
export type SectionModule=Module<'section'>

export type ImageModule=Module<'image-group'>
export type ContainerModule=Module<'container'>
export type ActionModule=Module<'action-group'>
export type ContextModule=Module<'context'>
export type DividerModule=Module<'divider'>
export type FileModule=Module<'file'>|Module<'audio'>|Module<'video'>
export type CountdownModule=Module<'countdown'>
export type InviteModule=Module<'invite'>
export type ModuleGenerator={
    <T extends ModuleType=ModuleType>(type:T,data:ModuleMap[T]):Module<T>
    header:(text:TextElement)=>HeaderModule
    section:(text?:TextElement|MarkdownElement|ParagraphElement,mode?:'left'|'right',accessory?:ImageElement|ButtonElement)=>SectionModule
    image:(elements:ImageElement[])=>ImageModule
    container:(elements:ImageElement[])=>ContainerModule
    action:(elements:ButtonElement[])=>ActionModule
    context:(elements:(TextElement|MarkdownElement|ImageElement)[])=>ContextModule
    divider:()=>DividerModule
    file:(src:string,title:string)=>FileModule
    audio:(src:string,title:string,cover?:string)=>FileModule
    video:(src:string,title:string)=>FileModule
    countdown:(startTime:number,endTime:number,mode?:'day'|'hour'|'second')=>CountdownModule
    invite:(code:string)=>InviteModule
}
export const msgMod:ModuleGenerator=function (type,data) {
    return {
        type,
        ...data
    }
} as ModuleGenerator
msgMod.header=(text)=>({
    type:'header',
    text
})
msgMod.section=(text,mode,accessory)=>({
    type:'section',
    text,
    mode,
    accessory
})
msgMod.image=(elements)=>({
    type:'image-group',
    elements
})
msgMod.container=(elements)=>({
    type:'container',
    elements
})
msgMod.action=(elements)=>({
    type:'action-group',
    elements
})
msgMod.context=(elements)=>({
    type:'context',
    elements
})
msgMod.divider=()=>({
    type:'divider'
})
msgMod.file=(src,title)=>({
    type:'file',
    src,
    title
})
msgMod.audio=(src,title,cover)=>({
    type:'audio',
    src,
    title,
    cover
})
msgMod.video=(src,title)=>({
    type:'video',
    src,
    title
})
msgMod.countdown=(startTime,endTime,mode)=>({
    type:'countdown',
    startTime,
    endTime,
    mode
})
msgMod.invite=(code)=>({
    type:'invite',
    code
})

type SegmentMap={
    text:{
        text:string
    }
    at:{
        user_id:string
    }
    card:{
        modules:Module[]
    }
    image:{
        url:string
        title?:string
    }
    video:{
        url:string
        title?:string
    }
    audio:{
        url:string
        title?:string
    }
    markdown:{
        text:string
    }
    reply:{
        id:string
    }
    file:{
        url:string
        name?:string
        file_type?:string
        size?:number
    }
}
export type SegmentType=keyof SegmentMap
export type Segment<T extends SegmentType=SegmentType> = {
    type:T
}&SegmentMap[T]
/**
 * 仅发送，不会收到
 */
export type TextSegment=Segment<'text'>
/**
 * 收发通用
 */
export type AtSegment=Segment<'at'>
export type CardSegment=Segment<'card'>
/**
 * 收发通用
 */
export type ImageSegment=Segment<'image'>
/**
 * 收发通用
 */
export type AudioSegment=Segment<'audio'>
/**
 * 收发通用
 */
export type VideoSegment=Segment<'video'>
/**
 * 收发通用
 */
export type MarkdownSegment=Segment<'markdown'>
/**
 * 收发通用
 */
export type ReplySegment=Segment<'reply'>
/**
 * 仅接收
 */
export type FileSegment=Segment<'file'>
export type Quotable={
    message_id:string
}
export type MessageSegment=AtSegment|TextSegment|ImageSegment|MarkdownSegment|ReplySegment|FileSegment|CardSegment|VideoSegment|AudioSegment
export type Sendable=string|MessageSegment|Array<string|MessageSegment>
export type SegmentGenerator={
    <T extends SegmentType>(type:T,attrs:SegmentMap[T]):Segment<T>
    image:(url:string)=>ImageSegment
    video:(url:string)=>VideoSegment
    audio:(url:string)=>AudioSegment
    markdown:(text:string)=>MarkdownSegment
    text:(text:string)=>TextSegment
    at:(user_id:string)=>AtSegment
    card:(attrs:SegmentMap['card'])=>CardSegment
    reply:(message_id:string)=>ReplySegment
    file:(url:string)=>FileSegment
}
export const segment:SegmentGenerator=function <T extends SegmentType>(type:T,attrs:SegmentMap[T]){
    return {
        type,
        ...attrs
    }
} as SegmentGenerator
segment.at=user_id=>segment('at', {user_id})
segment.image=(url)=>segment('image', {url})
segment.markdown=text=>segment('markdown', {text})
segment.text=text=>segment('text', {text})
segment.card=attrs=>segment('card',attrs)
segment.reply=message_id=>segment('reply', {id:message_id})
segment.file=url=>segment('file', {url})
segment.video=url=>segment('video', {url})
segment.audio=url=>segment('audio', {url})
