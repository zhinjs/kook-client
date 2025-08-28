import {BinaryLike, createHash} from "crypto";
import * as fs from 'fs'
import axios from 'axios'
import {Stream} from "node:stream";

export const toObject = <T = any>(data: any) => {
    if (Buffer.isBuffer(data)) return JSON.parse(data.toString()) as T;
    if (typeof data === 'object') return data as T;
    if (typeof data === 'string') return JSON.parse(data) as T;
    // return String(data);
};
/** md5 hash */
export const md5 = (data: BinaryLike) => createHash("md5").update(data).digest().toString('hex');
export function isEmpty<T>(data: T) {
    if (!data) return true;
    if (typeof data !== "object") return false
    return Reflect.ownKeys(data).length === 0;
}
export function genGroupId(guild_id:string,channel_id:string):string{
    return Buffer.from(`${guild_id}${channel_id}`,'utf8')
        .toString('base64')
        .slice(0,-1)
}
export function parseGroupId(group_id:string):{guild_id:string,channel_id:string}{
    const decoded=Buffer.from(group_id+'=','base64').toString('utf8')
    return {
        guild_id:decoded.slice(0,16),
        channel_id:decoded.slice(16)
    }
}
export function remove<T>(list: T[], item: T) {
    const index = list.indexOf(item);
    if (index !== -1) list.splice(index, 1);
}

/**
 * create stream from local file
 * @param filepath {string} filepath
 */
export async function createLocalFileStream(filepath:string):Promise<Stream>{
    return fs.createReadStream(filepath.replace('^file://',''))
}

/**
 * create stream from remote url
 * @param url {string} remote url
 */
export async function createRemoteFileStream(url:string):Promise<Stream>{
    return (await axios.get(url, { responseType: 'stream' })).data;
}
export async function getFile(file:string|Buffer):Promise<Buffer|Stream>{
    if (Buffer.isBuffer(file)) return file
    if(file.match(/^https?:\/\//)) return createRemoteFileStream(file)
    if(file.match(/^base64:\/\//)) return Buffer.from(file.replace('^base64://',''),'base64')
    if (typeof file === 'string') {
        const isLocalFile = (
            file.startsWith('file://') ||
            (!file.includes('://') && fs.existsSync(file))
        );

        if (isLocalFile) {
            const cleanPath = file.replace(/^file:\/\//, '');
            return createLocalFileStream(cleanPath);
        }
    }
    if(file.match(/^data:.*;base64,.*$/)) return Buffer.from(file.replace(/^data:.*;base64,/,''),'base64')
    try{
        return Buffer.from(file)
    }catch {
        throw new Error("bad file param: " + file)
    }
}