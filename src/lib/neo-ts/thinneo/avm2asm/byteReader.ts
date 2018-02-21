module ThinNeo.Compiler {
    export class ByteReader {
        public constructor(data: Uint8Array) {
            this.data = data;
        }
        public data: Uint8Array;
        public addr: number = 0;
        public ReadOP(): OpCode {
            var op = this.data[this.addr] as OpCode;
            this.addr++;
            return op;
        }
        public ReadBytes(count: number): Uint8Array {
            var _data = new Uint8Array(count);
            for (var i = 0; i < count; i++)
                _data[i] = this.data[this.addr + i];
            this.addr += count;
            return _data;
        }

        public ReadByte(): number {
            var b = this.data[this.addr];
            this.addr++;
            return b;
        }
        public ReadUInt16(): number {
            var d = new DataView(this.data.buffer);
            var u16 = d.getUint16(this.addr, true);
            this.addr += 2;
            return u16;
        }
        public ReadInt16(): number {
            var d = new DataView(this.data.buffer);
            var u16 = d.getInt16(this.addr, true);
            this.addr += 2;
            return u16;
        }
        public ReadUInt32(): number {
            var d = new DataView(this.data.buffer);
            var u16 = d.getUint32(this.addr, true);
            this.addr += 4;
            return u16;

        }

        public ReadInt32(): number {
            var d = new DataView(this.data.buffer);
            var u16 = d.getInt32(this.addr, true);
            this.addr += 4;
            return u16;
        }
        public ReadUInt64(): number {
            var u1 = this.ReadUInt32();
            var u2 = this.ReadUInt32();
            return u2 * 0x100000000 + u1;
        }
        //public ReadInt64(): number {
        //    var u16 = BitConverter.ToInt64(data, addr);
        //    addr += 8;
        //    return u16;
        //}
        public ReadVarBytes(): Uint8Array {
            var count = this.ReadVarInt();
            return this.ReadBytes(count);
        }
        public ReadVarInt(): number {
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
        public get End() {
            return this.addr >= this.data.length;
        }
    }
}
