export class CryptoKey {
    constructor(type, extractable, algorithm, usages) {
        this.type = type;
        this.extractable = extractable;
        this.algorithm = algorithm;
        this.usages = usages;
    }
}
export class AesCryptoKey extends CryptoKey {
    constructor(_key_bytes) {
        super("secret", true, { name: "AES-CBC", length: _key_bytes.length * 8 }, ["encrypt", "decrypt"]);
        this._key_bytes = _key_bytes;
    }
    static create(length) {
        if (length != 128 && length != 192 && length != 256)
            throw new RangeError();
        let key = new AesCryptoKey(new Uint8Array(length / 8));
        crypto.getRandomValues(key._key_bytes);
        return key;
    }
    export() {
        return this._key_bytes;
    }
    static import(keyData) {
        if (keyData.byteLength != 16 && keyData.byteLength != 24 && keyData.byteLength != 32)
            throw new RangeError();
        return new AesCryptoKey(Uint8Array.fromArrayBuffer(keyData));
    }
}
export class ECDsaCryptoKey extends CryptoKey {
    constructor(publicKey, privateKey) {
        super(privateKey == null ? "public" : "private", true, { name: "ECDSA", namedCurve: "P-256" }, [privateKey == null ? "verify" : "sign"]);
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }
}
//# sourceMappingURL=CryptoKey.js.map