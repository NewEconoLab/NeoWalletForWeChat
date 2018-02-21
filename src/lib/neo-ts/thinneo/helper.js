"use strict";
exports.__esModule = true;
var index_1 = require("../index");
var scrypt_loaded = false;
var Helper = /** @class */ (function () {
    function Helper() {
    }
    Helper.GetPrivateKeyFromWIF = function (wif) {
        if (wif == null)
            throw new Error("null wif");
        var data = index_1.Base58.decode(wif);
        //检查标志位
        if (data.length != 38 || data[0] != 0x80 || data[33] != 0x01)
            throw new Error("wif length or tag is error");
        //取出检验字节
        var sum = data.subarray(data.length - 4, data.length);
        var realdata = data.subarray(0, data.length - 4);
        //验证,对前34字节进行进行两次hash取前4个字节
        var _checksum = index_1.Sha256.computeHash(realdata);
        var checksum = new Uint8Array(index_1.Sha256.computeHash(_checksum));
        var sumcalc = checksum.subarray(0, 4);
        for (var i = 0; i < 4; i++) {
            if (sum[i] != sumcalc[i])
                throw new Error("the sum is not match.");
        }
        var privateKey = data.subarray(1, 1 + 32);
        return privateKey;
    };
    Helper.GetWifFromPrivateKey = function (prikey) {
        var data = new Uint8Array(38);
        data[0] = 0x80;
        data[33] = 0x01;
        for (var i = 0; i < 32; i++) {
            data[i + 1] = prikey[i];
        }
        var realdata = data.subarray(0, data.length - 4);
        var _checksum = index_1.Sha256.computeHash(realdata);
        var checksum = new Uint8Array(index_1.Sha256.computeHash(_checksum));
        for (var i = 0; i < 4; i++) {
            data[34 + i] = checksum[i];
        }
        var wif = index_1.Base58.encode(data);
        return wif;
    };
    Helper.GetPublicKeyFromPrivateKey = function (privateKey) {
        var pkey = index_1.ECPoint.multiply(index_1.ECCurve.secp256r1.G, privateKey);
        return pkey.encodePoint(true);
    };
    Helper.Hash160 = function (data) {
        var hash1 = index_1.Sha256.computeHash(data);
        var hash2 = index_1.RIPEMD160.computeHash(hash1);
        return new Uint8Array(hash2);
    };
    Helper.GetAddressCheckScriptFromPublicKey = function (publicKey) {
        var script = new Uint8Array(publicKey.length + 2);
        script[0] = publicKey.length;
        for (var i = 0; i < publicKey.length; i++) {
            script[i + 1] = publicKey[i];
        }
        ;
        script[script.length - 1] = 172; //CHECKSIG
        return script;
    };
    Helper.GetPublicKeyScriptHashFromPublicKey = function (publicKey) {
        var script = Helper.GetAddressCheckScriptFromPublicKey(publicKey);
        var scripthash = index_1.Sha256.computeHash(script);
        scripthash = index_1.RIPEMD160.computeHash(scripthash);
        return new Uint8Array(scripthash);
    };
    Helper.GetScriptHashFromScript = function (script) {
        var scripthash = index_1.Sha256.computeHash(script);
        scripthash = index_1.RIPEMD160.computeHash(scripthash);
        return new Uint8Array(scripthash);
    };
    Helper.GetAddressFromScriptHash = function (scripthash) {
        var data = new Uint8Array(scripthash.length + 1);
        data[0] = 0x17;
        for (var i = 0; i < scripthash.length; i++) {
            data[i + 1] = scripthash[i];
        }
        var hash = index_1.Sha256.computeHash(data);
        hash = index_1.Sha256.computeHash(hash);
        var hashu8 = new Uint8Array(hash, 0, 4);
        var alldata = new Uint8Array(data.length + 4);
        for (var i = 0; i < data.length; i++) {
            alldata[i] = data[i];
        }
        for (var i = 0; i < 4; i++) {
            alldata[data.length + i] = hashu8[i];
        }
        return index_1.Base58.encode(alldata);
    };
    Helper.GetAddressFromPublicKey = function (publicKey) {
        var scripthash = Helper.GetPublicKeyScriptHashFromPublicKey(publicKey);
        return Helper.GetAddressFromScriptHash(scripthash);
    };
    Helper.GetPublicKeyScriptHash_FromAddress = function (address) {
        var array = index_1.Base58.decode(address);
        var salt = array.subarray(0, 1);
        var hash = array.subarray(1, 1 + 20);
        var check = array.subarray(21, 21 + 4);
        var checkdata = array.subarray(0, 21);
        var hashd = index_1.Sha256.computeHash(checkdata);
        hashd = index_1.Sha256.computeHash(hashd);
        var hashd = hashd.slice(0, 4);
        var checked = new Uint8Array(hashd);
        for (var i = 0; i < 4; i++) {
            if (checked[i] != check[i]) {
                throw new Error("the sum is not match.");
            }
        }
        return hash.clone();
    };
    Helper.Sign = function (message, privateKey) {
        var PublicKey = index_1.ECPoint.multiply(index_1.ECCurve.secp256r1.G, privateKey);
        var pubkey = PublicKey.encodePoint(false).subarray(1, 64);
        //var PublicKey = Thin ECC.ECCurve.Secp256r1.G * prikey;
        //var pubkey = PublicKey.EncodePoint(false).Skip(1).ToArray();
        var key = new index_1.ECDsaCryptoKey(PublicKey, privateKey);
        var ecdsa = new index_1.ECDsa(key);
        ////using(var ecdsa = System.Security.Cryptography.ECDsa.Create(new System.Security.Cryptography.ECParameters
        //{
        //        Curve = System.Security.Cryptography.ECCurve.NamedCurves.nistP256,
        //        D = prikey,
        //        Q = new System.Security.Cryptography.ECPoint
        //    {
        //        X = pubkey.Take(32).ToArray(),
        //        Y = pubkey.Skip(32).ToArray()
        //    }
        //}))
        {
            //var hash =  Sha256.computeHash(message);
            return new Uint8Array(ecdsa.sign(message));
        }
    };
    Helper.VerifySignature = function (message, signature, pubkey) {
        var PublicKey = index_1.ECPoint.decodePoint(pubkey, index_1.ECCurve.secp256r1);
        var usepk = PublicKey.encodePoint(false).subarray(1, 64);
        var key = new index_1.ECDsaCryptoKey(PublicKey);
        var ecdsa = new index_1.ECDsa(key);
        //byte[] first = { 0x45, 0x43, 0x53, 0x31, 0x20, 0x00, 0x00, 0x00 };
        //usepk = first.Concat(usepk).ToArray();
        //using (System.Security.Cryptography.CngKey key = System.Security.Cryptography.CngKey.Import(usepk, System.Security.Cryptography.CngKeyBlobFormat.EccPublicBlob))
        //using (System.Security.Cryptography.ECDsaCng ecdsa = new System.Security.Cryptography.ECDsaCng(key))
        //using(var ecdsa = System.Security.Cryptography.ECDsa.Create(new System.Security.Cryptography.ECParameters
        //{
        //        Curve = System.Security.Cryptography.ECCurve.NamedCurves.nistP256,
        //        Q = new System.Security.Cryptography.ECPoint
        //    {
        //        X = usepk.Take(32).ToArray(),
        //        Y = usepk.Skip(32).ToArray()
        //    }
        //}))
        {
            //var hash = sha256.ComputeHash(message);
            return ecdsa.verify(message, signature);
        }
    };
    Helper.String2Bytes = function (str) {
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
    };
    Helper.Bytes2String = function (_arr) {
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
    };
    Helper.Aes256Encrypt = function (src, key) {
        var srcs = CryptoJS.enc.Utf8.parse(src);
        var keys = CryptoJS.enc.Utf8.parse(key);
        var encryptedkey = CryptoJS.AES.encrypt(srcs, keys, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
        });
        return encryptedkey.ciphertext.toString();
    };
    Helper.Aes256Encrypt_u8 = function (src, key) {
        var srcs = CryptoJS.enc.Utf8.parse("1234123412341234");
        srcs.sigBytes = src.length;
        srcs.words = new Array(src.length / 4);
        for (var i = 0; i < src.length / 4; i++) {
            srcs.words[i] = src[i * 4 + 3] + src[i * 4 + 2] * 256 + src[i * 4 + 1] * 256 * 256 + src[i * 4 + 0] * 256 * 256 * 256;
        }
        var keys = CryptoJS.enc.Utf8.parse("1234123412341234");
        keys.sigBytes = key.length;
        keys.words = new Array(key.length / 4);
        for (var i = 0; i < key.length / 4; i++) {
            keys.words[i] = key[i * 4 + 3] + key[i * 4 + 2] * 256 + key[i * 4 + 1] * 256 * 256 + key[i * 4 + 0] * 256 * 256 * 256;
        }
        var encryptedkey = CryptoJS.AES.encrypt(srcs, keys, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
        });
        var str = encryptedkey.ciphertext.toString();
        return str.hexToBytes();
    };
    Helper.Aes256Decrypt_u8 = function (encryptedkey, key) {
        var keys = CryptoJS.enc.Utf8.parse("1234123412341234");
        keys.sigBytes = key.length;
        keys.words = new Array(key.length / 4);
        for (var i = 0; i < key.length / 4; i++) {
            keys.words[i] = key[i * 4 + 3] + key[i * 4 + 2] * 256 + key[i * 4 + 1] * 256 * 256 + key[i * 4 + 0] * 256 * 256 * 256;
        }
        var base64key = index_1.Base64.fromByteArray(encryptedkey);
        var srcs = CryptoJS.AES.decrypt(base64key, keys, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
        });
        var str = srcs.toString();
        return str.hexToBytes();
    };
    Helper.GetNep2FromPrivateKey = function (prikey, passphrase, n, r, p, callback) {
        if (n === void 0) { n = 16384; }
        if (r === void 0) { r = 8; }
        if (p === void 0) { p = 8; }
        var pp = scrypt.getAvailableMod();
        scrypt.setResPath('lib/asset');
        var addresshash = null;
        var ready = function () {
            var param = {
                N: n,
                r: r,
                P: p // 并发维度
            };
            var opt = {
                maxPassLen: 32,
                maxSaltLen: 32,
                maxDkLen: 64,
                maxThread: 4 // 最多使用的线程数
            };
            try {
                scrypt.config(param, opt);
            }
            catch (err) {
                console.warn('config err: ', err);
            }
            //scrypt.onready();
        };
        scrypt.onload = function () {
            console.log("scrypt.onload");
            scrypt_loaded = true;
            ready();
        };
        scrypt.onerror = function (err) {
            console.warn('scrypt err:', err);
            callback("error", err);
        };
        scrypt.oncomplete = function (dk) {
            console.log('done', scrypt.binToHex(dk));
            var u8dk = new Uint8Array(dk);
            var derivedhalf1 = u8dk.subarray(0, 32);
            var derivedhalf2 = u8dk.subarray(32, 64);
            var u8xor = new Uint8Array(32);
            for (var i = 0; i < 32; i++) {
                u8xor[i] = prikey[i] ^ derivedhalf1[i];
            }
            //var xorinfo = XOR(prikey, derivedhalf1);
            var encryptedkey = Helper.Aes256Encrypt_u8(u8xor, derivedhalf2);
            //byte[] encryptedkey = AES256Encrypt(xorinfo, derivedhalf2);
            //byte[] buffer = new byte[39];
            var buffer = new Uint8Array(39);
            buffer[0] = 0x01;
            buffer[1] = 0x42;
            buffer[2] = 0xe0;
            for (var i = 3; i < 3 + 4; i++) {
                buffer[i] = addresshash[i - 3];
            }
            for (var i = 7; i < 32 + 7; i++) {
                buffer[i] = encryptedkey[i - 7];
            }
            //Buffer.BlockCopy(addresshash, 0, buffer, 3, addresshash.Length);
            //Buffer.BlockCopy(encryptedkey, 0, buffer, 7, encryptedkey.Length);
            //return Base58CheckEncode(buffer);
            var b1 = index_1.Sha256.computeHash(buffer);
            b1 = index_1.Sha256.computeHash(b1);
            var u8hash = new Uint8Array(b1);
            var outbuf = new Uint8Array(39 + 4);
            for (var i = 0; i < 39; i++) {
                outbuf[i] = buffer[i];
            }
            for (var i = 39; i < 39 + 4; i++) {
                outbuf[i] = u8hash[i - 39];
            }
            var base58str = index_1.Base58.encode(outbuf);
            callback("finish", base58str);
        };
        scrypt.onprogress = function (percent) {
            console.log('onprogress');
        };
        scrypt.onready = function () {
            var pubkey = Helper.GetPublicKeyFromPrivateKey(prikey);
            var script_hash = Helper.GetPublicKeyScriptHashFromPublicKey(pubkey);
            var address = Helper.GetAddressFromScriptHash(script_hash);
            var addrbin = scrypt.strToBin(address);
            var b1 = index_1.Sha256.computeHash(addrbin);
            b1 = index_1.Sha256.computeHash(b1);
            var b2 = new Uint8Array(b1);
            addresshash = b2.subarray(0, 4);
            var passbin = scrypt.strToBin(passphrase);
            //var passbin2 = Helper.String2Bytes(passphrase);
            //var str = Helper.Bytes2String(passbin);
            scrypt.hash(passbin, addresshash, 64);
        };
        if (scrypt_loaded == false) {
            scrypt.load("asmjs");
        }
        else {
            ready();
        }
        return;
    };
    Helper.GetPrivateKeyFromNep2 = function (nep2, passphrase, n, r, p, callback) {
        if (n === void 0) { n = 16384; }
        if (r === void 0) { r = 8; }
        if (p === void 0) { p = 8; }
        var data = index_1.Base58.decode(nep2);
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
        var b1 = index_1.Sha256.computeHash(buffer);
        b1 = index_1.Sha256.computeHash(b1);
        var u8hash = new Uint8Array(b1);
        for (var i = 0; i < 4; i++) {
            if (u8hash[i] != hash[i]) {
                callback("error", "data hash error");
                return;
            }
        }
        var addresshash = buffer.subarray(3, 3 + 4);
        var encryptedkey = buffer.subarray(7, 7 + 32);
        var pp = scrypt.getAvailableMod();
        scrypt.setResPath('lib/asset');
        var ready = function () {
            var param = {
                N: n,
                r: r,
                P: p // 并发维度
            };
            var opt = {
                maxPassLen: 32,
                maxSaltLen: 32,
                maxDkLen: 64,
                maxThread: 4 // 最多使用的线程数
            };
            try {
                scrypt.config(param, opt);
            }
            catch (err) {
                console.warn('config err: ', err);
            }
            //scrypt.onready();
        };
        scrypt.onload = function () {
            console.log("scrypt.onload");
            scrypt_loaded = true;
            ready();
        };
        scrypt.oncomplete = function (dk) {
            console.log('done', scrypt.binToHex(dk));
            var u8dk = new Uint8Array(dk);
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
            var addrbin = scrypt.strToBin(address);
            var b1 = index_1.Sha256.computeHash(addrbin);
            b1 = index_1.Sha256.computeHash(b1);
            var b2 = new Uint8Array(b1);
            var addresshashgot = b2.subarray(0, 4);
            for (var i = 0; i < 4; i++) {
                if (addresshash[i] != b2[i]) {
                    callback("error", "nep2 hash not match.");
                    return;
                }
            }
            callback("finish", prikey);
        };
        scrypt.onerror = function (err) {
            console.warn('scrypt err:', err);
            callback("error", err);
        };
        scrypt.onprogress = function (percent) {
            console.log('onprogress');
        };
        scrypt.onready = function () {
            var passbin = scrypt.strToBin(passphrase);
            scrypt.hash(passbin, addresshash, 64);
        };
        if (scrypt_loaded == false) {
            scrypt.load("asmjs");
        }
        else {
            ready();
        }
    };
    return Helper;
}());
exports.Helper = Helper;
