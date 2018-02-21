export declare class Aes {
    private static numberOfRounds;
    private static rcon;
    private static S;
    private static Si;
    private static T1;
    private static T2;
    private static T3;
    private static T4;
    private static T5;
    private static T6;
    private static T7;
    private static T8;
    private static U1;
    private static U2;
    private static U3;
    private static U4;
    private _Ke;
    private _Kd;
    private _lastCipherblock;
    readonly mode: string;
    constructor(key: ArrayBuffer | ArrayBufferView, iv: ArrayBuffer | ArrayBufferView);
    private static convertToInt32(bytes);
    decrypt(ciphertext: ArrayBuffer | ArrayBufferView): ArrayBuffer;
    decryptBlock(ciphertext: Uint8Array, plaintext: Uint8Array): void;
    encrypt(plaintext: ArrayBuffer | ArrayBufferView): ArrayBuffer;
    encryptBlock(plaintext: Uint8Array, ciphertext: Uint8Array): void;
}
