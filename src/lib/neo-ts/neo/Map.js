export class NeoMap {
    constructor() {
        this._map = new Object();
        this._size = 0;
    }
    get size() { return this._size; }
    clear() {
        for (let key in this._map)
            delete this._map[key];
        this._size = 0;
    }
    delete(key) {
        if (!this._map.hasOwnProperty(key))
            return false;
        this._size--;
        return delete this._map[key];
    }
    forEach(callback) {
        for (let key in this._map)
            callback(this._map[key], key, this);
    }
    get(key) {
        return this._map[key];
    }
    has(key) {
        return this._map.hasOwnProperty(key);
    }
    set(key, value) {
        if (!this._map.hasOwnProperty(key))
            this._size++;
        this._map[key] = value;
    }
}
//# sourceMappingURL=Map.js.map