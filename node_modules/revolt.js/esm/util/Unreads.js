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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { action, computed, makeAutoObservable, ObservableMap, runInAction, } from "mobx";
import { ulid } from "ulid";
/**
 * Handles channel unreads.
 */
export default class Unreads {
    /**
     * Construct new Unreads store.
     */
    constructor(client) {
        this.channels = new ObservableMap();
        this.loaded = false;
        makeAutoObservable(this);
        this.client = client;
    }
    /**
     * Sync unread data from the server.
     */
    sync() {
        return __awaiter(this, void 0, void 0, function* () {
            const unreads = yield this.client.syncFetchUnreads();
            runInAction(() => {
                this.loaded = true;
                for (const unread of unreads) {
                    const { _id } = unread, data = __rest(unread, ["_id"]);
                    this.channels.set(_id.channel, data);
                }
            });
        });
    }
    /**
     * Get channel unread object for a given channel.
     * @param channel_id Target channel ID
     * @returns Partial channel unread object
     */
    getUnread(channel_id) {
        if (!this.loaded)
            return {
                last_id: "40000000000000000000000000",
            };
        return this.channels.get(channel_id);
    }
    /**
     * Mark a channel as unread by setting a custom last_id.
     * @param channel_id Target channel ID
     * @param last_id New last ID
     */
    markUnread(channel_id, last_id) {
        this.channels.set(channel_id, Object.assign(Object.assign({}, this.getUnread(channel_id)), { last_id }));
    }
    /**
     * Add a mention to a channel unread.
     * @param channel_id Target channel ID
     * @param message_id Target message ID
     */
    markMention(channel_id, message_id) {
        var _a;
        const unread = this.getUnread(channel_id);
        this.channels.set(channel_id, Object.assign(Object.assign({ last_id: "0" }, unread), { mentions: [...((_a = unread === null || unread === void 0 ? void 0 : unread.mentions) !== null && _a !== void 0 ? _a : []), message_id] }));
    }
    /**
     * Mark a channel as read.
     * @param channel_id Target channel ID
     * @param message_id Target message ID (last sent in channel)
     * @param emit Whether to emit to server
     * @param skipRateLimiter Whether to skip the rate limiter
     */
    markRead(channel_id, message_id, emit = false, skipRateLimiter = false) {
        var _a;
        const last_id = message_id !== null && message_id !== void 0 ? message_id : ulid();
        this.channels.set(channel_id, { last_id });
        if (emit) {
            (_a = this.client.channels.get(channel_id)) === null || _a === void 0 ? void 0 : _a.ack(last_id, skipRateLimiter);
        }
    }
    /**
     * Mark multiple channels as read.
     * @param channel_ids Target channel IDs
     */
    markMultipleRead(channel_ids) {
        const last_id = ulid();
        for (const channel_id of channel_ids) {
            this.channels.set(channel_id, { last_id });
        }
    }
}
__decorate([
    computed
], Unreads.prototype, "getUnread", null);
__decorate([
    action
], Unreads.prototype, "markUnread", null);
__decorate([
    action
], Unreads.prototype, "markMention", null);
__decorate([
    action
], Unreads.prototype, "markRead", null);
__decorate([
    action
], Unreads.prototype, "markMultipleRead", null);
