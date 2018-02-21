"use strict";
exports.__esModule = true;
var index_1 = require("../../index");
var ECDsa = /** @class */ (function () {
    function ECDsa(key) {
        this.key = key;
    }
    ECDsa.calculateE = function (n, message) {
        return index_1.BigInteger.fromUint8Array(new Uint8Array(index_1.Sha256.computeHash(message)), 1, false);
    };
    ECDsa.generateKey = function (curve) {
        var prikey = new Uint8Array(32);
        crypto.getRandomValues(prikey);
        var pubkey = index_1.ECPoint.multiply(curve.G, prikey);
        return {
            privateKey: new index_1.ECDsaCryptoKey(pubkey, prikey),
            publicKey: new index_1.ECDsaCryptoKey(pubkey)
        };
    };
    ECDsa.prototype.sign = function (message) {
        if (this.key.privateKey == null)
            throw new Error();
        var e = ECDsa.calculateE(this.key.publicKey.curve.N, message);
        var d = index_1.BigInteger.fromUint8Array(this.key.privateKey, 1, false);
        var r, s;
        do {
            var k = void 0;
            do {
                do {
                    k = index_1.BigInteger.random(this.key.publicKey.curve.N.bitLength(), crypto);
                } while (k.sign() == 0 || k.compareTo(this.key.publicKey.curve.N) >= 0);
                var p = index_1.ECPoint.multiply(this.key.publicKey.curve.G, k);
                var x = p.x.value;
                r = x.mod(this.key.publicKey.curve.N);
            } while (r.sign() == 0);
            s = k.modInverse(this.key.publicKey.curve.N).multiply(e.add(d.multiply(r))).mod(this.key.publicKey.curve.N);
            if (s.compareTo(this.key.publicKey.curve.N.divide(2)) > 0) {
                s = this.key.publicKey.curve.N.subtract(s);
            }
        } while (s.sign() == 0);
        var arr = new Uint8Array(64);
        Array.copy(r.toUint8Array(false, 32), 0, arr, 0, 32);
        Array.copy(s.toUint8Array(false, 32), 0, arr, 32, 32);
        return arr.buffer;
    };
    ECDsa.sumOfTwoMultiplies = function (P, k, Q, l) {
        var m = Math.max(k.bitLength(), l.bitLength());
        var Z = index_1.ECPoint.add(P, Q);
        var R = P.curve.Infinity;
        for (var i = m - 1; i >= 0; --i) {
            R = R.twice();
            if (k.testBit(i)) {
                if (l.testBit(i))
                    R = index_1.ECPoint.add(R, Z);
                else
                    R = index_1.ECPoint.add(R, P);
            }
            else {
                if (l.testBit(i))
                    R = index_1.ECPoint.add(R, Q);
            }
        }
        return R;
    };
    ECDsa.prototype.verify = function (message, signature) {
        var arr = Uint8Array.fromArrayBuffer(signature);
        var r = index_1.BigInteger.fromUint8Array(arr.subarray(0, 32), 1, false);
        var s = index_1.BigInteger.fromUint8Array(arr.subarray(32, 64), 1, false);
        if (r.compareTo(this.key.publicKey.curve.N) >= 0 || s.compareTo(this.key.publicKey.curve.N) >= 0)
            return false;
        var e = ECDsa.calculateE(this.key.publicKey.curve.N, message);
        var c = s.modInverse(this.key.publicKey.curve.N);
        var u1 = e.multiply(c).mod(this.key.publicKey.curve.N);
        var u2 = r.multiply(c).mod(this.key.publicKey.curve.N);
        var point = ECDsa.sumOfTwoMultiplies(this.key.publicKey.curve.G, u1, this.key.publicKey, u2);
        var v = point.x.value.mod(this.key.publicKey.curve.N);
        return v.equals(r);
    };
    return ECDsa;
}());
exports.ECDsa = ECDsa;
