import { Uint64, IO } from './index';
export declare class Fixed8 implements IO.ISerializable {
    private data;
    static readonly MaxValue: Fixed8;
    static readonly MinusOne: Fixed8;
    static readonly MinValue: Fixed8;
    static readonly One: Fixed8;
    static readonly Satoshi: Fixed8;
    static readonly Zero: Fixed8;
    constructor(data: Uint64);
    add(other: Fixed8): Fixed8;
    compareTo(other: Fixed8): number;
    equals(other: Fixed8): boolean;
    static fromNumber(value: number): Fixed8;
    getData(): Uint64;
    static max(first: Fixed8, ...others: Fixed8[]): Fixed8;
    static min(first: Fixed8, ...others: Fixed8[]): Fixed8;
    static parse(str: string): Fixed8;
    subtract(other: Fixed8): Fixed8;
    toString(): string;
    deserialize(reader: IO.BinaryReader): void;
    serialize(writer: IO.BinaryWriter): void;
}
