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
var NEO = require("../index");
var _max, _min;
var Uint64 = /** @class */ (function (_super) {
    __extends(Uint64, _super);
    function Uint64(low, high) {
        if (low === void 0) { low = 0; }
        if (high === void 0) { high = 0; }
        return _super.call(this, [low, high]) || this;
    }
    Object.defineProperty(Uint64, "MaxValue", {
        get: function () { return _max || (_max = new Uint64(0xffffffff, 0xffffffff)); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Uint64, "MinValue", {
        get: function () { return _min || (_min = new Uint64()); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Uint64, "Zero", {
        get: function () { return Uint64.MinValue; },
        enumerable: true,
        configurable: true
    });
    Uint64.prototype.add = function (other) {
        var low = this._bits[0] + other._bits[0];
        var high = this._bits[1] + other._bits[1] + (low > 0xffffffff ? 1 : 0);
        return new Uint64(low, high);
    };
    Uint64.prototype.and = function (other) {
        if (typeof other === "number") {
            return this.and(new Uint64(other));
        }
        else {
            var bits = new Uint32Array(this._bits.length);
            for (var i = 0; i < bits.length; i++)
                bits[i] = this._bits[i] & other._bits[i];
            return new Uint64(bits[0], bits[1]);
        }
    };
    Uint64.prototype.leftShift = function (shift) {
        if (shift == 0)
            return this;
        var shift_units = shift >>> 5;
        shift = shift & 0x1f;
        var bits = new Uint32Array(this._bits.length);
        for (var i = shift_units; i < bits.length; i++)
            if (shift == 0)
                bits[i] = this._bits[i - shift_units];
            else
                bits[i] = this._bits[i - shift_units] << shift | this._bits[i - shift_units - 1] >>> (32 - shift);
        return new Uint64(bits[0], bits[1]);
    };
    Uint64.prototype.not = function () {
        var bits = new Uint32Array(this._bits.length);
        for (var i = 0; i < bits.length; i++)
            bits[i] = ~this._bits[i];
        return new Uint64(bits[0], bits[1]);
    };
    Uint64.prototype.or = function (other) {
        if (typeof other === "number") {
            return this.or(new Uint64(other));
        }
        else {
            var bits = new Uint32Array(this._bits.length);
            for (var i = 0; i < bits.length; i++)
                bits[i] = this._bits[i] | other._bits[i];
            return new Uint64(bits[0], bits[1]);
        }
    };
    Uint64.parse = function (str) {
        var bi = NEO.BigInteger.parse(str);
        if (bi.bitLength() > 64)
            throw new RangeError();
        var array = new Uint32Array(bi.toUint8Array(true, 8).buffer);
        return new Uint64(array[0], array[1]);
    };
    Uint64.prototype.rightShift = function (shift) {
        if (shift == 0)
            return this;
        var shift_units = shift >>> 5;
        shift = shift & 0x1f;
        var bits = new Uint32Array(this._bits.length);
        for (var i = 0; i < bits.length - shift_units; i++)
            if (shift == 0)
                bits[i] = this._bits[i + shift_units];
            else
                bits[i] = this._bits[i + shift_units] >>> shift | this._bits[i + shift_units + 1] << (32 - shift);
        return new Uint64(bits[0], bits[1]);
    };
    Uint64.prototype.subtract = function (other) {
        var low = this._bits[0] - other._bits[0];
        var high = this._bits[1] - other._bits[1] - (this._bits[0] < other._bits[0] ? 1 : 0);
        return new Uint64(low, high);
    };
    Uint64.prototype.toInt32 = function () {
        return this._bits[0] | 0;
    };
    Uint64.prototype.toNumber = function () {
        return this._bits[0] + this._bits[1] * Math.pow(2, 32);
    };
    Uint64.prototype.toString = function () {
        return (new NEO.BigInteger(this._bits.buffer)).toString();
    };
    Uint64.prototype.toUint32 = function () {
        return this._bits[0];
    };
    Uint64.prototype.xor = function (other) {
        if (typeof other === "number") {
            return this.xor(new Uint64(other));
        }
        else {
            var bits = new Uint32Array(this._bits.length);
            for (var i = 0; i < bits.length; i++)
                bits[i] = this._bits[i] ^ other._bits[i];
            return new Uint64(bits[0], bits[1]);
        }
    };
    return Uint64;
}(UintVariable_1.UintVariable));
exports.Uint64 = Uint64;
