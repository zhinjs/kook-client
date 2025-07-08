import axios, {AxiosInstance} from "axios";
import FormData from 'form-data';
import * as log4js from 'log4js'
import {EventEmitter} from "events";
import {Dict, LogLevel} from "@/types";
import {EventMap,ChannelMessageEvent, PrivateMessageEvent} from "@/event";
import {getFile} from "@/utils";
import {Receiver} from "@/core/receiver";

export class BaseClient extends EventEmitter {
    request: AxiosInstance
    self_id: string
    nickname: string
    status: number
    config:BaseClient.Config
    logger: log4js.Logger
    receiver:Receiver
    private processedEvents = new Set<string>();

    constructor(config:BaseClient.Config ) {
        super()
        this.config=Object.assign({},BaseClient.defaultConfig,config)
        this.request = axios.create({
            baseURL:'https://www.kookapp.cn/api',
            timeout: config.timeout || 5000,
            headers: {
                'User-Agent': `NodeJSSDK/0.0.1`
            }
        })
        this.request.interceptors.request.use((config) => {
            config.headers['Authorization'] = `Bot ${this.config.token}`
            config.headers['Accept-Language'] = this.config.language
            if (config['rest']) {
                const restObj = config['rest']
                delete config['rest']
                for (const key in restObj) {
                    config.url = config.url.replace(':' + key, restObj[key])
                }
            }
            if (config.headers['Content-Type'] === 'multipart/form-data') {
                delete config.data.message_reference;
                const formData = new FormData(); // 使用 form-data
                for (const key in config.data) {
                    if (config.data[key] !== undefined) {
                        formData.append(key, config.data[key]); // 使用 append 而不是 set
                    }
                }
                config.data = formData;
            }
            return config
        })
        this.request.interceptors.response.use((res) => res.data,(res)=>{
            if(!res || !res.response || !res.response.data)  return Promise.reject(res)
            const {code=res?.response.status,message=res?.response.statusText}=res?.response?.data||{}
            const err=new Error(`request "${res.config.url}" error with code(${code}): ${message}`)
            return Promise.reject(err)
        })
        this.logger = log4js.getLogger(`[KOOK]`)
        this.logger.level = this.config.logLevel ||= 'info'
        this.receiver=Receiver.create(config.mode,this,config)
        this.logger.info(`using ${config.mode} mode`)
    }


    /**
 * 上传多媒体文件
 * @param data 文件数据：可以是本地文件(file://)或网络地址(http://)或base64或Buffer
 * @returns 返回可直接访问的文件URL
 */
    async uploadMedia(data: string | Buffer): Promise<string> {
        const formData = new FormData();
        const fileData = await getFile(data);
        // console.error(await getFile(data));
        formData.append('file', fileData, 'awa.png'); // 显式指定文件名

        try {
            const response = await this.request.post(`/v3/asset/create`, formData, {
                headers: {
                    ...formData.getHeaders(), // 自动设置 Content-Type
                    'Accept': 'application/json',
                },
            });

            // console.log("fileData结果:", fileData); // 调试日志
            // console.log("Data结果:", data); // 调试日志

            const url = response.data?.url;
            if (!url) {
                throw new Error(`Invalid response: ${JSON.stringify(response.data)}`);
            }
            return url;
        } catch (error) {
            // console.error("Upload failed:", error.response?.data || error.message);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
    em(event: string, payload: Dict) {
        // 添加消息去重逻辑 - 放在方法最前面
        const eventId = payload.msg_id || payload.event_id;
        if (eventId && this.processedEvents.has(eventId)) {
            this.logger.debug(`Ignoring duplicate event: ${eventId}`);
            return;
        }
        
        // 记录已处理事件
        if (eventId) this.processedEvents.add(eventId);
        
        // 原始事件处理逻辑
        const eventNames = event.split('.')
        const [post_type, detail_type, ...sub_type] = eventNames
        Object.assign(payload, {
            post_type,
            [`${post_type}_type`]: detail_type,
            sub_type: sub_type.join('.'),
            ...payload
        })
        let prefix = ''
        while (eventNames.length) {
            let fullEventName = `${prefix}.${eventNames.shift()}`
            if (fullEventName.startsWith('.')) fullEventName = fullEventName.slice(1)
            this.emit(fullEventName, payload)
            prefix = fullEventName
        }
    }

}

export interface KookClient {
    on<T extends keyof EventMap>(event: T, callback: EventMap[T]): this

    on<S extends string | symbol>(event: S & Exclude<string | symbol, keyof EventMap>, callback: (...args: any[]) => void): this

    once<T extends keyof EventMap>(event: T, callback: EventMap[T]): this

    once<S extends string | symbol>(event: S & Exclude<string | symbol, keyof EventMap>, callback: (...args: any[]) => void): this

    off<T extends keyof EventMap>(event: T, callback?: EventMap[T]): this

    off<S extends string | symbol>(event: S & Exclude<string | symbol, keyof EventMap>, callback?: (...args: any[]) => void): this

    emit<T extends keyof EventMap>(event: T, ...args: Parameters<EventMap[T]>): boolean

    emit<S extends string | symbol>(event: S & Exclude<string | symbol, keyof EventMap>, ...args: any[]): boolean

    addListener<T extends keyof EventMap>(event: T, callback: EventMap[T]): this

    addListener<S extends string | symbol>(event: S & Exclude<string | symbol, keyof EventMap>, callback: (...args: any[]) => void): this

    addListenerOnce<T extends keyof EventMap>(event: T, callback: EventMap[T]): this

    addListenerOnce<S extends string | symbol>(event: S & Exclude<string | symbol, keyof EventMap>, callback: (...args: any[]) => void): this

    removeListener<T extends keyof EventMap>(event: T, callback?: EventMap[T]): this

    removeListener<S extends string | symbol>(event: S & Exclude<string | symbol, keyof EventMap>, callback?: (...args: any[]) => void): this

    removeAllListeners<T extends keyof EventMap>(event: T): this

    removeAllListeners<S extends string | symbol>(event: S & Exclude<string | symbol, keyof EventMap>): this

}

export namespace BaseClient {
    export const defaultConfig:Partial<Config>={
        ignore:'bot'
    }
    export interface Config {
        token:string
        mode:Receiver.Mode
        /**
         * 验证 token，mode 为 webhook 时必填
         * */
        verify_token?:string
        /**
         * 消息加密秘钥，mode 为 webhook 时必填
         */
        encrypt_key?:string
        /**
         * 下发数据是否压缩
         */
        compress?:boolean
        language?: string
        timeout?: number
        max_retry?: number
        data_dir?:string
        ignore: 'bot'|'self'
        logLevel?: LogLevel
    }

    export function getFullTargetId(message: ChannelMessageEvent | PrivateMessageEvent) {
        switch (message.message_type) {
            case "private":
                return `private-${message.author_id}`
            case "channel":
                return `channel-${(message as ChannelMessageEvent).channel_id}:${message.author_id}`
        }
    }
}
