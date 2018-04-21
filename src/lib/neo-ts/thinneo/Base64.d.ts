export declare class Base64 {
    static lookup: any[];
    static revLookup: any[];
    static code: string;
    static binited: boolean;
    static init(): void;
    static placeHoldersCount(b64: string): number;
    static byteLength(b64: string): number;
    static toByteArray(b64: string): Uint8Array;
    static tripletToBase64(num: any): any;
    static encodeChunk(uint8: any, start: any, end: any): string;
    static fromByteArray(uint8: Uint8Array): string;
}
