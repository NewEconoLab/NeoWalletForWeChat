export class ByteReader {
    constructor(data) {
        this.addr = 0;
        this.data = data;
    }
    ReadOP() {
        var op = this.data[this.addr];
        this.addr++;
        return op;
    }
    ReadBytes(count) {
        var _data = new Uint8Array(count);
        for (var i = 0; i < count; i++)
            _data[i] = this.data[this.addr + i];
        this.addr += count;
        return _data;
    }
    ReadByte() {
        var b = this.data[this.addr];
        this.addr++;
        return b;
    }
    ReadUInt16() {
        var d = new DataView(this.data.buffer);
        var u16 = d.getUint16(this.addr, true);
        this.addr += 2;
        return u16;
    }
    ReadInt16() {
        var d = new DataView(this.data.buffer);
        var u16 = d.getInt16(this.addr, true);
        this.addr += 2;
        return u16;
    }
    ReadUInt32() {
        var d = new DataView(this.data.buffer);
        var u16 = d.getUint32(this.addr, true);
        this.addr += 4;
        return u16;
    }
    ReadInt32() {
        var d = new DataView(this.data.buffer);
        var u16 = d.getInt32(this.addr, true);
        this.addr += 4;
        return u16;
    }
    ReadUInt64() {
        var u1 = this.ReadUInt32();
        var u2 = this.ReadUInt32();
        return u2 * 0x100000000 + u1;
    }
    ReadVarBytes() {
        var count = this.ReadVarInt();
        return this.ReadBytes(count);
    }
    ReadVarInt() {
        var fb = this.ReadByte();
        var value;
        if (fb == 0xFD)
            value = this.ReadUInt16();
        else if (fb == 0xFE)
            value = this.ReadUInt32();
        else if (fb == 0xFF)
            value = this.ReadUInt64();
        else
            value = fb;
        return value;
    }
    get End() {
        return this.addr >= this.data.length;
    }
}
//# sourceMappingURL=byteReader.js.map