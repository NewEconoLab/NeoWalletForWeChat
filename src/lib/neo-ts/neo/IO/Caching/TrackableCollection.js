"use strict";
exports.__esModule = true;
var index_1 = require("./index");
var index_2 = require("../../index");
var TrackableCollection = /** @class */ (function () {
    function TrackableCollection(items) {
        this._map = new index_2.NeoMap();
        if (items != null) {
            for (var i = 0; i < items.length; i++) {
                this._map.set(items[i].key, items[i]);
                items[i].trackState = index_1.TrackState.None;
            }
        }
    }
    TrackableCollection.prototype.add = function (item) {
        this._map.set(item.key, item);
        item.trackState = index_1.TrackState.Added;
    };
    TrackableCollection.prototype.clear = function () {
        this._map.forEach(function (value, key, map) {
            if (value.trackState == index_1.TrackState.Added)
                map["delete"](key);
            else
                value.trackState = index_1.TrackState.Deleted;
        });
    };
    TrackableCollection.prototype.commit = function () {
        this._map.forEach(function (value, key, map) {
            if (value.trackState == index_1.TrackState.Deleted)
                map["delete"](key);
            else
                value.trackState = index_1.TrackState.None;
        });
    };
    TrackableCollection.prototype.forEach = function (callback) {
        var _this = this;
        this._map.forEach(function (value, key) {
            callback(value, key, _this);
        });
    };
    TrackableCollection.prototype.get = function (key) {
        return this._map.get(key);
    };
    TrackableCollection.prototype.getChangeSet = function () {
        var array = new Array();
        this._map.forEach(function (value) {
            if (value.trackState != index_1.TrackState.None)
                array.push(value);
        });
        return array;
    };
    TrackableCollection.prototype.has = function (key) {
        return this._map.has(key);
    };
    TrackableCollection.prototype.remove = function (key) {
        var item = this._map.get(key);
        if (item.trackState == index_1.TrackState.Added)
            this._map["delete"](key);
        else
            item.trackState = index_1.TrackState.Deleted;
    };
    return TrackableCollection;
}());
exports.TrackableCollection = TrackableCollection;
