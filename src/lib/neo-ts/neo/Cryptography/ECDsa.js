"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoKey_1 = require("./CryptoKey");
const Sha256_1 = require("./Sha256");
const ECPoint_1 = require("./ECPoint");
const BigInteger_1 = require("../BigInteger");
const Arrayhelper = require("../../Helper/Arrayhelper");
const UintHelper = require("../../Helper/UintHelper");
class ECDsa {
    constructor(key) {
        this.key = key;
    }
    static calculateE(n, message) {
        return BigInteger_1.BigInteger.fromUint8Array(new Uint8Array(Sha256_1.Sha256.computeHash(message)), 1, false);
    }
    static generateKey(curve) {
        let prikey = new Uint8Array(32);
        let pubkey = ECPoint_1.ECPoint.multiply(curve.G, prikey);
        return {
            privateKey: new CryptoKey_1.ECDsaCryptoKey(pubkey, prikey),
            publicKey: new CryptoKey_1.ECDsaCryptoKey(pubkey)
        };
    }
    sign(message, randomStr) {
        if (this.key.privateKey == null)
            throw new Error();
        let e = ECDsa.calculateE(this.key.publicKey.curve.N, message);
        let d = BigInteger_1.BigInteger.fromUint8Array(this.key.privateKey, 1, false);
        let r, s;
        do {
            let k;
            do {
                do {
                    k = BigInteger_1.BigInteger.random(this.key.publicKey.curve.N.bitLength(), randomStr);
                } while (k.sign() == 0 || k.compareTo(this.key.publicKey.curve.N) >= 0);
                let p = ECPoint_1.ECPoint.multiply(this.key.publicKey.curve.G, k);
                let x = p.x.value;
                r = x.mod(this.key.publicKey.curve.N);
            } while (r.sign() == 0);
            s = k.modInverse(this.key.publicKey.curve.N).multiply(e.add(d.multiply(r))).mod(this.key.publicKey.curve.N);
            if (s.compareTo(this.key.publicKey.curve.N.divide(2)) > 0) {
                s = this.key.publicKey.curve.N.subtract(s);
            }
        } while (s.sign() == 0);
        let arr = new Uint8Array(64);
        Arrayhelper.copy(r.toUint8Array(false, 32), 0, arr, 0, 32);
        Arrayhelper.copy(s.toUint8Array(false, 32), 0, arr, 32, 32);
        return arr.buffer;
    }
    static sumOfTwoMultiplies(P, k, Q, l) {
        let m = Math.max(k.bitLength(), l.bitLength());
        let Z = ECPoint_1.ECPoint.add(P, Q);
        let R = P.curve.Infinity;
        for (let i = m - 1; i >= 0; --i) {
            R = R.twice();
            if (k.testBit(i)) {
                if (l.testBit(i))
                    R = ECPoint_1.ECPoint.add(R, Z);
                else
                    R = ECPoint_1.ECPoint.add(R, P);
            }
            else {
                if (l.testBit(i))
                    R = ECPoint_1.ECPoint.add(R, Q);
            }
        }
        return R;
    }
    verify(message, signature) {
        let arr = UintHelper.fromArrayBuffer(signature);
        let r = BigInteger_1.BigInteger.fromUint8Array(arr.subarray(0, 32), 1, false);
        let s = BigInteger_1.BigInteger.fromUint8Array(arr.subarray(32, 64), 1, false);
        if (r.compareTo(this.key.publicKey.curve.N) >= 0 || s.compareTo(this.key.publicKey.curve.N) >= 0)
            return false;
        let e = ECDsa.calculateE(this.key.publicKey.curve.N, message);
        let c = s.modInverse(this.key.publicKey.curve.N);
        let u1 = e.multiply(c).mod(this.key.publicKey.curve.N);
        let u2 = r.multiply(c).mod(this.key.publicKey.curve.N);
        let point = ECDsa.sumOfTwoMultiplies(this.key.publicKey.curve.G, u1, this.key.publicKey, u2);
        let v = point.x.value.mod(this.key.publicKey.curve.N);
        return v.equals(r);
    }
}
exports.ECDsa = ECDsa;
//# sourceMappingURL=ECDsa.js.map