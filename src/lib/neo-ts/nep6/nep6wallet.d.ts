export declare class nep6account {
    address: string;
    key: string;
    name: string;
    getPrivateKey(scrypt: nep6ScryptParameters, password: string, callback: (info: string, result: string | Uint8Array) => void): void;
}
export declare class nep6ScryptParameters {
    N: number;
    r: number;
    p: number;
}
export declare class nep6wallet {
    scrypt: nep6ScryptParameters;
    accounts: nep6account[];
    fromJsonStr(jsonstr: string): void;
    toJson(): any;
}
