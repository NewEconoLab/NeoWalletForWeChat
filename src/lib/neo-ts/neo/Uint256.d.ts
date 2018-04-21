/// <reference path="UintVariable.d.ts" />
import { UintVariable } from './UintVariable';
export declare class Uint256 extends UintVariable {
    static readonly Zero: Uint256;
    constructor(value?: ArrayBuffer);
    static parse(str: string): Uint256;
}
