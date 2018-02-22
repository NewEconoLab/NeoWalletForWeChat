import { ECCurve } from '../neo/Cryptography/ECCurve';
import { NeoPromise } from '../neo/Promise';
import { RIPEMD160 } from '../neo/Cryptography/RIPEMD160';
import { ECDsaCryptoKey } from '../neo/Cryptography/CryptoKey';
import { ECDsa } from '../neo/Cryptography/ECDsa';
import { ECPoint } from '../neo/Cryptography/ECPoint';
import * as BaseHelper from './Base64Helper';
import * as ArrayHelper from './Arrayhelper';
export function fromArrayBuffer(buffer) {
    if (buffer instanceof Uint8Array)
        return buffer;
    else if (buffer instanceof ArrayBuffer)
        return new Uint8Array(buffer);
    else {
        let view = buffer;
        return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }
}
export function hexToBytes(str) {
    if ((str.length & 1) != 0)
        throw new RangeError();
    var temp = str;
    if (str.length >= 2 && str[0] == '0' && str[1] == 'x')
        temp = str.substr(2);
    let bytes = new Uint8Array(temp.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(temp.substr(i * 2, 2), 16);
    }
    return bytes;
}
export function clone(uintarr) {
    var u8 = new Uint8Array(uintarr.length);
    for (let i = 0; i < uintarr.length; i++)
        u8[i] = uintarr[i];
    return u8;
}
let getAlgorithmName = (algorithm) => typeof algorithm === "string" ? algorithm : algorithm.name;
function hook_ripemd160() {
    let digest_old = crypto.subtle.digest;
    crypto.subtle.digest = (algorithm, data) => {
        if (getAlgorithmName(algorithm) != "RIPEMD-160")
            return digest_old.call(crypto.subtle, algorithm, data);
        return new NeoPromise((resolve, reject) => {
            try {
                resolve(RIPEMD160.computeHash(data));
            }
            catch (e) {
                reject(e);
            }
        });
    };
}
hook_ripemd160();
function hook_ecdsa() {
    let exportKey_old = crypto.subtle.exportKey;
    crypto.subtle.exportKey = (format, key) => {
        if (key.algorithm.name != "ECDSA")
            return exportKey_old.call(crypto.subtle, format, key);
        return new NeoPromise((resolve, reject) => {
            let k = key;
            if (format != "jwk" || k.algorithm.namedCurve != "P-256")
                reject(new RangeError());
            else
                try {
                    if (k.type == "private")
                        resolve({
                            crv: k.algorithm.namedCurve,
                            d: BaseHelper.base64UrlEncode(k.privateKey),
                            ext: true,
                            key_ops: k.usages,
                            kty: "EC",
                            x: BaseHelper.base64UrlEncode(k.publicKey.x.value.toUint8Array(false, 32)),
                            y: BaseHelper.base64UrlEncode(k.publicKey.y.value.toUint8Array(false, 32))
                        });
                    else
                        resolve({
                            crv: k.algorithm.namedCurve,
                            ext: true,
                            key_ops: k.usages,
                            kty: "EC",
                            x: BaseHelper.base64UrlEncode(k.publicKey.x.value.toUint8Array(false, 32)),
                            y: BaseHelper.base64UrlEncode(k.publicKey.y.value.toUint8Array(false, 32))
                        });
                }
                catch (e) {
                    reject(e);
                }
        });
    };
    let generateKey_old = crypto.subtle.generateKey;
    crypto.subtle.generateKey = (algorithm, extractable, keyUsages) => {
        if (getAlgorithmName(algorithm) != "ECDSA")
            return generateKey_old.call(crypto.subtle, algorithm, extractable, keyUsages);
        return new NeoPromise((resolve, reject) => {
            if (algorithm.namedCurve != "P-256")
                reject(new RangeError());
            else
                try {
                    resolve(ECDsa.generateKey(ECCurve.secp256r1));
                }
                catch (e) {
                    reject(e);
                }
        });
    };
    let importKey_old = crypto.subtle.importKey;
    crypto.subtle.importKey = (format, keyData, algorithm, extractable, keyUsages) => {
        if (getAlgorithmName(algorithm) != "ECDSA")
            return importKey_old.call(crypto.subtle, format, keyData, algorithm, extractable, keyUsages);
        return new NeoPromise((resolve, reject) => {
            if (format != "jwk" || algorithm.namedCurve != "P-256")
                reject(new RangeError());
            else
                try {
                    let k = keyData;
                    let x = k.x.base64UrlDecode();
                    let y = k.y.base64UrlDecode();
                    let arr = new Uint8Array(65);
                    arr[0] = 0x04;
                    ArrayHelper.copy(x, 0, arr, 1, 32);
                    ArrayHelper.copy(y, 0, arr, 33, 32);
                    let pubkey = ECPoint.decodePoint(arr, ECCurve.secp256r1);
                    if (k.d)
                        resolve(new ECDsaCryptoKey(pubkey, k.d.base64UrlDecode()));
                    else
                        resolve(new ECDsaCryptoKey(pubkey));
                }
                catch (e) {
                    reject(e);
                }
        });
    };
    let sign_old = crypto.subtle.sign;
    crypto.subtle.sign = (algorithm, key, data) => {
        if (getAlgorithmName(algorithm) != "ECDSA")
            return sign_old.call(crypto.subtle, algorithm, key, data);
        return new NeoPromise((resolve, reject) => {
            if (algorithm.hash.name != "SHA-256" || key.algorithm.name != "ECDSA")
                reject(new RangeError());
            else
                try {
                    let ecdsa = new ECDsa(key);
                    resolve(ecdsa.sign(data));
                }
                catch (e) {
                    reject(e);
                }
        });
    };
    let verify_old = crypto.subtle.verify;
    crypto.subtle.verify = (algorithm, key, signature, data) => {
        if (getAlgorithmName(algorithm) != "ECDSA")
            return verify_old.call(crypto.subtle, algorithm, key, signature, data);
        return new NeoPromise((resolve, reject) => {
            if (algorithm.hash.name != "SHA-256" || key.algorithm.name != "ECDSA")
                reject(new RangeError());
            else
                try {
                    let ecdsa = new ECDsa(key);
                    resolve(ecdsa.verify(data, signature));
                }
                catch (e) {
                    reject(e);
                }
        });
    };
}
try {
    crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"]).catch(hook_ecdsa);
}
catch (ex) {
    hook_ecdsa();
}
//# sourceMappingURL=UintHelper.js.map