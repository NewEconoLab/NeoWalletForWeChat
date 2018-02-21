/// <reference path="UintVariable.d.ts" />
import { UintVariable } from './UintVariable';
export declare class Uint160 extends UintVariable {
    static readonly Zero: Uint160;
    constructor(value?: ArrayBuffer);
    static parse(str: string): Uint160;
}
