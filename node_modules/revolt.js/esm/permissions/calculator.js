import Long from "long";
import { Server } from "..";
import { ALLOW_IN_TIMEOUT, DEFAULT_PERMISSION_DIRECT_MESSAGE, DEFAULT_PERMISSION_VIEW_ONLY, Permission, UserPermission, } from "./definitions";
/**
 * Check whether `b` is present in `a`
 * @param a Input A
 * @param b Inputs (OR'd together)
 */
export function bitwiseAndEq(a, ...b) {
    const value = b.reduce((prev, cur) => prev.or(cur), Long.fromNumber(0));
    return value.and(a).eq(value);
}
/**
 * Calculate permissions against a given object
 * @param target Target object to check permissions against
 * @param options Additional options to use when calculating
 */
export function calculatePermission(target, options) {
    var _a, _b, _c, _d, _e, _f;
    const user = (options === null || options === void 0 ? void 0 : options.member) ? options === null || options === void 0 ? void 0 : options.member.user : target.client.user;
    if (user === null || user === void 0 ? void 0 : user.privileged) {
        return Permission.GrantAllSafe;
    }
    if (target instanceof Server) {
        // 1. Check if owner.
        if (target.owner === (user === null || user === void 0 ? void 0 : user._id)) {
            return Permission.GrantAllSafe;
        }
        else {
            // 2. Get member.
            const member = (_b = (_a = options === null || options === void 0 ? void 0 : options.member) !== null && _a !== void 0 ? _a : target.client.members.getKey({
                user: user._id,
                server: target._id,
            })) !== null && _b !== void 0 ? _b : { roles: null, timeout: null };
            if (!member)
                return 0;
            // 3. Apply allows from default_permissions.
            let perm = Long.fromNumber(target.default_permissions);
            // 4. If user has roles, iterate in order.
            if (member.roles && target.roles) {
                // 5. Apply allows and denies from roles.
                const permissions = member.orderedRoles.map(([, role]) => role.permissions);
                for (const permission of permissions) {
                    perm = perm
                        .or(permission.a)
                        .and(Long.fromNumber(permission.d).not());
                }
            }
            // 5. Revoke permissions if member is timed out.
            if (member.timeout && member.timeout > new Date()) {
                perm = perm.and(ALLOW_IN_TIMEOUT);
            }
            return perm.toNumber();
        }
    }
    else {
        // 1. Check channel type.
        switch (target.channel_type) {
            case "SavedMessages":
                return Permission.GrantAllSafe;
            case "DirectMessage": {
                // 2. Determine user permissions.
                const user_permissions = ((_c = target.recipient) === null || _c === void 0 ? void 0 : _c.permission) || 0;
                // 3. Check if the user can send messages.
                if (user_permissions & UserPermission.SendMessage) {
                    return DEFAULT_PERMISSION_DIRECT_MESSAGE;
                }
                else {
                    return DEFAULT_PERMISSION_VIEW_ONLY;
                }
            }
            case "Group": {
                // 2. Check if user is owner.
                if (target.owner_id === user._id) {
                    return DEFAULT_PERMISSION_DIRECT_MESSAGE;
                }
                else {
                    // 3. Pull out group permissions.
                    return ((_d = target.permissions) !== null && _d !== void 0 ? _d : DEFAULT_PERMISSION_DIRECT_MESSAGE);
                }
            }
            case "TextChannel":
            case "VoiceChannel": {
                // 2. Get server.
                const server = target.server;
                if (typeof server === "undefined")
                    return 0;
                // 3. If server owner, just grant all permissions.
                if (server.owner === (user === null || user === void 0 ? void 0 : user._id)) {
                    return Permission.GrantAllSafe;
                }
                else {
                    // 4. Get member.
                    const member = (_f = (_e = options === null || options === void 0 ? void 0 : options.member) !== null && _e !== void 0 ? _e : target.client.members.getKey({
                        user: user._id,
                        server: server._id,
                    })) !== null && _f !== void 0 ? _f : { roles: null, timeout: null };
                    if (!member)
                        return 0;
                    // 5. Calculate server base permissions.
                    let perm = Long.fromNumber(calculatePermission(server, options));
                    // 6. Apply default allows and denies for channel.
                    if (target.default_permissions) {
                        perm = perm
                            .or(target.default_permissions.a)
                            .and(Long.fromNumber(target.default_permissions.d).not());
                    }
                    // 7. If user has roles, iterate in order.
                    if (member.roles &&
                        target.role_permissions &&
                        server.roles) {
                        // 5. Apply allows and denies from roles.
                        const roles = member.orderedRoles.map(([id]) => id);
                        for (const id of roles) {
                            const override = target.role_permissions[id];
                            if (override) {
                                perm = perm
                                    .or(override.a)
                                    .and(Long.fromNumber(override.d).not());
                            }
                        }
                    }
                    // 8. Revoke permissions if member is timed out.
                    if (member.timeout && member.timeout > new Date()) {
                        perm = perm.and(ALLOW_IN_TIMEOUT);
                    }
                    return perm.toNumber();
                }
            }
        }
    }
}
