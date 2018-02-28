export declare class Helper {
    static GetPrivateKeyFromWIF(wif: string): Uint8Array;
    static GetWifFromPrivateKey(prikey: Uint8Array): string;
    static GetPublicKeyFromPrivateKey(privateKey: Uint8Array): Uint8Array;
    static Hash160(data: Uint8Array): Uint8Array;
    static GetAddressCheckScriptFromPublicKey(publicKey: Uint8Array): Uint8Array;
    static GetPublicKeyScriptHashFromPublicKey(publicKey: Uint8Array): Uint8Array;
    static GetScriptHashFromScript(script: Uint8Array): Uint8Array;
    static GetAddressFromScriptHash(scripthash: Uint8Array): string;
    static GetAddressFromPublicKey(publicKey: Uint8Array): string;
    static GetPublicKeyScriptHash_FromAddress(address: string): Uint8Array;
    static Sign(message: Uint8Array, privateKey: Uint8Array, randomStr: string): Uint8Array;
    static VerifySignature(message: Uint8Array, signature: Uint8Array, pubkey: Uint8Array): boolean;
    static String2Bytes(str: any): Uint8Array;
    static Bytes2String(_arr: Uint8Array): string;
    static Aes256Encrypt(src: string, key: string): string;
    static Aes256Encrypt_u8(src: Uint8Array, key: Uint8Array): Uint8Array;
    static Aes256Decrypt_u8(encryptedkey: Uint8Array, key: Uint8Array): Uint8Array;
    static GetNep2FromPrivateKey(prikey: Uint8Array, passphrase: string, n: number, r: number, p: number, callback: (info: string, result: string) => void): void;
    static GetPrivateKeyFromNep2(nep2: string, passphrase: string, n: number, r: number, p: number, callback: (info: string, result: string | Uint8Array) => void): void;
}
