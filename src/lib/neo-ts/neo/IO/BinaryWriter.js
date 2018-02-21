"use strict";
exports.__esModule = true;
var BinaryWriter = /** @class */ (function () {
    function BinaryWriter(output) {
        this.output = output;
        this._buffer = new ArrayBuffer(8);
    }
    BinaryWriter.prototype.close = function () {
    };
    BinaryWriter.prototype.seek = function (offset, origin) {
        return this.output.seek(offset, origin);
    };
    BinaryWriter.prototype.write = function (buffer, index, count) {
        if (index === void 0) { index = 0; }
        if (count === void 0) { count = buffer.byteLength - index; }
        this.output.write(buffer, index, count);
    };
    BinaryWriter.prototype.writeBoolean = function (value) {
        this.writeByte(value ? 0xff : 0);
    };
    BinaryWriter.prototype.writeByte = function (value) {
        if (this.array_uint8 == null)
            this.array_uint8 = new Uint8Array(this._buffer, 0, 1);
        this.array_uint8[0] = value;
        this.output.write(this._buffer, 0, 1);
    };
    BinaryWriter.prototype.writeDouble = function (value) {
        if (this.array_float64 == null)
            this.array_float64 = new Float64Array(this._buffer, 0, 1);
        this.array_float64[0] = value;
        this.output.write(this._buffer, 0, 8);
    };
    BinaryWriter.prototype.writeInt16 = function (value) {
        if (this.array_int16 == null)
            this.array_int16 = new Int16Array(this._buffer, 0, 1);
        this.array_int16[0] = value;
        this.output.write(this._buffer, 0, 2);
    };
    BinaryWriter.prototype.writeInt32 = function (value) {
        if (this.array_int32 == null)
            this.array_int32 = new Int32Array(this._buffer, 0, 1);
        this.array_int32[0] = value;
        this.output.write(this._buffer, 0, 4);
    };
    BinaryWriter.prototype.writeSByte = function (value) {
        if (this.array_int8 == null)
            this.array_int8 = new Int8Array(this._buffer, 0, 1);
        this.array_int8[0] = value;
        this.output.write(this._buffer, 0, 1);
    };
    BinaryWriter.prototype.writeSerializableArray = function (array) {
        this.writeVarInt(array.length);
        for (var i = 0; i < array.length; i++)
            array[i].serialize(this);
    };
    BinaryWriter.prototype.writeSingle = function (value) {
        if (this.array_float32 == null)
            this.array_float32 = new Float32Array(this._buffer, 0, 1);
        this.array_float32[0] = value;
        this.output.write(this._buffer, 0, 4);
    };
    BinaryWriter.prototype.writeUint16 = function (value) {
        if (this.array_uint16 == null)
            this.array_uint16 = new Uint16Array(this._buffer, 0, 1);
        this.array_uint16[0] = value;
        this.output.write(this._buffer, 0, 2);
    };
    BinaryWriter.prototype.writeUint32 = function (value) {
        if (this.array_uint32 == null)
            this.array_uint32 = new Uint32Array(this._buffer, 0, 1);
        this.array_uint32[0] = value;
        this.output.write(this._buffer, 0, 4);
    };
    BinaryWriter.prototype.writeUint64 = function (value) {
        this.writeUintVariable(value);
    };
    BinaryWriter.prototype.writeUintVariable = function (value) {
        this.write(value.bits.buffer);
    };
    BinaryWriter.prototype.writeVarBytes = function (value) {
        this.writeVarInt(value.byteLength);
        this.output.write(value, 0, value.byteLength);
    };
    BinaryWriter.prototype.writeVarInt = function (value) {
        if (value < 0)
            throw new RangeError();
        if (value < 0xfd) {
            this.writeByte(value);
        }
        else if (value <= 0xffff) {
            this.writeByte(0xfd);
            this.writeUint16(value);
        }
        else if (value <= 0xFFFFFFFF) {
            this.writeByte(0xfe);
            this.writeUint32(value);
        }
        else {
            this.writeByte(0xff);
            this.writeUint32(value);
            this.writeUint32(value / Math.pow(2, 32));
        }
    };
    BinaryWriter.prototype.writeVarString = function (value) {
        value = unescape(encodeURIComponent(value));
        var codes = new Uint8Array(value.length);
        for (var i = 0; i < codes.length; i++)
            codes[i] = value.charCodeAt(i);
        this.writeVarBytes(codes.buffer);
    };
    return BinaryWriter;
}());
exports.BinaryWriter = BinaryWriter;
