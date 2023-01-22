var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { makeAutoObservable, runInAction, action, computed } from "mobx";
import isEqual from "lodash.isequal";
import { toNullable, toNullableDate } from "../util/null";
import Collection from "./Collection";
import { bitwiseAndEq, calculatePermission } from "../permissions/calculator";
import { Permission } from "../permissions/definitions";
export class Member {
    constructor(client, data) {
        this.nickname = null;
        this.avatar = null;
        this.roles = null;
        this.timeout = null;
        this.client = client;
        this._id = data._id;
        this.joined_at = new Date(data.joined_at);
        this.nickname = toNullable(data.nickname);
        this.avatar = toNullable(data.avatar);
        this.roles = toNullable(data.roles);
        this.timeout = toNullableDate(data.timeout);
        this.scheduleTimeout();
        makeAutoObservable(this, {
            _id: false,
            client: false,
        });
    }
    /**
     * Associated user.
     */
    get user() {
        return this.client.users.get(this._id.user);
    }
    /**
     * Associated server.
     */
    get server() {
        return this.client.servers.get(this._id.server);
    }
    /**
     * Whether the client has a higher rank than this member.
     */
    get inferior() {
        var _a, _b, _c;
        return ((_c = (_b = (_a = this.server) === null || _a === void 0 ? void 0 : _a.member) === null || _b === void 0 ? void 0 : _b.ranking) !== null && _c !== void 0 ? _c : Infinity) < this.ranking;
    }
    /**
     * Whether the client can kick this user.
     */
    get kickable() {
        var _a;
        return ((_a = this.server) === null || _a === void 0 ? void 0 : _a.havePermission("KickMembers")) && this.inferior;
    }
    /**
     * Whether the client can ban this user.
     */
    get bannable() {
        var _a;
        return ((_a = this.server) === null || _a === void 0 ? void 0 : _a.havePermission("BanMembers")) && this.inferior;
    }
    update(data, clear = []) {
        const apply = (key) => {
            // This code has been tested.
            if (
            // @ts-expect-error TODO: clean up types here
            typeof data[key] !== "undefined" &&
                // @ts-expect-error TODO: clean up types here
                !isEqual(this[key], data[key])) {
                // @ts-expect-error TODO: clean up types here
                this[key] =
                    // @ts-expect-error TODO: clean up types here
                    key === "timeout" ? toNullableDate(data[key]) : data[key];
            }
        };
        for (const field of clear) {
            switch (field) {
                case "Nickname":
                    this.nickname = null;
                    break;
                case "Avatar":
                    this.avatar = null;
                    break;
                case "Roles":
                    this.roles = [];
                    break;
                case "Timeout":
                    this.timeout = null;
                    break;
            }
        }
        apply("nickname");
        apply("avatar");
        apply("roles");
        apply("timeout");
        this.scheduleTimeout();
    }
    /**
     * Schedule timeout revocation
     */
    scheduleTimeout() {
        delete this._timeout;
        clearTimeout(this._timeout);
        if (this.timeout) {
            const offset = +this.timeout - +new Date();
            if (offset > 0) {
                this._timeout = setTimeout(() => {
                    runInAction(() => {
                        this.timeout = null;
                        delete this._timeout;
                    });
                }, offset);
            }
            else {
                runInAction(() => {
                    this.timeout = null;
                });
            }
        }
    }
    /**
     * Edit a server member
     * @param data Member editing route data
     * @returns Server member object
     */
    edit(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.patch(`/servers/${this._id.server}/members/${this._id.user}`, data);
        });
    }
    /**
     * Kick server member
     * @param user_id User ID
     */
    kick() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.delete(`/servers/${this._id.server}/members/${this._id.user}`);
        });
    }
    /**
     * Get an ordered list of roles for this member, from lowest to highest priority.
     */
    get orderedRoles() {
        var _a;
        const member_roles = new Set(this.roles);
        const server = this.server;
        return Object.keys((_a = server.roles) !== null && _a !== void 0 ? _a : {})
            .filter((x) => member_roles.has(x))
            .map((role_id) => [role_id, server.roles[role_id]])
            .sort(([, a], [, b]) => b.rank - a.rank);
    }
    /**
     * Get this member's currently hoisted role.
     */
    get hoistedRole() {
        const roles = this.orderedRoles.filter((x) => x[1].hoist);
        if (roles.length > 0) {
            const [id, role] = roles[roles.length - 1];
            return Object.assign({ id }, role);
        }
        else {
            return null;
        }
    }
    /**
     * Get this member's current role colour.
     */
    get roleColour() {
        const roles = this.orderedRoles.filter((x) => x[1].colour);
        if (roles.length > 0) {
            return roles[roles.length - 1][1].colour;
        }
        else {
            return null;
        }
    }
    /**
     * Get this member's ranking.
     * Smaller values are ranked as higher priotity.
     */
    get ranking() {
        var _a;
        if (this._id.user === ((_a = this.server) === null || _a === void 0 ? void 0 : _a.owner)) {
            return -Infinity;
        }
        const roles = this.orderedRoles;
        if (roles.length > 0) {
            return roles[roles.length - 1][1].rank;
        }
        else {
            return Infinity;
        }
    }
    /**
     * Get a pre-configured avatar URL of a member
     */
    get avatarURL() {
        var _a, _b;
        return (_a = this.generateAvatarURL({ max_side: 256 })) !== null && _a !== void 0 ? _a : (_b = this.user) === null || _b === void 0 ? void 0 : _b.avatarURL;
    }
    /**
     * Get a pre-configured animated avatar URL of a member
     */
    get animatedAvatarURL() {
        var _a, _b;
        return (_a = this.generateAvatarURL({ max_side: 256 }, true)) !== null && _a !== void 0 ? _a : (_b = this.user) === null || _b === void 0 ? void 0 : _b.animatedAvatarURL;
    }
    /**
     * Generate URL to this member's avatar
     * @param args File parameters
     * @returns File URL
     */
    generateAvatarURL(...args) {
        var _a;
        return this.client.generateFileURL((_a = this.avatar) !== null && _a !== void 0 ? _a : undefined, ...args);
    }
    /**
     * Get the permissions that this member has against a certain object
     * @param target Target object to check permissions against
     * @returns Permissions that this member has
     */
    getPermissions(target) {
        return calculatePermission(target, { member: this });
    }
    /**
     * Check whether a member has a certain permission against a certain object
     * @param target Target object to check permissions against
     * @param permission Permission names to check for
     * @returns Whether the member has this permission
     */
    hasPermission(target, ...permission) {
        return bitwiseAndEq(this.getPermissions(target), ...permission.map((x) => Permission[x]));
    }
    /**
     * Checks whether the target member has a higher rank than this member.
     * @param target The member to compare against
     * @returns Whether this member is inferior to the target
     */
    inferiorTo(target) {
        return target.ranking < this.ranking;
    }
}
__decorate([
    action
], Member.prototype, "update", null);
__decorate([
    computed
], Member.prototype, "orderedRoles", null);
__decorate([
    computed
], Member.prototype, "hoistedRole", null);
__decorate([
    computed
], Member.prototype, "roleColour", null);
__decorate([
    computed
], Member.prototype, "ranking", null);
__decorate([
    computed
], Member.prototype, "generateAvatarURL", null);
__decorate([
    computed
], Member.prototype, "getPermissions", null);
__decorate([
    computed
], Member.prototype, "hasPermission", null);
__decorate([
    computed
], Member.prototype, "inferiorTo", null);
export default class Members extends Collection {
    constructor(client) {
        super(client);
        this.createObj = this.createObj.bind(this);
    }
    static toKey(id) {
        return JSON.stringify(id, Object.keys(id).sort());
    }
    hasKey(id) {
        return super.has(Members.toKey(id));
    }
    getKey(id) {
        return super.get(Members.toKey(id));
    }
    setKey(id, member) {
        return super.set(Members.toKey(id), member);
    }
    deleteKey(id) {
        return super.delete(Members.toKey(id));
    }
    $get(id, data) {
        const member = this.getKey(id);
        if (data)
            member.update(data);
        return member;
    }
    /**
     * Create a member object.
     * This is meant for internal use only.
     * @param data: Member Data
     * @param emit Whether to emit creation event
     * @returns Member
     */
    createObj(data, emit) {
        if (this.hasKey(data._id))
            return this.$get(data._id, data);
        const member = new Member(this.client, data);
        runInAction(() => {
            this.setKey(data._id, member);
        });
        if (emit === true)
            this.client.emit("member/join", member);
        return member;
    }
}
__decorate([
    action
], Members.prototype, "$get", null);
