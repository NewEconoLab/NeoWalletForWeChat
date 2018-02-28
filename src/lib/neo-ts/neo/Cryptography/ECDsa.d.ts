import { ECCurve } from './ECCurve';
import { ECDsaCryptoKey } from './CryptoKey';
export declare class ECDsa {
    private key;
    constructor(key: ECDsaCryptoKey);
    private static calculateE(n, message);
    static generateKey(curve: ECCurve): {
        privateKey: ECDsaCryptoKey;
        publicKey: ECDsaCryptoKey;
    };
    sign(message: ArrayBuffer | ArrayBufferView, randomStr: string): ArrayBuffer;
    private static sumOfTwoMultiplies(P, k, Q, l);
    verify(message: ArrayBuffer | ArrayBufferView, signature: ArrayBuffer | ArrayBufferView): boolean;
}
