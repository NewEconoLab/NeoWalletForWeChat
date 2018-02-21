import { OpCode } from '../../index';
export declare class ByteReader {
    constructor(data: Uint8Array);
    data: Uint8Array;
    addr: number;
    ReadOP(): OpCode;
    ReadBytes(count: number): Uint8Array;
    ReadByte(): number;
    ReadUInt16(): number;
    ReadInt16(): number;
    ReadUInt32(): number;
    ReadInt32(): number;
    ReadUInt64(): number;
    ReadVarBytes(): Uint8Array;
    ReadVarInt(): number;
    readonly End: boolean;
}
