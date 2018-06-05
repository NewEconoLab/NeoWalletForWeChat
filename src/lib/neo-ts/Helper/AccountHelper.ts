import { Base64 } from '../thinneo/Base64'
import { Base58 } from '../neo/Cryptography/Base58'
import { Sha256 } from '../neo/Cryptography/Sha256'
import { ECPoint } from '../neo/Cryptography/ECPoint'
import { ECCurve } from '../neo/Cryptography/ECCurve'
import { RIPEMD160 } from '../neo/Cryptography/RIPEMD160'
import * as  CryptoKey from '../neo/Cryptography/CryptoKey'
import { ECDsa } from '../neo/Cryptography/ECDsa'
import * as UintHelper from './UintHelper'
import { SHA256, AES, enc, mode, pad } from 'crypto-js'
import * as scrypt from 'scrypt-async'
import * as StringHelper from './StringHelper'
// export declare var scrypt: any;
// export declare var CryptoJS: any;
var scrypt_loaded: boolean = false;
export class Account {
    public static GetPrivateKeyFromWIF(wif: string): Uint8Array {
        if (wif == null) throw new Error("null wif");
        var data = Base58.decode(wif);
        //检查标志位
        if (data.length != 38 || data[0] != 0x80 || data[33] != 0x01)
            throw new Error("wif length or tag is error");
        //取出检验字节
        var sum = data.subarray(data.length - 4, data.length);
        var realdata = data.subarray(0, data.length - 4);

        //验证,对前34字节进行进行两次hash取前4个字节
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

    public static GetWifFromPrivateKey(prikey: Uint8Array): string {
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
    public static GetPublicKeyFromPrivateKey(privateKey: Uint8Array): Uint8Array {

        var pkey = ECPoint.multiply(ECCurve.secp256r1.G, privateKey);
        return pkey.encodePoint(true);
    }
    public static Hash160(data: Uint8Array): Uint8Array {
        var hash1 = Sha256.computeHash(data);
        var hash2 = RIPEMD160.computeHash(hash1);
        return new Uint8Array(hash2);
    }
    public static GetAddressCheckScriptFromPublicKey(publicKey: Uint8Array): Uint8Array {
        var script = new Uint8Array(publicKey.length + 2);
        script[0] = publicKey.length;
        for (var i = 0; i < publicKey.length; i++) {
            script[i + 1] = publicKey[i];
        };
        script[script.length - 1] = 172;//CHECKSIG
        return script;
    }
    public static GetPublicKeyScriptHashFromPublicKey(publicKey: Uint8Array): Uint8Array {
        var script = Account.GetAddressCheckScriptFromPublicKey(publicKey);
        var scripthash = Sha256.computeHash(script);
        scripthash = RIPEMD160.computeHash(scripthash);
        return new Uint8Array(scripthash);
    }
    public static GetScriptHashFromScript(script: Uint8Array): Uint8Array {
        var scripthash = Sha256.computeHash(script);
        scripthash = RIPEMD160.computeHash(scripthash);
        return new Uint8Array(scripthash);

    }

    public static GetAddressFromScriptHash(scripthash: Uint8Array): string {
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
    public static GetAddressFromPublicKey(publicKey: Uint8Array): string {
        var scripthash = Account.GetPublicKeyScriptHashFromPublicKey(publicKey);
        return Account.GetAddressFromScriptHash(scripthash);
    }
    public static GetPublicKeyScriptHash_FromAddress(address: string): Uint8Array {
        var array: Uint8Array = Base58.decode(address);

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


    public static Sign(message: Uint8Array, privateKey: Uint8Array, randomStr: string): Uint8Array {

        //计算公钥
        var PublicKey = ECPoint.multiply(ECCurve.secp256r1.G, privateKey);
        var pubkey = PublicKey.encodePoint(false).subarray(1, 64);
        //获取CryptoKey
        var key = new CryptoKey.ECDsaCryptoKey(PublicKey, privateKey);
        var ecdsa = new ECDsa(key);
        {
            //签名
            return new Uint8Array(ecdsa.sign(message, randomStr));
        }
    }
    public static VerifySignature(message: Uint8Array, signature: Uint8Array, pubkey: Uint8Array) {
        var PublicKey = ECPoint.decodePoint(pubkey, ECCurve.secp256r1);
        var usepk = PublicKey.encodePoint(false).subarray(1, 64);
        var key = new CryptoKey.ECDsaCryptoKey(PublicKey);
        var ecdsa = new ECDsa(key);
        {
            return ecdsa.verify(message, signature);
        }
    }

    public static String2Bytes(str): Uint8Array {
        var back = [];
        var byteSize = 0;
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            if (0x00 <= code && code <= 0x7f) {
                byteSize += 1;
                back.push(code);
            } else if (0x80 <= code && code <= 0x7ff) {
                byteSize += 2;
                back.push((192 | (31 & (code >> 6))));
                back.push((128 | (63 & code)))
            } else if ((0x800 <= code && code <= 0xd7ff)
                || (0xe000 <= code && code <= 0xffff)) {
                byteSize += 3;
                back.push((224 | (15 & (code >> 12))));
                back.push((128 | (63 & (code >> 6))));
                back.push((128 | (63 & code)))
            }
        }
        var uarr = new Uint8Array(back.length);
        for (i = 0; i < back.length; i++) {
            uarr[i] = back[i] & 0xff;
        }
        return uarr;
    }
    public static Bytes2String(_arr: Uint8Array) {

        var UTF = '';
        for (var i = 0; i < _arr.length; i++) {
            var one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
            if (v && one.length == 8) {
                var bytesLength = v[0].length;
                var store = _arr[i].toString(2).slice(7 - bytesLength);
                for (var st = 1; st < bytesLength; st++) {
                    store += _arr[st + i].toString(2).slice(2)
                }
                UTF += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1
            } else {
                UTF += String.fromCharCode(_arr[i])
            }
        }
        return UTF;
    }
    public static Aes256Encrypt(src: string, key: string): string {
        var srcs = enc.Utf8.parse(src);
        var keys = enc.Utf8.parse(key);
        var encryptedkey = AES.encrypt(srcs, keys, {
            mode: mode.ECB,
            padding: pad.NoPadding
        });
        return encryptedkey.ciphertext.toString();
    }
    public static Aes256Encrypt_u8(src: Uint8Array, key: Uint8Array): Uint8Array {
        var srcs = enc.Utf8.parse("1234123412341234");
        srcs.sigBytes = src.length;
        srcs.words = new Array<number>(src.length / 4);
        for (var i = 0; i < src.length / 4; i++) {
            srcs.words[i] = src[i * 4 + 3] + src[i * 4 + 2] * 256 + src[i * 4 + 1] * 256 * 256 + src[i * 4 + 0] * 256 * 256 * 256;
        }

        var keys = enc.Utf8.parse("1234123412341234");
        keys.sigBytes = key.length;
        keys.words = new Array<number>(key.length / 4);
        for (var i = 0; i < key.length / 4; i++) {
            keys.words[i] = key[i * 4 + 3] + key[i * 4 + 2] * 256 + key[i * 4 + 1] * 256 * 256 + key[i * 4 + 0] * 256 * 256 * 256;
        }

        var encryptedkey = AES.encrypt(srcs, keys, {
            mode: mode.ECB,
            padding: pad.NoPadding
        });
        var str: string = encryptedkey.ciphertext.toString();
        return UintHelper.hexToBytes(str);
    }
    public static Aes256Decrypt_u8(encryptedkey: Uint8Array, key: Uint8Array): Uint8Array {


        var keys = enc.Utf8.parse("1234123412341234");
        keys.sigBytes = key.length;
        keys.words = new Array<number>(key.length / 4);
        for (var i = 0; i < key.length / 4; i++) {
            keys.words[i] = key[i * 4 + 3] + key[i * 4 + 2] * 256 + key[i * 4 + 1] * 256 * 256 + key[i * 4 + 0] * 256 * 256 * 256;
        }

        var base64key = Base64.fromByteArray(encryptedkey);
        var srcs = AES.decrypt(base64key, keys, {
            mode: mode.ECB,
            padding: pad.NoPadding
        });
        var str: string = srcs.toString();
        return UintHelper.hexToBytes(str);
    }

    /**
     * get nep2 key
     * @param prikey  
     * @param passphrase 
     * @param n 
     * @param r 
     * @param p 
     * @param callback 
     */
    public static GetNep2FromPrivateKey(prikey: Uint8Array, passphrase: string, n = 16384, r = 8, p = 8, callback: (info: string, result: string) => void): void {
        let that = this
        var pubkey = Account.GetPublicKeyFromPrivateKey(prikey);
        let addr = Account.GetAddressFromPublicKey(pubkey);
        var addresshash = Account.GetAddrHash(addr);

        scrypt(passphrase, addresshash, {
            logN: 14,
            r: r,
            p: p,
            dkLen: 64,
            encoding: 'hex'
        },
            function (res: string) {
                var u8dk = UintHelper.hexToBytes(res);
                var derivedhalf1 = u8dk.subarray(0, 32);
                var derivedhalf2 = u8dk.subarray(32, 64);
                var u8xor = new Uint8Array(32);
                for (var i = 0; i < 32; i++) {
                    u8xor[i] = prikey[i] ^ derivedhalf1[i];
                }
                var encryptedkey = Account.Aes256Encrypt_u8(u8xor, derivedhalf2);
                let buffer = new Uint8Array(39);
                buffer[0] = 0x01;
                buffer[1] = 0x42;
                buffer[2] = 0xe0;

                for (var i = 3; i < 3 + 4; i++) {
                    buffer[i] = addresshash[i - 3];
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
    public static GetPrivateKeyFromNep2(nep2: string, passphrase: string, n = 16384, r = 8, p = 8, callback: (info: string, result: string | Uint8Array) => void) {
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
        scrypt(passphrase, addresshash, {
            logN: 14,
            r: r,
            p: p,
            dkLen: 64,
            encoding: 'hex'
        },
            function (res: string) {

                var u8dk = UintHelper.hexToBytes(res) //new Uint8Array(res);
                var derivedhalf1 = u8dk.subarray(0, 32);
                var derivedhalf2 = u8dk.subarray(32, 64);
                var u8xor = Account.Aes256Decrypt_u8(encryptedkey, derivedhalf2);
                var prikey = new Uint8Array(u8xor.length);
                for (var i = 0; i < 32; i++) {
                    prikey[i] = u8xor[i] ^ derivedhalf1[i];
                }
                var pubkey = Account.GetPublicKeyFromPrivateKey(prikey);
                var address = Account.GetAddressFromPublicKey(pubkey);
                var addresshashgot = Account.GetAddrHash(address);
                for (var i = 0; i < 4; i++) {
                    if (addresshash[i] != addresshashgot[i]) {
                        callback("error", "nep2 hash not match.");
                        return;
                    }
                }
                callback("finish", prikey);
            });
        
    }

    public static GetAddrHash(addr: string): any {
        var buffer =  Account.String2Bytes(addr);
        let strkey = Sha256.computeHash(buffer);
        strkey = Sha256.computeHash(strkey);
        var addresshash = new Uint8Array(strkey);
        return addresshash.subarray(0, 4);
    }
}