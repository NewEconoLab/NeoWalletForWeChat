"use strict";
exports.__esModule = true;
var NeoMap = /** @class */ (function () {
    function NeoMap() {
        this._map = new Object();
        this._size = 0;
    }
    Object.defineProperty(NeoMap.prototype, "size", {
        get: function () { return this._size; },
        enumerable: true,
        configurable: true
    });
    NeoMap.prototype.clear = function () {
        for (var key in this._map)
            delete this._map[key];
        this._size = 0;
    };
    NeoMap.prototype["delete"] = function (key) {
        if (!this._map.hasOwnProperty(key))
            return false;
        this._size--;
        return delete this._map[key];
    };
    NeoMap.prototype.forEach = function (callback) {
        for (var key in this._map)
            callback(this._map[key], key, this);
    };
    NeoMap.prototype.get = function (key) {
        return this._map[key];
    };
    NeoMap.prototype.has = function (key) {
        return this._map.hasOwnProperty(key);
    };
    NeoMap.prototype.set = function (key, value) {
        if (!this._map.hasOwnProperty(key))
            this._size++;
        this._map[key] = value;
    };
    return NeoMap;
}());
exports.NeoMap = NeoMap;
