import type { DataMemberEdit, FieldsMember, Member as MemberI, MemberCompositeKey } from "revolt-api";
import type { File } from "revolt-api";
import { Nullable } from "../util/null";
import Collection from "./Collection";
import { Channel, Client, FileArgs, Server } from "..";
import { Permission } from "../permissions/definitions";
export declare class Member {
    client: Client;
    _id: MemberCompositeKey;
    joined_at: Date;
    nickname: Nullable<string>;
    avatar: Nullable<File>;
    roles: Nullable<string[]>;
    timeout: Nullable<Date>;
    private _timeout;
    /**
     * Associated user.
     */
    get user(): import("./Users").User | undefined;
    /**
     * Associated server.
     */
    get server(): Server | undefined;
    /**
     * Whether the client has a higher rank than this member.
     */
    get inferior(): boolean;
    /**
     * Whether the client can kick this user.
     */
    get kickable(): boolean | undefined;
    /**
     * Whether the client can ban this user.
     */
    get bannable(): boolean | undefined;
    constructor(client: Client, data: MemberI);
    update(data: Partial<MemberI>, clear?: FieldsMember[]): void;
    /**
     * Schedule timeout revocation
     */
    private scheduleTimeout;
    /**
     * Edit a server member
     * @param data Member editing route data
     * @returns Server member object
     */
    edit(data: DataMemberEdit): Promise<{
        _id: {
            server: string;
            user: string;
        };
        joined_at: string;
        nickname?: string | null | undefined;
        avatar?: {
            _id: string;
            tag: string;
            filename: string;
            metadata: {
                type: "File";
            } | {
                type: "Text";
            } | {
                type: "Image";
                width: number;
                height: number;
            } | {
                type: "Video";
                width: number;
                height: number;
            } | {
                type: "Audio";
            };
            content_type: string;
            size: number;
            deleted?: boolean | null | undefined;
            reported?: boolean | null | undefined;
            message_id?: string | null | undefined;
            user_id?: string | null | undefined;
            server_id?: string | null | undefined;
            object_id?: string | null | undefined;
        } | null | undefined;
        roles?: string[] | undefined;
        timeout?: string | null | undefined;
    }>;
    /**
     * Kick server member
     * @param user_id User ID
     */
    kick(): Promise<undefined>;
    /**
     * Get an ordered list of roles for this member, from lowest to highest priority.
     */
    get orderedRoles(): [string, {
        name: string;
        permissions: {
            a: number;
            d: number;
        };
        colour?: string | null | undefined;
        hoist?: boolean | undefined;
        rank?: number | undefined;
    }][];
    /**
     * Get this member's currently hoisted role.
     */
    get hoistedRole(): {
        name: string;
        permissions: {
            a: number;
            d: number;
        };
        colour?: string | null | undefined;
        hoist?: boolean | undefined;
        rank?: number | undefined;
        id: string;
    } | null;
    /**
     * Get this member's current role colour.
     */
    get roleColour(): string | null | undefined;
    /**
     * Get this member's ranking.
     * Smaller values are ranked as higher priotity.
     */
    get ranking(): number;
    /**
     * Get a pre-configured avatar URL of a member
     */
    get avatarURL(): string | undefined;
    /**
     * Get a pre-configured animated avatar URL of a member
     */
    get animatedAvatarURL(): string | undefined;
    /**
     * Generate URL to this member's avatar
     * @param args File parameters
     * @returns File URL
     */
    generateAvatarURL(...args: FileArgs): string | undefined;
    /**
     * Get the permissions that this member has against a certain object
     * @param target Target object to check permissions against
     * @returns Permissions that this member has
     */
    getPermissions(target: Server | Channel): number;
    /**
     * Check whether a member has a certain permission against a certain object
     * @param target Target object to check permissions against
     * @param permission Permission names to check for
     * @returns Whether the member has this permission
     */
    hasPermission(target: Server | Channel, ...permission: (keyof typeof Permission)[]): boolean;
    /**
     * Checks whether the target member has a higher rank than this member.
     * @param target The member to compare against
     * @returns Whether this member is inferior to the target
     */
    inferiorTo(target: Member): boolean;
}
export default class Members extends Collection<string, Member> {
    constructor(client: Client);
    static toKey(id: MemberCompositeKey): string;
    hasKey(id: MemberCompositeKey): boolean;
    getKey(id: MemberCompositeKey): Member | undefined;
    setKey(id: MemberCompositeKey, member: Member): this;
    deleteKey(id: MemberCompositeKey): boolean;
    $get(id: MemberCompositeKey, data?: MemberI): Member;
    /**
     * Create a member object.
     * This is meant for internal use only.
     * @param data: Member Data
     * @param emit Whether to emit creation event
     * @returns Member
     */
    createObj(data: MemberI, emit?: boolean | number): Member;
}
