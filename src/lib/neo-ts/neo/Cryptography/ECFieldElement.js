"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BigInteger_1 = require("../BigInteger");
class ECFieldElement {
    constructor(value, curve) {
        this.value = value;
        this.curve = curve;
        if (BigInteger_1.BigInteger.compare(value, curve.Q) >= 0)
            throw new RangeError("x value too large in field element");
    }
    add(other) {
        return new ECFieldElement(this.value.add(other.value).mod(this.curve.Q), this.curve);
    }
    compareTo(other) {
        if (this === other)
            return 0;
        return this.value.compareTo(other.value);
    }
    divide(other) {
        return new ECFieldElement(this.value.multiply(other.value.modInverse(this.curve.Q)).mod(this.curve.Q), this.curve);
    }
    equals(other) {
        return this.value.equals(other.value);
    }
    static fastLucasSequence(p, P, Q, k) {
        let n = k.bitLength();
        let s = k.getLowestSetBit();
        console.assert(k.testBit(s));
        let Uh = BigInteger_1.BigInteger.One;
        let Vl = new BigInteger_1.BigInteger(2);
        let Vh = P;
        let Ql = BigInteger_1.BigInteger.One;
        let Qh = BigInteger_1.BigInteger.One;
        for (let j = n - 1; j >= s + 1; --j) {
            Ql = BigInteger_1.BigInteger.mod(BigInteger_1.BigInteger.multiply(Ql, Qh), p);
            if (k.testBit(j)) {
                Qh = Ql.multiply(Q).mod(p);
                Uh = Uh.multiply(Vh).mod(p);
                Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                Vh = Vh.multiply(Vh).subtract(Qh.leftShift(1)).mod(p);
            }
            else {
                Qh = Ql;
                Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
                Vh = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
                Vl = Vl.multiply(Vl).subtract(Ql.leftShift(1)).mod(p);
            }
        }
        Ql = Ql.multiply(Qh).mod(p);
        Qh = Ql.multiply(Q).mod(p);
        Uh = Uh.multiply(Vl).subtract(Ql).mod(p);
        Vl = Vh.multiply(Vl).subtract(P.multiply(Ql)).mod(p);
        Ql = Ql.multiply(Qh).mod(p);
        for (let j = 1; j <= s; ++j) {
            Uh = Uh.multiply(Vl).multiply(p);
            Vl = Vl.multiply(Vl).subtract(Ql.leftShift(1)).mod(p);
            Ql = Ql.multiply(Ql).mod(p);
        }
        return [Uh, Vl];
    }
    multiply(other) {
        return new ECFieldElement(this.value.multiply(other.value).mod(this.curve.Q), this.curve);
    }
    negate() {
        return new ECFieldElement(this.value.negate().mod(this.curve.Q), this.curve);
    }
    sqrt() {
        if (this.curve.Q.testBit(1)) {
            let z = new ECFieldElement(BigInteger_1.BigInteger.modPow(this.value, this.curve.Q.rightShift(2).add(1), this.curve.Q), this.curve);
            return z.square().equals(this) ? z : null;
        }
        let qMinusOne = this.curve.Q.subtract(1);
        let legendreExponent = qMinusOne.rightShift(1);
        if (BigInteger_1.BigInteger.modPow(this.value, legendreExponent, this.curve.Q).equals(1))
            return null;
        let u = qMinusOne.rightShift(2);
        let k = u.leftShift(1).add(1);
        let Q = this.value;
        let fourQ = Q.leftShift(2).mod(this.curve.Q);
        let U, V;
        do {
            let P;
            do {
                P = BigInteger_1.BigInteger.random(this.curve.Q.bitLength());
            } while (P.compareTo(this.curve.Q) >= 0 || !BigInteger_1.BigInteger.modPow(P.multiply(P).subtract(fourQ), legendreExponent, this.curve.Q).equals(qMinusOne));
            let result = ECFieldElement.fastLucasSequence(this.curve.Q, P, Q, k);
            U = result[0];
            V = result[1];
            if (V.multiply(V).mod(this.curve.Q).equals(fourQ)) {
                if (V.testBit(0)) {
                    V = V.add(this.curve.Q);
                }
                V = V.rightShift(1);
                console.assert(V.multiply(V).mod(this.curve.Q).equals(this.value));
                return new ECFieldElement(V, this.curve);
            }
        } while (U.equals(BigInteger_1.BigInteger.One) || U.equals(qMinusOne));
        return null;
    }
    square() {
        return new ECFieldElement(this.value.multiply(this.value).mod(this.curve.Q), this.curve);
    }
    subtract(other) {
        return new ECFieldElement(this.value.subtract(other.value).mod(this.curve.Q), this.curve);
    }
}
exports.ECFieldElement = ECFieldElement;
//# sourceMappingURL=ECFieldElement.js.map