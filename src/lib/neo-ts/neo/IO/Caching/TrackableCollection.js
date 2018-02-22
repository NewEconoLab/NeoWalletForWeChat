import { TrackState } from './TrackState';
import { NeoMap } from '../../Map';
export class TrackableCollection {
    constructor(items) {
        this._map = new NeoMap();
        if (items != null) {
            for (let i = 0; i < items.length; i++) {
                this._map.set(items[i].key, items[i]);
                items[i].trackState = TrackState.None;
            }
        }
    }
    add(item) {
        this._map.set(item.key, item);
        item.trackState = TrackState.Added;
    }
    clear() {
        this._map.forEach((value, key, map) => {
            if (value.trackState == TrackState.Added)
                map.delete(key);
            else
                value.trackState = TrackState.Deleted;
        });
    }
    commit() {
        this._map.forEach((value, key, map) => {
            if (value.trackState == TrackState.Deleted)
                map.delete(key);
            else
                value.trackState = TrackState.None;
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
            if (value.trackState != TrackState.None)
                array.push(value);
        });
        return array;
    }
    has(key) {
        return this._map.has(key);
    }
    remove(key) {
        let item = this._map.get(key);
        if (item.trackState == TrackState.Added)
            this._map.delete(key);
        else
            item.trackState = TrackState.Deleted;
    }
}
//# sourceMappingURL=TrackableCollection.js.map