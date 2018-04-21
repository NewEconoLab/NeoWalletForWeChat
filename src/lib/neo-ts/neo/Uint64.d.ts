/// <reference path="UintVariable.d.ts" />
import { UintVariable } from './UintVariable';
export declare class Uint64 extends UintVariable {
    static readonly MaxValue: Uint64;
    static readonly MinValue: Uint64;
    static readonly Zero: Uint64;
    constructor(low?: number, high?: number);
    add(other: Uint64): Uint64;
    and(other: number | Uint64): Uint64;
    leftShift(shift: number): Uint64;
    not(): Uint64;
    or(other: number | Uint64): Uint64;
    static parse(buffer: ArrayBuffer): Uint64;
    rightShift(shift: number): Uint64;
    subtract(other: Uint64): Uint64;
    toInt32(): number;
    toNumber(): number;
    toUint32(): number;
    xor(other: number | Uint64): Uint64;
}
