var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { makeAutoObservable, runInAction } from "mobx";
import Collection from "./Collection";
import { decodeTime } from "ulid";
export class Emoji {
    constructor(client, data) {
        var _a, _b;
        this.client = client;
        this._id = data._id;
        this.name = data.name;
        this.creator_id = data.creator_id;
        this.parent = data.parent;
        this.animated = (_a = data.animated) !== null && _a !== void 0 ? _a : false;
        this.nsfw = (_b = data.nsfw) !== null && _b !== void 0 ? _b : false;
        makeAutoObservable(this, {
            _id: false,
            client: false,
        });
    }
    /**
     * Get timestamp when this message was created.
     */
    get createdAt() {
        return decodeTime(this._id);
    }
    /**
     * Get creator of this emoji.
     */
    get creator() {
        return this.client.users.get(this.creator_id);
    }
    /**
     * Delete a message
     */
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.api.delete(`/custom/emoji/${this._id}`);
        });
    }
    /**
     * Generate emoji URL
     */
    get imageURL() {
        var _a;
        return `${(_a = this.client.configuration) === null || _a === void 0 ? void 0 : _a.features.autumn.url}/emojis/${this._id}${this.animated ? "" : "?max_side=128"}`;
    }
}
export default class Emojis extends Collection {
    constructor(client) {
        super(client);
        this.createObj = this.createObj.bind(this);
    }
    /**
     * Create an emoji object.
     * This is meant for internal use only.
     * @param data Emoji Data
     * @param emit Whether to emit creation event
     * @returns Emoji
     */
    createObj(data, emit) {
        if (this.has(data._id))
            return this.get(data._id);
        const emoji = new Emoji(this.client, data);
        runInAction(() => {
            this.set(data._id, emoji);
        });
        if (emit === true)
            this.client.emit("emoji/create", emoji);
        return emoji;
    }
}
