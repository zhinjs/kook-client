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

    constructor(client: BaseClient, public config: WebsocketReceiver.Config) {
        super(client);
        this._state = WebsocketReceiver.State.Initial;
        this.compress = config.compress ?? false;
    }

    get state(): WebsocketReceiver.State {
        return this._state;
    }

    private set state(value: WebsocketReceiver.State) {
        this._state = value;
        this.logger.debug(`WebSocket state changed to: ${WebsocketReceiver.State[value]}`);
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
                sn: Number(this.sn) || 0  // 确保转换为数字
            }));
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

                if (data.sn) this.sn = data.sn.toString(); // Ensure sn is string

                switch (data.s) {
                    case OpCode.Hello:
                        this.emit('hello', data.d);
                        break;
                    case OpCode.Event:
                        this.emit('event', data.d);
                        break;
                    case OpCode.Reconnect:
                        this.reconnect();
                        break;
                    case OpCode.ResumeAck:
                        this.emit('resume', data.d);
                        break;
                    case OpCode.Pong:
                        this.logger.debug('Received pong from server');
                        break;
                    default:
                        this.logger.warn('Received unknown opcode', data.s);
                }
            } catch (error) {
                this.logger.error('Error processing WebSocket message', error);
            }
        });

        this.ws.on('close', () => {
            this.logger.info('WebSocket connection closed');
            this.cleanup();
            this.state = WebsocketReceiver.State.Closed;
        });

        this.ws.on('error', (error) => {
            this.logger.error('WebSocket error', error);
            this.cleanup();
            this.state = WebsocketReceiver.State.Closed;
        });
    }

    private cleanup() {
        // Clear all timers
        this.timers.forEach((timer, key) => {
            clearInterval(timer);
            this.timers.delete(key);
        });

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

    async reconnect(): Promise<void> {
        this.logger.info('Attempting to reconnect...');
        this.buffer = [];
        this.state = WebsocketReceiver.State.Reconnection;
        await this.connect(true);
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
            this.sendPing();

            // Schedule periodic pings with jitter
            const pingInterval = this.pingBaseInterval + Math.random() * this.pingJitterRange;
            this.timers.set('ping', setInterval(() => this.sendPing(), pingInterval));

            this.logger.info(`WebSocket connected successfully to ${this.url.host}`);
        } catch (error) {
            this.logger.error('WebSocket connection error', error);
            this.cleanup();
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