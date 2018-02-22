import { ECCurve } from './ECCurve';
import { BigInteger } from '../BigInteger';
export declare class ECFieldElement {
    value: BigInteger;
    private curve;
    constructor(value: BigInteger, curve: ECCurve);
    add(other: ECFieldElement): ECFieldElement;
    compareTo(other: ECFieldElement): number;
    divide(other: ECFieldElement): ECFieldElement;
    equals(other: ECFieldElement): boolean;
    private static fastLucasSequence(p, P, Q, k);
    multiply(other: ECFieldElement): ECFieldElement;
    negate(): ECFieldElement;
    sqrt(): ECFieldElement;
    square(): ECFieldElement;
    subtract(other: ECFieldElement): ECFieldElement;
}
