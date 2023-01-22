/// <reference types="ws" />
import WebSocket from "@insertish/isomorphic-ws";
import { Client } from "..";
import { ServerboundNotification } from "./notifications";
export declare class WebSocketClient {
    client: Client;
    ws?: WebSocket;
    heartbeat?: number;
    connected: boolean;
    ready: boolean;
    ping?: number;
    constructor(client: Client);
    /**
     * Disconnect the WebSocket and disable heartbeats.
     */
    disconnect(): void;
    /**
     * Send a notification
     * @param notification Serverbound notification
     */
    send(notification: ServerboundNotification): void;
    /**
     * Connect the WebSocket
     * @param disallowReconnect Whether to disallow reconnection
     */
    connect(disallowReconnect?: boolean): Promise<void>;
}
