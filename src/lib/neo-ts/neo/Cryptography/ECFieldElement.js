"use strict";
exports.__esModule = true;
var index_1 = require("../../index");
var ECFieldElement = /** @class */ (function () {
    function ECFieldElement(value, curve) {
        this.value = value;
        this.curve = curve;
        if (index_1.BigInteger.compare(value, curve.Q) >= 0)
            throw new RangeError("x value too large in field element");
    }
    ECFieldElement.prototype.add = function (other) {
        return new ECFieldElement(this.value.add(other.value).mod(this.curve.Q), this.curve);
    };
    ECFieldElement.prototype.compareTo = function (other) {
        if (this === other)
            return 0;
        return this.value.compareTo(other.value);
    };
    ECFieldElement.prototype.divide = function (other) {
        return new ECFieldElement(this.value.multiply(other.value.modInverse(this.curve.Q)).mod(this.curve.Q), this.curve);
    };
    ECFieldElement.prototype.equals = function (other) {
        return this.value.equals(other.value);
    };
    ECFieldElement.fastLucasSequence = function (p, P, Q, k) {
        var n = k.bitLength();
        var s = k.getLowestSetBit();
        console.assert(k.testBit(s));
        var Uh = index_1.BigInteger.One;
        var Vl = new index_1.BigInteger(2);
        var Vh = P;
        var Ql = index_1.BigInteger.One;
        var Qh = index_1.BigInteger.One;
        for (var j = n - 1; j >= s + 1; --j) {
            Ql = index_1.BigInteger.mod(index_1.BigInteger.multiply(Ql, Qh), p);
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
        for (var j = 1; j <= s; ++j) {
            Uh = Uh.multiply(Vl).multiply(p);
            Vl = Vl.multiply(Vl).subtract(Ql.leftShift(1)).mod(p);
            Ql = Ql.multiply(Ql).mod(p);
        }
        return [Uh, Vl];
    };
    ECFieldElement.prototype.multiply = function (other) {
        return new ECFieldElement(this.value.multiply(other.value).mod(this.curve.Q), this.curve);
    };
    ECFieldElement.prototype.negate = function () {
        return new ECFieldElement(this.value.negate().mod(this.curve.Q), this.curve);
    };
    ECFieldElement.prototype.sqrt = function () {
        if (this.curve.Q.testBit(1)) {
            var z = new ECFieldElement(index_1.BigInteger.modPow(this.value, this.curve.Q.rightShift(2).add(1), this.curve.Q), this.curve);
            return z.square().equals(this) ? z : null;
        }
        var qMinusOne = this.curve.Q.subtract(1);
        var legendreExponent = qMinusOne.rightShift(1);
        if (index_1.BigInteger.modPow(this.value, legendreExponent, this.curve.Q).equals(1))
            return null;
        var u = qMinusOne.rightShift(2);
        var k = u.leftShift(1).add(1);
        var Q = this.value;
        var fourQ = Q.leftShift(2).mod(this.curve.Q);
        var U, V;
        do {
            var P = void 0;
            do {
                P = index_1.BigInteger.random(this.curve.Q.bitLength());
            } while (P.compareTo(this.curve.Q) >= 0 || !index_1.BigInteger.modPow(P.multiply(P).subtract(fourQ), legendreExponent, this.curve.Q).equals(qMinusOne));
            var result = ECFieldElement.fastLucasSequence(this.curve.Q, P, Q, k);
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
        } while (U.equals(index_1.BigInteger.One) || U.equals(qMinusOne));
        return null;
    };
    ECFieldElement.prototype.square = function () {
        return new ECFieldElement(this.value.multiply(this.value).mod(this.curve.Q), this.curve);
    };
    ECFieldElement.prototype.subtract = function (other) {
        return new ECFieldElement(this.value.subtract(other.value).mod(this.curve.Q), this.curve);
    };
    return ECFieldElement;
}());
exports.ECFieldElement = ECFieldElement;
