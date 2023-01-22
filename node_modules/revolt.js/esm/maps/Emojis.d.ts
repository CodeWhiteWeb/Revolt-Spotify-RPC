import type { Emoji as EmojiI, EmojiParent } from "revolt-api";
import Collection from "./Collection";
import { Client } from "..";
export declare class Emoji {
    client: Client;
    _id: string;
    name: string;
    creator_id: string;
    parent: EmojiParent;
    animated: boolean;
    nsfw: boolean;
    /**
     * Get timestamp when this message was created.
     */
    get createdAt(): number;
    /**
     * Get creator of this emoji.
     */
    get creator(): import("./Users").User | undefined;
    constructor(client: Client, data: EmojiI);
    /**
     * Delete a message
     */
    delete(): Promise<undefined>;
    /**
     * Generate emoji URL
     */
    get imageURL(): string;
}
export default class Emojis extends Collection<string, Emoji> {
    constructor(client: Client);
    /**
     * Create an emoji object.
     * This is meant for internal use only.
     * @param data Emoji Data
     * @param emit Whether to emit creation event
     * @returns Emoji
     */
    createObj(data: EmojiI, emit?: boolean | number): Emoji;
}
