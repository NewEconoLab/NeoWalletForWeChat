"use strict";
exports.__esModule = true;
var index_1 = require("./../../index");
var BinaryReader = /** @class */ (function () {
    function BinaryReader(input) {
        this.input = input;
        this._buffer = new ArrayBuffer(8);
    }
    BinaryReader.prototype.close = function () {
    };
    BinaryReader.prototype.fillBuffer = function (buffer, count) {
        var i = 0;
        while (count > 0) {
            var actual_count = this.input.read(buffer, 0, count);
            if (actual_count == 0)
                throw new Error("EOF");
            i += actual_count;
            count -= actual_count;
        }
    };
    BinaryReader.prototype.read = function (buffer, index, count) {
        return this.input.read(buffer, index, count);
    };
    BinaryReader.prototype.readBoolean = function () {
        return this.readByte() != 0;
    };
    BinaryReader.prototype.readByte = function () {
        this.fillBuffer(this._buffer, 1);
        if (this.array_uint8 == null)
            this.array_uint8 = new Uint8Array(this._buffer, 0, 1);
        return this.array_uint8[0];
    };
    BinaryReader.prototype.readBytes = function (count) {
        var buffer = new ArrayBuffer(count);
        this.fillBuffer(buffer, count);
        return buffer;
    };
    BinaryReader.prototype.readDouble = function () {
        this.fillBuffer(this._buffer, 8);
        if (this.array_float64 == null)
            this.array_float64 = new Float64Array(this._buffer, 0, 1);
        return this.array_float64[0];
    };
    BinaryReader.prototype.readFixed8 = function () {
        return new index_1.Fixed8(this.readUint64());
    };
    BinaryReader.prototype.readInt16 = function () {
        this.fillBuffer(this._buffer, 2);
        if (this.array_int16 == null)
            this.array_int16 = new Int16Array(this._buffer, 0, 1);
        return this.array_int16[0];
    };
    BinaryReader.prototype.readInt32 = function () {
        this.fillBuffer(this._buffer, 4);
        if (this.array_int32 == null)
            this.array_int32 = new Int32Array(this._buffer, 0, 1);
        return this.array_int32[0];
    };
    BinaryReader.prototype.readSByte = function () {
        this.fillBuffer(this._buffer, 1);
        if (this.array_int8 == null)
            this.array_int8 = new Int8Array(this._buffer, 0, 1);
        return this.array_int8[0];
    };
    BinaryReader.prototype.readSerializable = function (T) {
        var obj = new T();
        obj.deserialize(this);
        return obj;
    };
    BinaryReader.prototype.readSerializableArray = function (T) {
        var array = new Array(this.readVarInt(0x10000000));
        for (var i = 0; i < array.length; i++)
            array[i] = this.readSerializable(T);
        return array;
    };
    BinaryReader.prototype.readSingle = function () {
        this.fillBuffer(this._buffer, 4);
        if (this.array_float32 == null)
            this.array_float32 = new Float32Array(this._buffer, 0, 1);
        return this.array_float32[0];
    };
    BinaryReader.prototype.readUint16 = function () {
        this.fillBuffer(this._buffer, 2);
        if (this.array_uint16 == null)
            this.array_uint16 = new Uint16Array(this._buffer, 0, 1);
        return this.array_uint16[0];
    };
    BinaryReader.prototype.readUint160 = function () {
        return new index_1.Uint160(this.readBytes(20));
    };
    BinaryReader.prototype.readUint256 = function () {
        return new index_1.Uint256(this.readBytes(32));
    };
    BinaryReader.prototype.readUint32 = function () {
        this.fillBuffer(this._buffer, 4);
        if (this.array_uint32 == null)
            this.array_uint32 = new Uint32Array(this._buffer, 0, 1);
        return this.array_uint32[0];
    };
    BinaryReader.prototype.readUint64 = function () {
        this.fillBuffer(this._buffer, 8);
        if (this.array_uint32 == null)
            this.array_uint32 = new Uint32Array(this._buffer, 0, 2);
        return new index_1.Uint64(this.array_uint32[0], this.array_uint32[1]);
    };
    BinaryReader.prototype.readVarBytes = function (max) {
        if (max === void 0) { max = 0X7fffffc7; }
        return this.readBytes(this.readVarInt(max));
    };
    BinaryReader.prototype.readVarInt = function (max) {
        if (max === void 0) { max = 9007199254740991; }
        var fb = this.readByte();
        var value;
        if (fb == 0xfd)
            value = this.readUint16();
        else if (fb == 0xfe)
            value = this.readUint32();
        else if (fb == 0xff)
            value = this.readUint64().toNumber();
        else
            value = fb;
        if (value > max)
            throw new RangeError();
        return value;
    };
    BinaryReader.prototype.readVarString = function () {
        return decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(this.readVarBytes()))));
    };
    return BinaryReader;
}());
exports.BinaryReader = BinaryReader;
