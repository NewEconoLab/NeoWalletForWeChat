"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TrackState_1 = require("./TrackState");
const Map_1 = require("../../Map");
class TrackableCollection {
    constructor(items) {
        this._map = new Map_1.NeoMap();
        if (items != null) {
            for (let i = 0; i < items.length; i++) {
                this._map.set(items[i].key, items[i]);
                items[i].trackState = TrackState_1.TrackState.None;
            }
        }
    }
    add(item) {
        this._map.set(item.key, item);
        item.trackState = TrackState_1.TrackState.Added;
    }
    clear() {
        this._map.forEach((value, key, map) => {
            if (value.trackState == TrackState_1.TrackState.Added)
                map.delete(key);
            else
                value.trackState = TrackState_1.TrackState.Deleted;
        });
    }
    commit() {
        this._map.forEach((value, key, map) => {
            if (value.trackState == TrackState_1.TrackState.Deleted)
                map.delete(key);
            else
                value.trackState = TrackState_1.TrackState.None;
        });
    }
    forEach(callback) {
        this._map.forEach((value, key) => {
            callback(value, key, this);
        });
    }
    get(key) {
        return this._map.get(key);
    }
    getChangeSet() {
        let array = new Array();
        this._map.forEach(value => {
            if (value.trackState != TrackState_1.TrackState.None)
                array.push(value);
        });
        return array;
    }
    has(key) {
        return this._map.has(key);
    }
    remove(key) {
        let item = this._map.get(key);
        if (item.trackState == TrackState_1.TrackState.Added)
            this._map.delete(key);
        else
            item.trackState = TrackState_1.TrackState.Deleted;
    }
}
exports.TrackableCollection = TrackableCollection;
//# sourceMappingURL=TrackableCollection.js.map