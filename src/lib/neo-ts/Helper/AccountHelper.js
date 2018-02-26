import { Base64 } from '../thinneo/Base64';
import { Base58 } from '../neo/Cryptography/Base58';
import { Sha256 } from '../neo/Cryptography/Sha256';
import { ECPoint } from '../neo/Cryptography/ECPoint';
import { ECCurve } from '../neo/Cryptography/ECCurve';
import { RIPEMD160 } from '../neo/Cryptography/RIPEMD160';
import * as CryptoKey from '../neo/Cryptography/CryptoKey';
import { ECDsa } from '../neo/Cryptography/ECDsa';
import * as UintHelper from './UintHelper';
import { SHA256, AES, enc, mode, pad } from 'crypto-js';
import * as scrypt from 'scrypt-async';
var scrypt_loaded = false;
export class Helper {
    static GetPrivateKeyFromWIF(wif) {
        if (wif == null)
            throw new Error("null wif");
        var data = Base58.decode(wif);
        if (data.length != 38 || data[0] != 0x80 || data[33] != 0x01)
            throw new Error("wif length or tag is error");
        var sum = data.subarray(data.length - 4, data.length);
        var realdata = data.subarray(0, data.length - 4);
        var _checksum = Sha256.computeHash(realdata);
        var checksum = new Uint8Array(Sha256.computeHash(_checksum));
        var sumcalc = checksum.subarray(0, 4);
        for (var i = 0; i < 4; i++) {
            if (sum[i] != sumcalc[i])
                throw new Error("the sum is not match.");
        }
        var privateKey = data.subarray(1, 1 + 32);
        return privateKey;
    }
    static GetWifFromPrivateKey(prikey) {
        var data = new Uint8Array(38);
        data[0] = 0x80;
        data[33] = 0x01;
        for (var i = 0; i < 32; i++) {
            data[i + 1] = prikey[i];
        }
        var realdata = data.subarray(0, data.length - 4);
        var _checksum = Sha256.computeHash(realdata);
        var checksum = new Uint8Array(Sha256.computeHash(_checksum));
        for (var i = 0; i < 4; i++) {
            data[34 + i] = checksum[i];
        }
        var wif = Base58.encode(data);
        return wif;
    }
    static GetPublicKeyFromPrivateKey(privateKey) {
        var pkey = ECPoint.multiply(ECCurve.secp256r1.G, privateKey);
        return pkey.encodePoint(true);
    }
    static Hash160(data) {
        var hash1 = Sha256.computeHash(data);
        var hash2 = RIPEMD160.computeHash(hash1);
        return new Uint8Array(hash2);
    }
    static GetAddressCheckScriptFromPublicKey(publicKey) {
        var script = new Uint8Array(publicKey.length + 2);
        script[0] = publicKey.length;
        for (var i = 0; i < publicKey.length; i++) {
            script[i + 1] = publicKey[i];
        }
        ;
        script[script.length - 1] = 172;
        return script;
    }
    static GetPublicKeyScriptHashFromPublicKey(publicKey) {
        var script = Helper.GetAddressCheckScriptFromPublicKey(publicKey);
        var scripthash = Sha256.computeHash(script);
        scripthash = RIPEMD160.computeHash(scripthash);
        return new Uint8Array(scripthash);
    }
    static GetScriptHashFromScript(script) {
        var scripthash = Sha256.computeHash(script);
        scripthash = RIPEMD160.computeHash(scripthash);
        return new Uint8Array(scripthash);
    }
    static GetAddressFromScriptHash(scripthash) {
        var data = new Uint8Array(scripthash.length + 1);
        data[0] = 0x17;
        for (var i = 0; i < scripthash.length; i++) {
            data[i + 1] = scripthash[i];
        }
        var hash = Sha256.computeHash(data);
        hash = Sha256.computeHash(hash);
        var hashu8 = new Uint8Array(hash, 0, 4);
        var alldata = new Uint8Array(data.length + 4);
        for (var i = 0; i < data.length; i++) {
            alldata[i] = data[i];
        }
        for (var i = 0; i < 4; i++) {
            alldata[data.length + i] = hashu8[i];
        }
        return Base58.encode(alldata);
    }
    static GetAddressFromPublicKey(publicKey) {
        var scripthash = Helper.GetPublicKeyScriptHashFromPublicKey(publicKey);
        return Helper.GetAddressFromScriptHash(scripthash);
    }
    static GetPublicKeyScriptHash_FromAddress(address) {
        var array = Base58.decode(address);
        var salt = array.subarray(0, 1);
        var hash = array.subarray(1, 1 + 20);
        var check = array.subarray(21, 21 + 4);
        var checkdata = array.subarray(0, 21);
        var hashd = Sha256.computeHash(checkdata);
        hashd = Sha256.computeHash(hashd);
        var hashd = hashd.slice(0, 4);
        var checked = new Uint8Array(hashd);
        for (var i = 0; i < 4; i++) {
            if (checked[i] != check[i]) {
                throw new Error("the sum is not match.");
            }
        }
        return UintHelper.clone(hash);
    }
    static Sign(message, privateKey) {
        var PublicKey = ECPoint.multiply(ECCurve.secp256r1.G, privateKey);
        var pubkey = PublicKey.encodePoint(false).subarray(1, 64);
        var key = new CryptoKey.ECDsaCryptoKey(PublicKey, privateKey);
        var ecdsa = new ECDsa(key);
        {
            return new Uint8Array(ecdsa.sign(message));
        }
    }
    static VerifySignature(message, signature, pubkey) {
        var PublicKey = ECPoint.decodePoint(pubkey, ECCurve.secp256r1);
        var usepk = PublicKey.encodePoint(false).subarray(1, 64);
        var key = new CryptoKey.ECDsaCryptoKey(PublicKey);
        var ecdsa = new ECDsa(key);
        {
            return ecdsa.verify(message, signature);
        }
    }
    static String2Bytes(str) {
        var back = [];
        var byteSize = 0;
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            if (0x00 <= code && code <= 0x7f) {
                byteSize += 1;
                back.push(code);
            }
            else if (0x80 <= code && code <= 0x7ff) {
                byteSize += 2;
                back.push((192 | (31 & (code >> 6))));
                back.push((128 | (63 & code)));
            }
            else if ((0x800 <= code && code <= 0xd7ff)
                || (0xe000 <= code && code <= 0xffff)) {
                byteSize += 3;
                back.push((224 | (15 & (code >> 12))));
                back.push((128 | (63 & (code >> 6))));
                back.push((128 | (63 & code)));
            }
        }
        var uarr = new Uint8Array(back.length);
        for (i = 0; i < back.length; i++) {
            uarr[i] = back[i] & 0xff;
        }
        return uarr;
    }
    static Bytes2String(_arr) {
        var UTF = '';
        for (var i = 0; i < _arr.length; i++) {
            var one = _arr[i].toString(2), v = one.match(/^1+?(?=0)/);
            if (v && one.length == 8) {
                var bytesLength = v[0].length;
                var store = _arr[i].toString(2).slice(7 - bytesLength);
                for (var st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2);
                }
                UTF += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1;
            }
            else {
                UTF += String.fromCharCode(_arr[i]);
            }
        }
        return UTF;
    }
    static Aes256Encrypt(src, key) {
        var srcs = enc.Utf8.parse(src);
        var keys = enc.Utf8.parse(key);
        var encryptedkey = AES.encrypt(srcs, keys, {
            mode: mode.ECB,
            padding: pad.NoPadding
        });
        return encryptedkey.ciphertext.toString();
    }
    static Aes256Encrypt_u8(src, key) {
        var srcs = enc.Utf8.parse("1234123412341234");
        srcs.sigBytes = src.length;
        srcs.words = new Array(src.length / 4);
        for (var i = 0; i < src.length / 4; i++) {
            srcs.words[i] = src[i * 4 + 3] + src[i * 4 + 2] * 256 + src[i * 4 + 1] * 256 * 256 + src[i * 4 + 0] * 256 * 256 * 256;
        }
        var keys = enc.Utf8.parse("1234123412341234");
        keys.sigBytes = key.length;
        keys.words = new Array(key.length / 4);
        for (var i = 0; i < key.length / 4; i++) {
            keys.words[i] = key[i * 4 + 3] + key[i * 4 + 2] * 256 + key[i * 4 + 1] * 256 * 256 + key[i * 4 + 0] * 256 * 256 * 256;
        }
        var encryptedkey = AES.encrypt(srcs, keys, {
            mode: mode.ECB,
            padding: pad.NoPadding
        });
        var str = encryptedkey.ciphertext.toString();
        return UintHelper.hexToBytes(str);
    }
    static Aes256Decrypt_u8(encryptedkey, key) {
        var keys = enc.Utf8.parse("1234123412341234");
        keys.sigBytes = key.length;
        keys.words = new Array(key.length / 4);
        for (var i = 0; i < key.length / 4; i++) {
            keys.words[i] = key[i * 4 + 3] + key[i * 4 + 2] * 256 + key[i * 4 + 1] * 256 * 256 + key[i * 4 + 0] * 256 * 256 * 256;
        }
        var base64key = Base64.fromByteArray(encryptedkey);
        var srcs = AES.decrypt(base64key, keys, {
            mode: mode.ECB,
            padding: pad.NoPadding
        });
        var str = srcs.toString();
        return UintHelper.hexToBytes(str);
    }
    static GetNep2FromPrivateKey(prikey, passphrase, n = 16384, r = 8, p = 8, callback) {
        let that = this;
        var pubkey = Helper.GetPublicKeyFromPrivateKey(prikey);
        let addr = Helper.GetAddressFromPublicKey(pubkey);
        const strkey = SHA256(SHA256(addr).toString()).toString().slice(0, 4);
        let uint8pass = this.String2Bytes(passphrase);
        console.log('strkey = ' + prikey);
        scrypt.default(uint8pass, strkey, {
            logN: 5,
            r: r,
            p: p,
            dkLen: 64,
            interruptStep: 1000,
            encoding: 'hash'
        }, function (res) {
            var u8dk = new Uint8Array(res);
            var derivedhalf1 = u8dk.subarray(0, 32);
            var derivedhalf2 = u8dk.subarray(32, 64);
            var u8xor = new Uint8Array(32);
            for (var i = 0; i < 32; i++) {
                u8xor[i] = prikey[i] ^ derivedhalf1[i];
            }
            var encryptedkey = Helper.Aes256Encrypt_u8(u8xor, derivedhalf2);
            let buffer = new Uint8Array(39);
            buffer[0] = 0x01;
            buffer[1] = 0x42;
            buffer[2] = 0xe0;
            let u8addr = that.String2Bytes(strkey);
            for (var i = 3; i < 3 + 4; i++) {
                buffer[i] = u8addr[i - 3];
            }
            for (var i = 7; i < 32 + 7; i++) {
                buffer[i] = encryptedkey[i - 7];
            }
            var b1 = Sha256.computeHash(buffer);
            b1 = Sha256.computeHash(b1);
            var u8hash = new Uint8Array(b1);
            var outbuf = new Uint8Array(39 + 4);
            for (var i = 0; i < 39; i++) {
                outbuf[i] = buffer[i];
            }
            for (var i = 39; i < 39 + 4; i++) {
                outbuf[i] = u8hash[i - 39];
            }
            var base58str = Base58.encode(outbuf);
            callback("finish", base58str);
        });
        return;
    }
    static GetPrivateKeyFromNep2(nep2, passphrase, n = 16384, r = 8, p = 8, callback) {
        let that = this;
        let data = Base58.decode(nep2);
        if (data.length != 39 + 4) {
            callback("error", "data.length error");
            return;
        }
        if (data[0] != 0x01 || data[1] != 0x42 || data[2] != 0xe0) {
            callback("error", "dataheader error");
            return;
        }
        var hash = data.subarray(39, 39 + 4);
        var buffer = data.subarray(0, 39);
        var b1 = Sha256.computeHash(buffer);
        b1 = Sha256.computeHash(b1);
        var u8hash = new Uint8Array(b1);
        for (var i = 0; i < 4; i++) {
            if (u8hash[i] != hash[i]) {
                callback("error", "data hash error");
                return;
            }
        }
        var addresshash = buffer.subarray(3, 3 + 4);
        var encryptedkey = buffer.subarray(7, 7 + 32);
        let uint8pass = this.String2Bytes(passphrase);
        let strkey = this.Bytes2String(addresshash);
        scrypt.default(uint8pass, strkey, {
            logN: 5,
            r: r,
            p: p,
            dkLen: 64,
            interruptStep: 1000,
            encoding: 'hash'
        }, function (res) {
            var u8dk = new Uint8Array(res);
            var derivedhalf1 = u8dk.subarray(0, 32);
            var derivedhalf2 = u8dk.subarray(32, 64);
            var u8xor = Helper.Aes256Decrypt_u8(encryptedkey, derivedhalf2);
            var prikey = new Uint8Array(u8xor.length);
            for (var i = 0; i < 32; i++) {
                prikey[i] = u8xor[i] ^ derivedhalf1[i];
            }
            var pubkey = Helper.GetPublicKeyFromPrivateKey(prikey);
            var script_hash = Helper.GetPublicKeyScriptHashFromPublicKey(pubkey);
            var address = Helper.GetAddressFromScriptHash(script_hash);
            const addrhash = SHA256(SHA256(address).toString()).toString().slice(0, 4);
            var b2 = new Uint8Array(b1);
            var addresshashgot = that.String2Bytes(addrhash);
            for (var i = 0; i < 4; i++) {
                if (addresshash[i] != addresshashgot[i]) {
                    callback("error", "nep2 hash not match.");
                    return;
                }
            }
            callback("finish", prikey);
        });
    }
}
//# sourceMappingURL=AccountHelper.js.map