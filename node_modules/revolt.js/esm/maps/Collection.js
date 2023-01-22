import { ObservableMap } from "mobx";
export default class Collection extends ObservableMap {
    constructor(client) {
        super();
        this.client = client;
    }
}
