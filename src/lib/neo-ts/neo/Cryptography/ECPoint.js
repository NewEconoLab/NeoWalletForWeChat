"use strict";
exports.__esModule = true;
var index_1 = require("../../index");
var ECPoint = /** @class */ (function () {
    function ECPoint(x, y, curve) {
        this.x = x;
        this.y = y;
        this.curve = curve;
        if ((x == null) != (y == null))
            throw new RangeError("Exactly one of the field elements is null");
    }
    ECPoint.add = function (x, y) {
        if (x.isInfinity())
            return y;
        if (y.isInfinity())
            return x;
        if (x.x.equals(y.x)) {
            if (x.y.equals(y.y))
                return x.twice();
            console.assert(x.y.equals(y.y.negate()));
            return x.curve.Infinity;
        }
        var gamma = y.y.subtract(x.y).divide(y.x.subtract(x.x));
        var x3 = gamma.square().subtract(x.x).subtract(y.x);
        var y3 = gamma.multiply(x.x.subtract(x3)).subtract(x.y);
        return new ECPoint(x3, y3, x.curve);
    };
    ECPoint.prototype.compareTo = function (other) {
        if (this === other)
            return 0;
        var result = this.x.compareTo(other.x);
        if (result != 0)
            return result;
        return this.y.compareTo(other.y);
    };
    ECPoint.decodePoint = function (encoded, curve) {
        var p;
        var expectedLength = Math.ceil(curve.Q.bitLength() / 8);
        switch (encoded[0]) {
            case 0x00:// infinity
                {
                    if (encoded.length != 1)
                        throw new RangeError("Incorrect length for infinity encoding");
                    p = curve.Infinity;
                    break;
                }
            case 0x02: // compressed
            case 0x03:// compressed
                {
                    if (encoded.length != (expectedLength + 1))
                        throw new RangeError("Incorrect length for compressed encoding");
                    var yTilde = encoded[0] & 1;
                    var X1 = index_1.BigInteger.fromUint8Array(encoded.subarray(1), 1, false);
                    p = ECPoint.decompressPoint(yTilde, X1, curve);
                    break;
                }
            case 0x04: // uncompressed
            case 0x06: // hybrid
            case 0x07:// hybrid
                {
                    if (encoded.length != (2 * expectedLength + 1))
                        throw new RangeError("Incorrect length for uncompressed/hybrid encoding");
                    var X1 = index_1.BigInteger.fromUint8Array(encoded.subarray(1, 1 + expectedLength), 1, false);
                    var Y1 = index_1.BigInteger.fromUint8Array(encoded.subarray(1 + expectedLength), 1, false);
                    p = new ECPoint(new index_1.ECFieldElement(X1, curve), new index_1.ECFieldElement(Y1, curve), curve);
                    break;
                }
            default:
                throw new RangeError("Invalid point encoding " + encoded[0]);
        }
        return p;
    };
    ECPoint.decompressPoint = function (yTilde, X1, curve) {
        var x = new index_1.ECFieldElement(X1, curve);
        var alpha = x.multiply(x.square().add(curve.A)).add(curve.B);
        var beta = alpha.sqrt();
        //
        // if we can't find a sqrt we haven't got a point on the
        // curve - run!
        //
        if (beta == null)
            throw new RangeError("Invalid point compression");
        var betaValue = beta.value;
        var bit0 = betaValue.isEven() ? 0 : 1;
        if (bit0 != yTilde) {
            // Use the other root
            beta = new index_1.ECFieldElement(curve.Q.subtract(betaValue), curve);
        }
        return new ECPoint(x, beta, curve);
    };
    ECPoint.deserializeFrom = function (reader, curve) {
        var expectedLength = Math.floor((curve.Q.bitLength() + 7) / 8);
        var array = new Uint8Array(1 + expectedLength * 2);
        array[0] = reader.readByte();
        switch (array[0]) {
            case 0x00:
                return curve.Infinity;
            case 0x02:
            case 0x03:
                reader.read(array.buffer, 1, expectedLength);
                return ECPoint.decodePoint(new Uint8Array(array.buffer, 0, 33), curve);
            case 0x04:
            case 0x06:
            case 0x07:
                reader.read(array.buffer, 1, expectedLength * 2);
                return ECPoint.decodePoint(array, curve);
            default:
                throw new Error("Invalid point encoding " + array[0]);
        }
    };
    ECPoint.prototype.encodePoint = function (commpressed) {
        if (this.isInfinity())
            return new Uint8Array(1);
        var data;
        if (commpressed) {
            data = new Uint8Array(33);
        }
        else {
            data = new Uint8Array(65);
            var yBytes = this.y.value.toUint8Array();
            for (var i = 0; i < yBytes.length; i++)
                data[65 - yBytes.length + i] = yBytes[yBytes.length - 1 - i];
        }
        var xBytes = this.x.value.toUint8Array();
        for (var i = 0; i < xBytes.length; i++)
            data[33 - xBytes.length + i] = xBytes[xBytes.length - 1 - i];
        data[0] = commpressed ? this.y.value.isEven() ? 0x02 : 0x03 : 0x04;
        return data;
    };
    ECPoint.prototype.equals = function (other) {
        if (this === other)
            return true;
        if (null === other)
            return false;
        if (this.isInfinity && other.isInfinity)
            return true;
        if (this.isInfinity || other.isInfinity)
            return false;
        return this.x.equals(other.x) && this.y.equals(other.y);
    };
    ECPoint.fromUint8Array = function (arr, curve) {
        switch (arr.length) {
            case 33:
            case 65:
                return ECPoint.decodePoint(arr, curve);
            case 64:
            case 72:
                {
                    var arr_new = new Uint8Array(65);
                    arr_new[0] = 0x04;
                    arr_new.set(arr.subarray(arr.length - 64), 1);
                    return ECPoint.decodePoint(arr_new, curve);
                }
            case 96:
            case 104:
                {
                    var arr_new = new Uint8Array(65);
                    arr_new[0] = 0x04;
                    arr_new.set(arr.subarray(arr.length - 96, arr.length - 32), 1);
                    return ECPoint.decodePoint(arr_new, curve);
                }
            default:
                throw new RangeError();
        }
    };
    ECPoint.prototype.isInfinity = function () {
        return this.x == null && this.y == null;
    };
    ECPoint.multiply = function (p, n) {
        var k = n instanceof Uint8Array ? index_1.BigInteger.fromUint8Array(n, 1, false) : n;
        if (p.isInfinity())
            return p;
        if (k.isZero())
            return p.curve.Infinity;
        // floor(log2(k))
        var m = k.bitLength();
        // width of the Window NAF
        var width;
        // Required length of precomputation array
        var reqPreCompLen;
        // Determine optimal width and corresponding length of precomputation
        // array based on literature values
        if (m < 13) {
            width = 2;
            reqPreCompLen = 1;
        }
        else if (m < 41) {
            width = 3;
            reqPreCompLen = 2;
        }
        else if (m < 121) {
            width = 4;
            reqPreCompLen = 4;
        }
        else if (m < 337) {
            width = 5;
            reqPreCompLen = 8;
        }
        else if (m < 897) {
            width = 6;
            reqPreCompLen = 16;
        }
        else if (m < 2305) {
            width = 7;
            reqPreCompLen = 32;
        }
        else {
            width = 8;
            reqPreCompLen = 127;
        }
        // The length of the precomputation array
        var preCompLen = 1;
        var preComp = [p];
        var twiceP = p.twice();
        if (preCompLen < reqPreCompLen) {
            // Precomputation array must be made bigger, copy existing preComp
            // array into the larger new preComp array
            var oldPreComp = preComp;
            preComp = new Array(reqPreCompLen);
            for (var i = 0; i < preCompLen; i++)
                preComp[i] = oldPreComp[i];
            for (var i = preCompLen; i < reqPreCompLen; i++) {
                // Compute the new ECPoints for the precomputation array.
                // The values 1, 3, 5, ..., 2^(width-1)-1 times p are
                // computed
                preComp[i] = ECPoint.add(twiceP, preComp[i - 1]);
            }
        }
        // Compute the Window NAF of the desired width
        var wnaf = ECPoint.windowNaf(width, k);
        var l = wnaf.length;
        // Apply the Window NAF to p using the precomputed ECPoint values.
        var q = p.curve.Infinity;
        for (var i = l - 1; i >= 0; i--) {
            q = q.twice();
            if (wnaf[i] != 0) {
                if (wnaf[i] > 0) {
                    q = ECPoint.add(q, preComp[Math.floor((wnaf[i] - 1) / 2)]);
                }
                else {
                    // wnaf[i] < 0
                    q = ECPoint.subtract(q, preComp[Math.floor((-wnaf[i] - 1) / 2)]);
                }
            }
        }
        return q;
    };
    ECPoint.prototype.negate = function () {
        return new ECPoint(this.x, this.y.negate(), this.curve);
    };
    ECPoint.parse = function (str, curve) {
        return ECPoint.decodePoint(str.hexToBytes(), curve);
    };
    ECPoint.subtract = function (x, y) {
        if (y.isInfinity())
            return x;
        return ECPoint.add(x, y.negate());
    };
    ECPoint.prototype.toString = function () {
        return this.encodePoint(true).toHexString();
    };
    ECPoint.prototype.twice = function () {
        if (this.isInfinity())
            return this;
        if (this.y.value.sign() == 0)
            return this.curve.Infinity;
        var TWO = new index_1.ECFieldElement(new index_1.BigInteger(2), this.curve);
        var THREE = new index_1.ECFieldElement(new index_1.BigInteger(3), this.curve);
        var gamma = this.x.square().multiply(THREE).add(this.curve.A).divide(this.y.multiply(TWO));
        var x3 = gamma.square().subtract(this.x.multiply(TWO));
        var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);
        return new ECPoint(x3, y3, this.curve);
    };
    ECPoint.windowNaf = function (width, k) {
        var wnaf = new Array(k.bitLength() + 1);
        var pow2wB = 1 << width;
        var i = 0;
        var length = 0;
        while (k.sign() > 0) {
            if (!k.isEven()) {
                var remainder = index_1.BigInteger.remainder(k, pow2wB);
                if (remainder.testBit(width - 1)) {
                    wnaf[i] = index_1.BigInteger.subtract(remainder, pow2wB).toInt32();
                }
                else {
                    wnaf[i] = remainder.toInt32();
                }
                k = k.subtract(wnaf[i]);
                length = i;
            }
            else {
                wnaf[i] = 0;
            }
            k = k.rightShift(1);
            i++;
        }
        wnaf.length = length + 1;
        return wnaf;
    };
    return ECPoint;
}());
exports.ECPoint = ECPoint;
