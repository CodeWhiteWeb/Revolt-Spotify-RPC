"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
class Collection extends mobx_1.ObservableMap {
    constructor(client) {
        super();
        this.client = client;
    }
}
exports.default = Collection;
