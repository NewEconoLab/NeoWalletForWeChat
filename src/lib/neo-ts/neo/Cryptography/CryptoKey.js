"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var CryptoKey = /** @class */ (function () {
    function CryptoKey(type, extractable, algorithm, usages) {
        this.type = type;
        this.extractable = extractable;
        this.algorithm = algorithm;
        this.usages = usages;
    }
    return CryptoKey;
}());
exports.CryptoKey = CryptoKey;
var AesCryptoKey = /** @class */ (function (_super) {
    __extends(AesCryptoKey, _super);
    function AesCryptoKey(_key_bytes) {
        var _this = _super.call(this, "secret", true, { name: "AES-CBC", length: _key_bytes.length * 8 }, ["encrypt", "decrypt"]) || this;
        _this._key_bytes = _key_bytes;
        return _this;
    }
    AesCryptoKey.create = function (length) {
        if (length != 128 && length != 192 && length != 256)
            throw new RangeError();
        var key = new AesCryptoKey(new Uint8Array(length / 8));
        crypto.getRandomValues(key._key_bytes);
        return key;
    };
    AesCryptoKey.prototype["export"] = function () {
        return this._key_bytes;
    };
    AesCryptoKey["import"] = function (keyData) {
        if (keyData.byteLength != 16 && keyData.byteLength != 24 && keyData.byteLength != 32)
            throw new RangeError();
        return new AesCryptoKey(Uint8Array.fromArrayBuffer(keyData));
    };
    return AesCryptoKey;
}(CryptoKey));
exports.AesCryptoKey = AesCryptoKey;
var ECDsaCryptoKey = /** @class */ (function (_super) {
    __extends(ECDsaCryptoKey, _super);
    function ECDsaCryptoKey(publicKey, privateKey) {
        var _this = _super.call(this, privateKey == null ? "public" : "private", true, { name: "ECDSA", namedCurve: "P-256" }, [privateKey == null ? "verify" : "sign"]) || this;
        _this.publicKey = publicKey;
        _this.privateKey = privateKey;
        return _this;
    }
    return ECDsaCryptoKey;
}(CryptoKey));
exports.ECDsaCryptoKey = ECDsaCryptoKey;
