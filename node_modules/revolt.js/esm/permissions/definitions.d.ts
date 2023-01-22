/**
 * Permission against User
 */
export declare const UserPermission: {
    Access: number;
    ViewProfile: number;
    SendMessage: number;
    Invite: number;
};
/**
 * Permission against Server / Channel
 */
export declare const Permission: {
    ManageChannel: number;
    ManageServer: number;
    ManagePermissions: number;
    ManageRole: number;
    ManageCustomisation: number;
    KickMembers: number;
    BanMembers: number;
    TimeoutMembers: number;
    AssignRoles: number;
    ChangeNickname: number;
    ManageNicknames: number;
    ChangeAvatar: number;
    RemoveAvatars: number;
    ViewChannel: number;
    ReadMessageHistory: number;
    SendMessage: number;
    ManageMessages: number;
    ManageWebhooks: number;
    InviteOthers: number;
    SendEmbeds: number;
    UploadFiles: number;
    Masquerade: number;
    React: number;
    Connect: number;
    Speak: number;
    Video: number;
    MuteMembers: number;
    DeafenMembers: number;
    MoveMembers: number;
    GrantAllSafe: number;
};
/**
 * Maximum safe value
 */
export declare const U32_MAX: number;
/**
 * Permissions allowed for a user while in timeout
 */
export declare const ALLOW_IN_TIMEOUT: number;
/**
 * Default permissions if we can only view
 */
export declare const DEFAULT_PERMISSION_VIEW_ONLY: number;
/**
 * Default base permissions for channels
 */
export declare const DEFAULT_PERMISSION: number;
/**
 * Permissions in saved messages channel
 */
export declare const DEFAULT_PERMISSION_SAVED_MESSAGES: number;
/**
 * Permissions in direct message channels / default permissions for group DMs
 */
export declare const DEFAULT_PERMISSION_DIRECT_MESSAGE: number;
/**
 * Permissions in server text / voice channel
 */
export declare const DEFAULT_PERMISSION_SERVER: number;
