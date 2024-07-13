import {defineConfig} from 'vitepress'

export default defineConfig({
    base:"/kook-client/",
    themeConfig: {
        returnToTopLabel:'返回顶部',
        lastUpdated:{
          text:'最近更新'
        },
        search:{
            provider:'local',
            options:{
                detailedView:'auto'
            }
        },
        editLink: {
          pattern: 'https://github.com/lc-cn/kook-client/edit/main/docs/src/:path',
          text: '修改'
        },
        nav: [
            { text: '开始', link: '/guide/start', activeMatch: '/guide/' },
            { text: '配置', link: '/config', activeMatch: '/config' },
            {
                text: 'API',
                activeMatch: '/api/',
                items: [
                    { text: '服务器', link: '/api/guild' },
                    { text: '频道', link: '/api/channel' },
                    { text: '私聊', link: '/api/private' },
                ]
            },
            {
                text: '事件',
                activeMatch: '/event/',
                items: [
                    { text: '私聊事件', link: '/event/private' },
                    { text: '频道消息事件', link: '/event/channel' },
                ]
            },
            { text: '更新日志', link: 'https://github.com/lc-cn/kook-client/blob/master/CHANGELOG.md', target: '_blank', }
        ],
        sidebar: [
            {
                text: '开始',
                items: [
                    { text: '简介', link: '/guide/instruction' },
                    { text: '快速开始', link: '/guide/start' },
                    { text: '配置项', link: '/config' },
                ]
            },
            {
                text: '消息段',
                items: [
                    { text: '文本', link: '/segment/text' },
                    { text: '表情', link: '/segment/face' },
                    { text: '图片', link: '/segment/image' },
                    { text: '音频', link: '/segment/audio' },
                    { text: '视频', link: '/segment/video' },
                    { text: '回复', link: '/segment/reply' },
                    { text: 'At', link: '/segment/at' },
                    { text: 'Markdown', link: '/segment/markdown' },
                    { text: '卡片消息', link: '/segment/card' },
                ]
            },
            {
                text: '接口分组',
                items: [
                    { text: '服务器', link: '/api/guild' },
                    { text: '频道', link: '/api/channel' },
                    { text: '私聊', link: '/api/private' },
                ]
            }
        ],
        footer: {
            message: 'Released under the <a href="https://github.com/lc-cn/kook-client/blob/master/LICENSE">MIT License</a>.',
            copyright: 'Copyright © 2023-present <a href="https://github.com/lc-cn">lc-cn</a>'
        }
    },
    title: 'kook-client',
    srcDir: './src',
    outDir: "./dist",
    lastUpdated: true,
    ignoreDeadLinks: true,
    description: '基于NodeJS的kook官方机器人SDK'
})
