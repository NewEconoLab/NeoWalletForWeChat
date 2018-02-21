import { ECPoint } from './ECPoint';
export declare class CryptoKey {
    type: string;
    extractable: boolean;
    algorithm: Algorithm;
    usages: string[];
    constructor(type: string, extractable: boolean, algorithm: Algorithm, usages: string[]);
}
export declare class AesCryptoKey extends CryptoKey {
    private _key_bytes;
    constructor(_key_bytes: Uint8Array);
    static create(length: number): AesCryptoKey;
    export(): Uint8Array;
    static import(keyData: ArrayBuffer | ArrayBufferView): AesCryptoKey;
}
export declare class ECDsaCryptoKey extends CryptoKey {
    publicKey: ECPoint;
    privateKey: Uint8Array;
    constructor(publicKey: ECPoint, privateKey?: Uint8Array);
}
