"use strict";
exports.__esModule = true;
var ByteReader = /** @class */ (function () {
    function ByteReader(data) {
        this.addr = 0;
        this.data = data;
    }
    ByteReader.prototype.ReadOP = function () {
        var op = this.data[this.addr];
        this.addr++;
        return op;
    };
    ByteReader.prototype.ReadBytes = function (count) {
        var _data = new Uint8Array(count);
        for (var i = 0; i < count; i++)
            _data[i] = this.data[this.addr + i];
        this.addr += count;
        return _data;
    };
    ByteReader.prototype.ReadByte = function () {
        var b = this.data[this.addr];
        this.addr++;
        return b;
    };
    ByteReader.prototype.ReadUInt16 = function () {
        var d = new DataView(this.data.buffer);
        var u16 = d.getUint16(this.addr, true);
        this.addr += 2;
        return u16;
    };
    ByteReader.prototype.ReadInt16 = function () {
        var d = new DataView(this.data.buffer);
        var u16 = d.getInt16(this.addr, true);
        this.addr += 2;
        return u16;
    };
    ByteReader.prototype.ReadUInt32 = function () {
        var d = new DataView(this.data.buffer);
        var u16 = d.getUint32(this.addr, true);
        this.addr += 4;
        return u16;
    };
    ByteReader.prototype.ReadInt32 = function () {
        var d = new DataView(this.data.buffer);
        var u16 = d.getInt32(this.addr, true);
        this.addr += 4;
        return u16;
    };
    ByteReader.prototype.ReadUInt64 = function () {
        var u1 = this.ReadUInt32();
        var u2 = this.ReadUInt32();
        return u2 * 0x100000000 + u1;
    };
    //public ReadInt64(): number {
    //    var u16 = BitConverter.ToInt64(data, addr);
    //    addr += 8;
    //    return u16;
    //}
    ByteReader.prototype.ReadVarBytes = function () {
        var count = this.ReadVarInt();
        return this.ReadBytes(count);
    };
    ByteReader.prototype.ReadVarInt = function () {
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
    };
    Object.defineProperty(ByteReader.prototype, "End", {
        get: function () {
            return this.addr >= this.data.length;
        },
        enumerable: true,
        configurable: true
    });
    return ByteReader;
}());
exports.ByteReader = ByteReader;
