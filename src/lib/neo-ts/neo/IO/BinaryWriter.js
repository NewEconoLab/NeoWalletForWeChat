"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BinaryWriter {
    constructor(output) {
        this.output = output;
        this._buffer = new ArrayBuffer(8);
    }
    close() {
    }
    seek(offset, origin) {
        return this.output.seek(offset, origin);
    }
    write(buffer, index = 0, count = buffer.byteLength - index) {
        this.output.write(buffer, index, count);
    }
    writeBoolean(value) {
        this.writeByte(value ? 0xff : 0);
    }
    writeByte(value) {
        if (this.array_uint8 == null)
            this.array_uint8 = new Uint8Array(this._buffer, 0, 1);
        this.array_uint8[0] = value;
        this.output.write(this._buffer, 0, 1);
    }
    writeDouble(value) {
        if (this.array_float64 == null)
            this.array_float64 = new Float64Array(this._buffer, 0, 1);
        this.array_float64[0] = value;
        this.output.write(this._buffer, 0, 8);
    }
    writeInt16(value) {
        if (this.array_int16 == null)
            this.array_int16 = new Int16Array(this._buffer, 0, 1);
        this.array_int16[0] = value;
        this.output.write(this._buffer, 0, 2);
    }
    writeInt32(value) {
        if (this.array_int32 == null)
            this.array_int32 = new Int32Array(this._buffer, 0, 1);
        this.array_int32[0] = value;
        this.output.write(this._buffer, 0, 4);
    }
    writeSByte(value) {
        if (this.array_int8 == null)
            this.array_int8 = new Int8Array(this._buffer, 0, 1);
        this.array_int8[0] = value;
        this.output.write(this._buffer, 0, 1);
    }
    writeSerializableArray(array) {
        this.writeVarInt(array.length);
        for (let i = 0; i < array.length; i++)
            array[i].serialize(this);
    }
    writeSingle(value) {
        if (this.array_float32 == null)
            this.array_float32 = new Float32Array(this._buffer, 0, 1);
        this.array_float32[0] = value;
        this.output.write(this._buffer, 0, 4);
    }
    writeUint16(value) {
        if (this.array_uint16 == null)
            this.array_uint16 = new Uint16Array(this._buffer, 0, 1);
        this.array_uint16[0] = value;
        this.output.write(this._buffer, 0, 2);
    }
    writeUint32(value) {
        if (this.array_uint32 == null)
            this.array_uint32 = new Uint32Array(this._buffer, 0, 1);
        this.array_uint32[0] = value;
        this.output.write(this._buffer, 0, 4);
    }
    writeUint64(value) {
        this.writeUintVariable(value);
    }
    writeUintVariable(value) {
        this.write(value.bits.buffer);
    }
    writeVarBytes(value) {
        this.writeVarInt(value.byteLength);
        this.output.write(value, 0, value.byteLength);
    }
    writeVarInt(value) {
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
    }
    writeVarString(value) {
        value = unescape(encodeURIComponent(value));
        let codes = new Uint8Array(value.length);
        for (let i = 0; i < codes.length; i++)
            codes[i] = value.charCodeAt(i);
        this.writeVarBytes(codes.buffer);
    }
}
exports.BinaryWriter = BinaryWriter;
//# sourceMappingURL=BinaryWriter.js.map