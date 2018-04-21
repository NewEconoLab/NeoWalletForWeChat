import { ECFieldElement } from './ECFieldElement';
import { ECPoint } from './ECPoint';
import { BigInteger } from '../BigInteger';
export declare class ECCurve {
    Q: BigInteger;
    A: ECFieldElement;
    B: ECFieldElement;
    N: BigInteger;
    Infinity: ECPoint;
    G: ECPoint;
    static readonly secp256k1: ECCurve;
    static readonly secp256r1: ECCurve;
    constructor(Q: BigInteger, A: BigInteger, B: BigInteger, N: BigInteger, G: Uint8Array);
}
