import { Client } from "../Client";
import { Channel } from "../maps/Channels";
import { Server } from "../maps/Servers";
export interface INotificationChecker {
    isMuted(target?: Channel | Server): boolean;
}
/**
 * Handles channel unreads.
 */
export default class Unreads {
    private client;
    private loaded;
    private channels;
    /**
     * Construct new Unreads store.
     */
    constructor(client: Client);
    /**
     * Sync unread data from the server.
     */
    sync(): Promise<void>;
    /**
     * Get channel unread object for a given channel.
     * @param channel_id Target channel ID
     * @returns Partial channel unread object
     */
    getUnread(channel_id: string): Omit<{
        _id: {
            channel: string;
            user: string;
        };
        last_id?: string | null | undefined;
        mentions?: string[] | null | undefined;
    }, "_id"> | undefined;
    /**
     * Mark a channel as unread by setting a custom last_id.
     * @param channel_id Target channel ID
     * @param last_id New last ID
     */
    markUnread(channel_id: string, last_id: string): void;
    /**
     * Add a mention to a channel unread.
     * @param channel_id Target channel ID
     * @param message_id Target message ID
     */
    markMention(channel_id: string, message_id: string): void;
    /**
     * Mark a channel as read.
     * @param channel_id Target channel ID
     * @param message_id Target message ID (last sent in channel)
     * @param emit Whether to emit to server
     * @param skipRateLimiter Whether to skip the rate limiter
     */
    markRead(channel_id: string, message_id?: string, emit?: boolean, skipRateLimiter?: boolean): void;
    /**
     * Mark multiple channels as read.
     * @param channel_ids Target channel IDs
     */
    markMultipleRead(channel_ids: string[]): void;
}
