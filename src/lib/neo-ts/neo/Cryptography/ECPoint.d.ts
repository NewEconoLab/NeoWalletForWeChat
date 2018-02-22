import { ECCurve } from './ECCurve';
import { ECFieldElement } from './ECFieldElement';
import { BigInteger } from '../BigInteger';
import * as IO from '../IO/index';
export declare class ECPoint {
    x: ECFieldElement;
    y: ECFieldElement;
    curve: ECCurve;
    constructor(x: ECFieldElement, y: ECFieldElement, curve: ECCurve);
    static add(x: ECPoint, y: ECPoint): ECPoint;
    compareTo(other: ECPoint): number;
    static decodePoint(encoded: Uint8Array, curve: ECCurve): ECPoint;
    private static decompressPoint(yTilde, X1, curve);
    static deserializeFrom(reader: IO.BinaryReader, curve: ECCurve): ECPoint;
    encodePoint(commpressed: boolean): Uint8Array;
    equals(other: ECPoint): boolean;
    static fromUint8Array(arr: Uint8Array, curve: ECCurve): ECPoint;
    isInfinity(): boolean;
    static multiply(p: ECPoint, n: Uint8Array | BigInteger): ECPoint;
    negate(): ECPoint;
    static parse(str: string, curve: ECCurve): ECPoint;
    static subtract(x: ECPoint, y: ECPoint): ECPoint;
    toString(): string;
    twice(): ECPoint;
    private static windowNaf(width, k);
}
