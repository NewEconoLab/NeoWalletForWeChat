"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
///<reference path="UintVariable.ts"/>
var UintVariable_1 = require("./UintVariable");
var _zero;
var Uint160 = /** @class */ (function (_super) {
    __extends(Uint160, _super);
    function Uint160(value) {
        var _this = this;
        if (value == null)
            value = new ArrayBuffer(20);
        if (value.byteLength != 20)
            throw new RangeError();
        _this = _super.call(this, new Uint32Array(value)) || this;
        return _this;
    }
    Object.defineProperty(Uint160, "Zero", {
        get: function () { return _zero || (_zero = new Uint160()); },
        enumerable: true,
        configurable: true
    });
    Uint160.parse = function (str) {
        if (str.length != 40)
            throw new RangeError();
        var x = str.hexToBytes();
        var y = new Uint8Array(x.length);
        for (var i = 0; i < y.length; i++)
            y[i] = x[x.length - i - 1];
        return new Uint160(y.buffer);
    };
    return Uint160;
}(UintVariable_1.UintVariable));
exports.Uint160 = Uint160;
