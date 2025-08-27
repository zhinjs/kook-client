import { Receiver } from "@/core/receiver";
import { BaseClient } from "@";
import { WebSocket } from "ws";
import { OpCode } from "@/constans";

export class WebsocketReceiver extends Receiver {
    private _state: WebsocketReceiver.State;
    private ws: WebSocket | null = null;
    private url: URL | null = null;
    private session_id: string | null = null;
    private readonly timers: Map<string, NodeJS.Timeout> = new Map();
    private readonly pingJitterRange = 10000;
    private readonly pingBaseInterval = 25000;
    private readonly helloTimeout = 5000;

    // 重连相关属性
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private reconnectBaseDelay = 1000;
    private reconnectTimer: NodeJS.Timeout | null = null;

    // 心跳检测相关属性
    private lastPongTime = 0;
    private heartbeatTimeout: NodeJS.Timeout | null = null;

    constructor(client: BaseClient, public config: WebsocketReceiver.Config) {
        super(client);
        this._state = WebsocketReceiver.State.Initial;
        this.compress = config.compress ?? false;
        this.setupNetworkMonitoring();
    }

    get state(): WebsocketReceiver.State {
        return this._state;
    }

    private set state(value: WebsocketReceiver.State) {
        this._state = value;
        this.logger.info(`WebSocket state changed to: ${WebsocketReceiver.State[value]}`);
    }

    get logger() {
        return this.c.logger;
    }

    private async getGatewayUrl(compress: 0 | 1): Promise<string> {
        try {
            const res = await this.c.request.get('/v3/gateway/index', { params: { compress } });
            return res.data.url;
        } catch (error) {
            this.logger.error('Failed to get gateway URL', error);
            throw error;
        }
    }

    private async waitForHello(): Promise<number> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.off('hello', helloHandler);
                reject(new Error('WebSocket receive hello code timeout'));
            }, this.helloTimeout);

            const helloHandler = (data: Receiver.HelloPacket['d']) => {
                clearTimeout(timer);
                this.session_id = data.session_id;
                resolve(data.code);
            };

            this.once('hello', helloHandler);
        });
    }

    private sendPing() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            // 发送包含当前 sn 的 Ping（必须为数字）
            this.ws.send(JSON.stringify({
                s: OpCode.Ping,
                sn: this.sn || 0
            }));
            this.lastPongTime = Date.now();

            // 设置心跳超时检测
            if (this.heartbeatTimeout) {
                clearTimeout(this.heartbeatTimeout);
            }

            this.heartbeatTimeout = setTimeout(() => {
                if (Date.now() - this.lastPongTime > 10000) { // 10秒超时
                    this.logger.debug('Heartbeat timeout, reconnecting...');
                    this.scheduleReconnect();
                }
            }, 10000);

            this.logger.debug(`Sent ping to server with sn: ${this.sn}`);
        }
    }

    private setupEventListeners() {
        if (!this.ws) return;

        this.ws.on('message', (event) => {
            try {
                const data = JSON.parse(
                    this.decryptData(event.toString(), this.config.encrypt_key ?? '')
                );

                if (data.sn) this.sn = Number(data.sn); // 确保为数字

                switch (data.s) {
                    case OpCode.Hello:
                        this.emit('hello', data.d);
                        break;
                    case OpCode.Event:
                        this.emit('event', data.d);
                        break;
                    case OpCode.Reconnect:
                        this.logger.debug('Received reconnect command from server', data.d);
                        this.scheduleReconnect();
                        break;
                    case OpCode.ResumeAck:
                        this.emit('resume', data.d);
                        break;
                    case OpCode.Pong:
                        this.lastPongTime = Date.now();
                        this.logger.debug('Received pong from server');
                        break;
                    default:
                        this.logger.debug('Received unknown opcode', data.s);
                }
            } catch (error) {
                this.logger.error('Error processing WebSocket message', error);
            }
        });

        this.ws.on('close', (code, reason) => {
            this.logger.info(`WebSocket connection closed, code: ${code}, reason: ${reason.toString()}`);
            this.cleanup();
            this.state = WebsocketReceiver.State.Closed;

            // 自动重连（非正常关闭时）
            if (code !== 1000) { // 1000是正常关闭
                this.scheduleReconnect();
            }
        });

        this.ws.on('error', (error) => {
            this.logger.error('WebSocket error', error);
            this.cleanup();
            this.state = WebsocketReceiver.State.Closed;
            this.scheduleReconnect();
        });

        this.ws.on('open', () => {
            this.logger.debug('WebSocket connection opened');
        });
    }

    private cleanup() {
        // Clear all timers
        this.timers.forEach((timer, key) => {
            clearInterval(timer);
            this.timers.delete(key);
        });

        // 清理重连定时器
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // 清理心跳超时检测
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }

        // Clean up WebSocket
        if (this.ws) {
            this.ws.removeAllListeners();
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close();
            }
            this.ws = null;
        }
    }

    private getResumeQueryParams(): URLSearchParams {
        const params = new URLSearchParams();

        if (this.sn) params.append('sn', this.sn.toString());
        if (this.session_id) params.append('session_id', this.session_id);
        params.append('resume', '1');

        return params;
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts - 1);

        this.logger.info(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        this.reconnectTimer = setTimeout(() => {
            this.reconnect().catch(error => {
                this.logger.error('Reconnect failed', error);
                this.scheduleReconnect();
            });
        }, delay);
    }

    async reconnect(): Promise<void> {
        this.logger.info('Attempting to reconnect...');
        this.cleanup();
        this.state = WebsocketReceiver.State.Reconnection;
        await this.connect(true);
    }

    private setupNetworkMonitoring() {
        // 在Node.js环境中监听网络状态变化
        if (typeof process !== 'undefined') {
            // 可以添加定期的网络连通性检查
            const networkCheckInterval = setInterval(() => {
                // 简单的网络连通性检查
                require('dns').resolve('www.kookapp.cn', (err: any) => {
                    if (err) {
                        this.logger.debug('Network connectivity issue detected');
                        if (this.state === WebsocketReceiver.State.Closed) {
                            this.scheduleReconnect();
                        }
                    }
                });
            }, 30000); // 每30秒检查一次

            // 在清理时移除监听
            this.timers.set('networkCheck', networkCheckInterval);
        }
    }

    async connect(isReconnect = false): Promise<void> {
        try {
            this.state = WebsocketReceiver.State.PullingGateway;

            const gatewayUrl = await this.getGatewayUrl(this.config.compress ? 1 : 0);
            const url = new URL(gatewayUrl);

            if (isReconnect) {
                this.getResumeQueryParams().forEach((value, key) => {
                    url.searchParams.append(key, value);
                });
            }

            this.url = url;
            this.state = WebsocketReceiver.State.Connecting;

            this.ws = new WebSocket(this.url);
            this.setupEventListeners();

            const receiveCode = await this.waitForHello();
            if (receiveCode !== 0) {
                this.logger.error(`WebSocket connect failed, receive code: ${receiveCode}`);
                return this.connect(isReconnect);
            }

            this.state = WebsocketReceiver.State.Open;
            this.reconnectAttempts = 0; // 重置重连计数器
            this.sendPing();

            // Schedule periodic pings with jitter
            const pingInterval = this.pingBaseInterval + Math.random() * this.pingJitterRange;
            this.timers.set('ping', setInterval(() => this.sendPing(), pingInterval));

            this.logger.info(`WebSocket connected successfully to ${this.url.host}`);
        } catch (error) {
            this.logger.error('WebSocket connection error', error);
            this.cleanup();

            // 连接失败时也触发重连
            if (!isReconnect) {
                this.scheduleReconnect();
            }
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        this.logger.info('Disconnecting WebSocket...');
        this.cleanup();
        this.state = WebsocketReceiver.State.Closed;
    }
}

export namespace WebsocketReceiver {
    export interface Config {
        token: string;
        compress?: boolean;
        encrypt_key?: string;
    }

    export enum State {
        Initial,
        PullingGateway,
        Connecting,
        Open,
        Closed,
        Reconnection
    }
}

Receiver.register('websocket', WebsocketReceiver);