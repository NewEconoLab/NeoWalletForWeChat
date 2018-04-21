export declare class Base58 {
    static Alphabet: string;
    static decode(input: string): Uint8Array;
    static encode(input: Uint8Array): string;
}
