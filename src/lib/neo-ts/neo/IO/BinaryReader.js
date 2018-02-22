import { Fixed8 } from '../Fixed8';
import { Uint64 } from '../Uint64';
import { Uint160 } from '../Uint160';
import { Uint256 } from '../Uint256';
export class BinaryReader {
    constructor(input) {
        this.input = input;
        this._buffer = new ArrayBuffer(8);
    }
    close() {
    }
    fillBuffer(buffer, count) {
        let i = 0;
        while (count > 0) {
            let actual_count = this.input.read(buffer, 0, count);
            if (actual_count == 0)
                throw new Error("EOF");
            i += actual_count;
            count -= actual_count;
        }
    }
    read(buffer, index, count) {
        return this.input.read(buffer, index, count);
    }
    readBoolean() {
        return this.readByte() != 0;
    }
    readByte() {
        this.fillBuffer(this._buffer, 1);
        if (this.array_uint8 == null)
            this.array_uint8 = new Uint8Array(this._buffer, 0, 1);
        return this.array_uint8[0];
    }
    readBytes(count) {
        let buffer = new ArrayBuffer(count);
        this.fillBuffer(buffer, count);
        return buffer;
    }
    readDouble() {
        this.fillBuffer(this._buffer, 8);
        if (this.array_float64 == null)
            this.array_float64 = new Float64Array(this._buffer, 0, 1);
        return this.array_float64[0];
    }
    readFixed8() {
        return new Fixed8(this.readUint64());
    }
    readInt16() {
        this.fillBuffer(this._buffer, 2);
        if (this.array_int16 == null)
            this.array_int16 = new Int16Array(this._buffer, 0, 1);
        return this.array_int16[0];
    }
    readInt32() {
        this.fillBuffer(this._buffer, 4);
        if (this.array_int32 == null)
            this.array_int32 = new Int32Array(this._buffer, 0, 1);
        return this.array_int32[0];
    }
    readSByte() {
        this.fillBuffer(this._buffer, 1);
        if (this.array_int8 == null)
            this.array_int8 = new Int8Array(this._buffer, 0, 1);
        return this.array_int8[0];
    }
    readSerializable(T) {
        let obj = new T();
        obj.deserialize(this);
        return obj;
    }
    readSerializableArray(T) {
        let array = new Array(this.readVarInt(0x10000000));
        for (let i = 0; i < array.length; i++)
            array[i] = this.readSerializable(T);
        return array;
    }
    readSingle() {
        this.fillBuffer(this._buffer, 4);
        if (this.array_float32 == null)
            this.array_float32 = new Float32Array(this._buffer, 0, 1);
        return this.array_float32[0];
    }
    readUint16() {
        this.fillBuffer(this._buffer, 2);
        if (this.array_uint16 == null)
            this.array_uint16 = new Uint16Array(this._buffer, 0, 1);
        return this.array_uint16[0];
    }
    readUint160() {
        return new Uint160(this.readBytes(20));
    }
    readUint256() {
        return new Uint256(this.readBytes(32));
    }
    readUint32() {
        this.fillBuffer(this._buffer, 4);
        if (this.array_uint32 == null)
            this.array_uint32 = new Uint32Array(this._buffer, 0, 1);
        return this.array_uint32[0];
    }
    readUint64() {
        this.fillBuffer(this._buffer, 8);
        if (this.array_uint32 == null)
            this.array_uint32 = new Uint32Array(this._buffer, 0, 2);
        return new Uint64(this.array_uint32[0], this.array_uint32[1]);
    }
    readVarBytes(max = 0X7fffffc7) {
        return this.readBytes(this.readVarInt(max));
    }
    readVarInt(max = 9007199254740991) {
        let fb = this.readByte();
        let value;
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
    }
    readVarString() {
        return decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(this.readVarBytes()))));
    }
}
//# sourceMappingURL=BinaryReader.js.map