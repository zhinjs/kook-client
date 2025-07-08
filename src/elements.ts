// 验证卡片消息
function validateCard(card: Segment<'card'>) {
    // 1. 验证卡片结构
    if (!card.modules || !Array.isArray(card.modules)) {
        throw new Error("卡片必须包含 'modules' 数组");
    }

    // 2. 验证模块数量限制
    const totalModules = card.modules.length;
    if (totalModules > 50) {
        throw new Error(`卡片模块数量不能超过 50，当前有 ${totalModules} 个`);
    }

    // 3. 验证主题限制
    if (card.theme === 'invisible') {
        const allowedTypes = new Set(['context', 'action-group', 'divider', 'header', 'container', 'file', 'audio', 'video']);

        for (const mod of card.modules) {
            if (!allowedTypes.has(mod.type)) {
                // 使用类型守卫检查 section 模块
                if (isSectionModule(mod) && mod.accessory) {
                    throw new Error("在 'invisible' 主题下，section 模块不能包含 accessory");
                }

                if (!allowedTypes.has(mod.type)) {
                    throw new Error(`在 'invisible' 主题下，不允许使用 ${mod.type} 模块`);
                }
            }
        }
    }

    // 4. 验证每个模块
    for (const mod of card.modules) {
        validateModule(mod);
    }
}
// 类型守卫函数
function isSectionModule(module: Module): module is SectionModule {
    return module.type === 'section';
}

function validateModule(module: Module) {
    switch (module.type) {
        case 'header':
            const headerMod = module as HeaderModule;
            if (!headerMod.text || headerMod.text.type !== 'plain-text') {
                throw new Error("header 模块必须包含 'text' 元素，且类型必须是 'plain-text'");
            }
            if (headerMod.text.content.length > 100) {
                throw new Error("header 文本内容不能超过 100 个字符");
            }
            break;

        case 'section':
            if (!isSectionModule(module)) break;

            const validTextTypes = ['plain-text', 'kmarkdown', 'paragraph'];
            if (module.text && !validTextTypes.includes(module.text.type)) {
                throw new Error(`section 的 text 必须是以下类型之一: ${validTextTypes.join(', ')}`);
            }

            const validAccessoryTypes = ['image', 'button'];
            if (module.accessory && !validAccessoryTypes.includes(module.accessory.type)) {
                throw new Error(`section 的 accessory 必须是以下类型之一: ${validAccessoryTypes.join(', ')}`);
            }

            if (module.mode !== 'left' && module.mode !== 'right') {
                throw new Error("section 的 mode 必须是 'left' 或 'right'");
            }

            if (module.accessory && module.mode === 'left' && module.accessory.type === 'button') {
                throw new Error("button 不能放置在左侧");
            }
            break;

        case 'image-group':
            const imageGroupMod = module as ImageModule;
            if (!imageGroupMod.elements || !Array.isArray(imageGroupMod.elements)) {
                throw new Error("image-group 必须包含 'elements' 数组");
            }

            if (imageGroupMod.elements.length < 1 || imageGroupMod.elements.length > 9) {
                throw new Error("image-group 只能包含 1-9 张图片");
            }

            for (const el of imageGroupMod.elements) {
                if (el.type !== 'image') {
                    throw new Error("image-group 只能包含 image 元素");
                }
            }
            break;

        case 'container':
            const containerMod = module as ContainerModule;
            if (!containerMod.elements || !Array.isArray(containerMod.elements)) {
                throw new Error("container 必须包含 'elements' 数组");
            }

            if (containerMod.elements.length < 1 || containerMod.elements.length > 9) {
                throw new Error("container 只能包含 1-9 张图片");
            }

            for (const el of containerMod.elements) {
                if (el.type !== 'image') {
                    throw new Error("container 只能包含 image 元素");
                }
            }
            break;

        case 'action-group':
            const actionMod = module as ActionModule;
            if (!actionMod.elements || !Array.isArray(actionMod.elements)) {
                throw new Error("action-group 必须包含 'elements' 数组");
            }

            if (actionMod.elements.length > 4) {
                throw new Error("action-group 最多只能包含 4 个按钮");
            }

            for (const el of actionMod.elements) {
                if (el.type !== 'button') {
                    throw new Error("action-group 只能包含 button 元素");
                }
            }
            break;

        case 'context':
            const contextMod = module as ContextModule;
            if (!contextMod.elements || !Array.isArray(contextMod.elements)) {
                throw new Error("context 必须包含 'elements' 数组");
            }

            if (contextMod.elements.length > 10) {
                throw new Error("context 最多只能包含 10 个元素");
            }

            const validContextTypes = ['plain-text', 'kmarkdown', 'image'];
            for (const el of contextMod.elements) {
                if (!validContextTypes.includes(el.type)) {
                    throw new Error(`context 只能包含以下类型元素: ${validContextTypes.join(', ')}`);
                }
            }
            break;

        case 'file':
        case 'audio':
        case 'video':
            const fileMod = module as FileModule;
            if (!fileMod.src) {
                throw new Error(`${fileMod.type} 模块必须包含 'src' 属性`);
            }
            if (!fileMod.title) {
                throw new Error(`${fileMod.type} 模块必须包含 'title' 属性`);
            }
            if (fileMod.type === 'audio' && !('cover' in fileMod)) {
                console.warn("audio 模块建议提供 'cover' 属性");
            }
            break;

        case 'countdown':
            const countdownMod = module as CountdownModule;
            if (!countdownMod.endTime) {
                throw new Error("countdown 模块必须包含 'endTime' 属性");
            }
            if (!countdownMod.mode || !['day', 'hour', 'second'].includes(countdownMod.mode)) {
                throw new Error("countdown 的 mode 必须是 'day', 'hour' 或 'second'");
            }
            if (countdownMod.mode === 'second' && !countdownMod.startTime) {
                throw new Error("当 mode 为 'second' 时，必须提供 'startTime'");
            }
            break;

        case 'invite':
            const inviteMod = module as InviteModule;
            if (!inviteMod.code) {
                throw new Error("invite 模块必须包含 'code' 属性");
            }
            break;
    }
}

// 验证元素
function validateElement(element: any) {
    switch (element.type) {
        case 'plain-text':
            if (!element.content) {
                throw new Error("plain-text 元素必须包含 'content' 属性");
            }
            if (element.content.length > 2000) {
                throw new Error("plain-text 内容不能超过 2000 个字符");
            }
            break;

        case 'kmarkdown':
            if (!element.content) {
                throw new Error("kmarkdown 元素必须包含 'content' 属性");
            }
            if (element.content.length > 5000) {
                throw new Error("kmarkdown 内容不能超过 5000 个字符");
            }
            break;

        case 'image':
            if (!element.src) {
                throw new Error("image 元素必须包含 'src' 属性");
            }
            break;

        case 'button':
            if (!element.text) {
                throw new Error("button 元素必须包含 'text' 属性");
            }
            if (!element.value) {
                throw new Error("button 元素必须包含 'value' 属性");
            }
            if (element.click && !['link', 'return-val'].includes(element.click)) {
                throw new Error("button 的 click 属性必须是 'link' 或 'return-val'");
            }
            break;

        case 'paragraph':
            if (!element.fields || !Array.isArray(element.fields)) {
                throw new Error("paragraph 必须包含 'fields' 数组");
            }
            if (element.fields.length > 50) {
                throw new Error("paragraph 最多只能包含 50 个字段");
            }
            if (element.cols < 1 || element.cols > 3) {
                throw new Error("paragraph 的 cols 必须是 1, 2 或 3");
            }

            const validFieldTypes = ['plain-text', 'kmarkdown'];
            for (const field of element.fields) {
                if (!validFieldTypes.includes(field.type)) {
                    throw new Error(`paragraph 只能包含以下类型字段: ${validFieldTypes.join(', ')}`);
                }
            }
            break;
    }
}
type ElementMap = {
    'plain-text': {
        content: string
        emoji?: boolean
    }
    'kmarkdown': {
        content: string
    }
    'image': {
        src: string
        alt?: string
        size?: 'sm'|'lg'
        circle?: boolean
        fallbackUrl?: string
    }
    'button': {
        theme: 'primary'|'warning'|'danger'|'info'|'success'|'secondary'|'none'
        value: string
        click?: 'link'|'return-val'
        text: string
    }
    'paragraph': {
        cols: 1|2|3
        fields: (TextElement|MarkdownElement)[]
    }
}

type ModuleMap = {
    'header': {
        text: TextElement
    }
    'section': {
        text?: TextElement|MarkdownElement|ParagraphElement
        mode: 'left'|'right'
        accessory?: ImageElement|ButtonElement
    }
    'image-group': {
        elements: ImageElement[]
    }
    'container': {
        elements: ImageElement[]
    }
    'action-group': {
        elements: ButtonElement[]
    }
    'context': {
        elements: (TextElement|MarkdownElement|ImageElement)[]
    }
    'divider': {}
    'file': {
        src: string
        title: string
    }
    'audio': {
        src: string
        title: string
        cover?: string
    }
    'video': {
        src: string
        title: string
    }
    'countdown': {
        startTime?: number
        endTime: number
        mode: 'day'|'hour'|'second'
    }
    'invite': {
        code: string
    }
}

type CardMap = {
    'card': {
        theme?: 'primary'|'warning'|'danger'|'info'|'success'|'secondary'|'none'|'invisible'
        color?: string
        size?: 'sm'|'lg'
        modules: Module[]
    }
}

// 元素类型定义
export type ElementType = keyof ElementMap
export type Element<T extends ElementType = ElementType> = {
    type: T
} & ElementMap[T]
export type TextElement = Element<'plain-text'>
export type MarkdownElement = Element<'kmarkdown'>
export type ImageElement = Element<'image'>
export type ButtonElement = Element<'button'>
export type ParagraphElement = Element<'paragraph'>

// 模块类型定义
export type ModuleType = keyof ModuleMap
export type Module<T extends ModuleType = ModuleType> = {
    type: T
} & ModuleMap[T]
export type HeaderModule = Module<'header'>
export type SectionModule = Module<'section'>
export type ImageModule = Module<'image-group'>
export type ContainerModule = Module<'container'>
export type ActionModule = Module<'action-group'>
export type ContextModule = Module<'context'>

export type DividerModule = Module<'divider'>
export type FileModule = Module<'file'>|Module<'audio'>|Module<'video'>
export type CountdownModule = Module<'countdown'>
export type InviteModule = Module<'invite'>

// 卡片类型定义
export type CardType = keyof CardMap
export type Card<T extends CardType = CardType> = {
    type: T
} & CardMap[T]

// 元素生成器
export type ElementGenerator = {
    <T extends ElementType = ElementType>(type: T, data: ElementMap[T]): Element<T>
    text(content: string, emoji?: boolean): TextElement
    markdown(content: string): MarkdownElement
    image(src: string, alt?: string, size?: 'sm'|'lg', circle?: boolean, fallbackUrl?: string): ImageElement
    button(text: string, value: string, theme?: 'primary'|'warning'|'danger'|'info'|'success'|'secondary'|'none', click?: 'link'|'return-val'): ButtonElement
    paragraph(cols: 1|2|3, fields: (TextElement|MarkdownElement)[]): ParagraphElement
}

export const element: ElementGenerator = function (type, data) {
    return {
        type,
        ...data
    }
} as ElementGenerator

element.text = (content, emoji = true) => ({
    type: 'plain-text',
    content,
    emoji
})

element.markdown = (content) => ({
    type: 'kmarkdown',
    content
})

element.image = (src, alt, size, circle, fallbackUrl) => ({
    type: 'image',
    src,
    ...(alt && { alt }),
    ...(size && { size }),
    ...(circle && { circle }),
    ...(fallbackUrl && { fallbackUrl })
})

element.button = (text, value, theme = 'primary', click) => ({
    type: 'button',
    text,
    value,
    theme,
    ...(click && { click })
})

element.paragraph = (cols, fields) => ({
    type: 'paragraph',
    cols,
    fields
})

// 模块生成器
export type ModuleGenerator = {
    <T extends ModuleType = ModuleType>(type: T, data: ModuleMap[T]): Module<T>
    header(text: TextElement): HeaderModule
    section(text?: TextElement|MarkdownElement|ParagraphElement, mode?: 'left'|'right', accessory?: ImageElement|ButtonElement): SectionModule
    image(elements: ImageElement[]): ImageModule
    container(elements: ImageElement[]): ContainerModule
    action(elements: ButtonElement[]): ActionModule
    context(elements: (TextElement|MarkdownElement|ImageElement)[]): ContextModule
    divider(): DividerModule
    file(src: string, title: string): FileModule
    audio(src: string, title: string, cover?: string): FileModule
    video(src: string, title: string): FileModule
    countdown(endTime: number, mode?: 'day'|'hour'|'second', startTime?: number): CountdownModule
    invite(code: string): InviteModule
}

export const msgMod: ModuleGenerator = function (type, data) {
    return {
        type,
        ...data
    }
} as ModuleGenerator

msgMod.header = (text) => ({
    type: 'header',
    text
})

msgMod.section = (text, mode = 'left', accessory) => ({
    type: 'section',
    ...(text && { text }),
    mode,
    ...(accessory && { accessory })
})

msgMod.image = (elements) => ({
    type: 'image-group',
    elements
})

msgMod.container = (elements) => ({
    type: 'container',
    elements
})

msgMod.action = (elements) => ({
    type: 'action-group',
    elements
})

msgMod.context = (elements) => ({
    type: 'context',
    elements
})

msgMod.divider = () => ({
    type: 'divider'
})

msgMod.file = (src, title) => ({
    type: 'file',
    src,
    title
})

msgMod.audio = (src, title, cover) => ({
    type: 'audio',
    src,
    title,
    ...(cover && { cover })
})

msgMod.video = (src, title) => ({
    type: 'video',
    src,
    title
})

msgMod.countdown = (endTime, mode = 'hour', startTime) => ({
    type: 'countdown',
    endTime,
    mode,
    ...(startTime && { startTime })
})

msgMod.invite = (code) => ({
    type: 'invite',
    code
})

// 消息段类型定义
type SegmentMap = {
    'text': {
        text: string
    }
    'at': {
        user_id: string
    }
    'card': {
        theme?: 'primary'|'warning'|'danger'|'info'|'success'|'secondary'|'none'|'invisible'
        color?: string
        size?: 'sm'|'lg'
        modules: Module[]
    }
    'image': {
        url: string
        title?: string
    }
    'video': {
        url: string
        title?: string
    }
    'audio': {
        url: string
        title?: string
    }
    'markdown': {
        text: string
    }
    'reply': {
        id: string
    }
    'file': {
        url: string
        name?: string
        file_type?: string
        size?: number
    }
}

export type SegmentType = keyof SegmentMap
export type Segment<T extends SegmentType = SegmentType> = {
    type: T
} & SegmentMap[T]

export type TextSegment = Segment<'text'>
export type AtSegment = Segment<'at'>
export type CardSegment = Segment<'card'>
export type ImageSegment = Segment<'image'>
export type AudioSegment = Segment<'audio'>
export type VideoSegment = Segment<'video'>
export type MarkdownSegment = Segment<'markdown'>
export type ReplySegment = Segment<'reply'>
export type FileSegment = Segment<'file'>

export type Quotable = {
    message_id: string
}

export type MessageSegment = AtSegment|TextSegment|ImageSegment|MarkdownSegment|ReplySegment|FileSegment|CardSegment|VideoSegment|AudioSegment
export type Sendable = string|MessageSegment|Array<string|MessageSegment>

// 消息段生成器
export type SegmentGenerator = {
    <T extends SegmentType>(type: T, attrs: SegmentMap[T]): Segment<T>
    text(text: string): TextSegment
    at(user_id: string): AtSegment
    card(modules: Module[], options?: { theme?: CardMap['card']['theme'], color?: string, size?: 'sm'|'lg' }): CardSegment
    image(url: string, title?: string): ImageSegment
    video(url: string, title?: string): VideoSegment
    audio(url: string, title?: string): AudioSegment
    markdown(text: string): MarkdownSegment
    reply(message_id: string): ReplySegment
    file(url: string, name?: string, file_type?: string, size?: number): FileSegment
}

export const segment: SegmentGenerator = function <T extends SegmentType>(type: T, attrs: SegmentMap[T]) {
    return {
        type,
        ...attrs
    }
} as SegmentGenerator

segment.text = (text) => segment('text', { text })
segment.at = (user_id) => segment('at', { user_id })
// 修改后的卡片消息段生成器
segment.card = (modules, options) => {
    // 创建卡片对象
    const cardObj = {
        type: 'card',
        modules,
        ...(options || {})
    };

    // 返回一个特殊对象，标记为卡片类型
    return {
        __isCard: true,
        ...cardObj
    } as unknown as Segment<'card'>;
}
segment.image = (url, title) => segment('image', { url, ...(title && { title }) })
segment.video = (url, title) => segment('video', { url, ...(title && { title }) })
segment.audio = (url, title) => segment('audio', { url, ...(title && { title }) })
segment.markdown = (text) => segment('markdown', { text })
segment.reply = (message_id) => segment('reply', { id: message_id })
segment.file = (url, name, file_type, size) => segment('file', { 
    url, 
    ...(name && { name }),
    ...(file_type && { file_type }),
    ...(size && { size })
})
// 导出验证
export { validateCard };