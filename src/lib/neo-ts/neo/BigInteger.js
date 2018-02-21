"use strict";
exports.__esModule = true;
///<reference path="UintVariable.ts"/>
///<reference path="Uint64.ts"/>
var index_1 = require("../index");
var NEO = require("../index");
var DB = 26;
var DM = (1 << DB) - 1;
var DV = DM + 1;
var _minusone, _one, _zero;
var BigInteger = /** @class */ (function () {
    function BigInteger(value) {
        this._sign = 0;
        this._bits = new Array();
        if (typeof value === "number") {
            if (!isFinite(value) || isNaN(value))
                throw new RangeError();
            var parts = BigInteger.getDoubleParts(value);
            if (parts.man.equals(NEO.Uint64.Zero) || parts.exp <= -64)
                return;
            if (parts.exp <= 0) {
                this.fromUint64(parts.man.rightShift(-parts.exp), parts.sign);
            }
            else if (parts.exp <= 11) {
                this.fromUint64(parts.man.leftShift(parts.exp), parts.sign);
            }
            else {
                parts.man = parts.man.leftShift(11);
                parts.exp -= 11;
                var units = Math.ceil((parts.exp + 64) / DB);
                var cu = Math.ceil(parts.exp / DB);
                var cbit = cu * DB - parts.exp;
                for (var i = cu; i < units; i++)
                    this._bits[i] = parts.man.rightShift(cbit + (i - cu) * DB).toUint32() & DM;
                if (cbit > 0)
                    this._bits[cu - 1] = (parts.man.toUint32() << (DB - cbit)) & DM;
                this._sign = parts.sign;
                this.clamp();
            }
        }
        else if (typeof value === "string") {
            this.fromString(value);
        }
        else if (value instanceof Uint8Array) {
            this.fromUint8Array(value);
        }
        else if (value instanceof ArrayBuffer) {
            this.fromUint8Array(new Uint8Array(value));
        }
    }
    Object.defineProperty(BigInteger, "MinusOne", {
        get: function () { return _minusone || (_minusone = new BigInteger(-1)); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BigInteger, "One", {
        get: function () { return _one || (_one = new BigInteger(1)); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BigInteger, "Zero", {
        get: function () { return _zero || (_zero = new BigInteger(0)); },
        enumerable: true,
        configurable: true
    });
    BigInteger.add = function (x, y) {
        var bi_x = typeof x === "number" ? new BigInteger(x) : x;
        var bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_x._sign == 0)
            return bi_y;
        if (bi_y._sign == 0)
            return bi_x;
        if ((bi_x._sign > 0) != (bi_y._sign > 0))
            return BigInteger.subtract(bi_x, bi_y.negate());
        var bits_r = new Array();
        BigInteger.addTo(bi_x._bits, bi_y._bits, bits_r);
        return BigInteger.create(bi_x._sign, bits_r);
    };
    BigInteger.prototype.add = function (other) {
        return BigInteger.add(this, other);
    };
    BigInteger.addTo = function (x, y, r) {
        if (x.length < y.length) {
            var t = x;
            x = y;
            y = t;
        }
        var c = 0, i = 0;
        while (i < y.length) {
            c += x[i] + y[i];
            r[i++] = c & DM;
            c >>>= DB;
        }
        while (i < x.length) {
            c += x[i];
            r[i++] = c & DM;
            c >>>= DB;
        }
        if (c > 0)
            r[i] = c;
    };
    BigInteger.prototype.bitLength = function () {
        var l = this._bits.length;
        if (l == 0)
            return 0;
        return --l * DB + BigInteger.bitLengthInternal(this._bits[l]);
    };
    BigInteger.bitLengthInternal = function (w) {
        return (w < 1 << 15 ? (w < 1 << 7
            ? (w < 1 << 3 ? (w < 1 << 1
                ? (w < 1 << 0 ? (w < 0 ? 32 : 0) : 1)
                : (w < 1 << 2 ? 2 : 3)) : (w < 1 << 5
                ? (w < 1 << 4 ? 4 : 5)
                : (w < 1 << 6 ? 6 : 7)))
            : (w < 1 << 11
                ? (w < 1 << 9 ? (w < 1 << 8 ? 8 : 9) : (w < 1 << 10 ? 10 : 11))
                : (w < 1 << 13 ? (w < 1 << 12 ? 12 : 13) : (w < 1 << 14 ? 14 : 15)))) : (w < 1 << 23 ? (w < 1 << 19
            ? (w < 1 << 17 ? (w < 1 << 16 ? 16 : 17) : (w < 1 << 18 ? 18 : 19))
            : (w < 1 << 21 ? (w < 1 << 20 ? 20 : 21) : (w < 1 << 22 ? 22 : 23))) : (w < 1 << 27
            ? (w < 1 << 25 ? (w < 1 << 24 ? 24 : 25) : (w < 1 << 26 ? 26 : 27))
            : (w < 1 << 29 ? (w < 1 << 28 ? 28 : 29) : (w < 1 << 30 ? 30 : 31)))));
    };
    BigInteger.prototype.clamp = function () {
        var l = this._bits.length;
        while (l > 0 && (this._bits[--l] | 0) == 0)
            this._bits.pop();
        while (l > 0)
            this._bits[--l] |= 0;
        if (this._bits.length == 0)
            this._sign = 0;
    };
    BigInteger.compare = function (x, y) {
        var bi_x = typeof x === "number" ? new BigInteger(x) : x;
        var bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_x._sign >= 0 && bi_y._sign < 0)
            return +1;
        if (bi_x._sign < 0 && bi_y._sign >= 0)
            return -1;
        var c = BigInteger.compareAbs(bi_x, bi_y);
        return bi_x._sign < 0 ? -c : c;
    };
    BigInteger.compareAbs = function (x, y) {
        if (x._bits.length > y._bits.length)
            return +1;
        if (x._bits.length < y._bits.length)
            return -1;
        for (var i = x._bits.length - 1; i >= 0; i--)
            if (x._bits[i] > y._bits[i])
                return +1;
            else if (x._bits[i] < y._bits[i])
                return -1;
        return 0;
    };
    BigInteger.prototype.compareTo = function (other) {
        return BigInteger.compare(this, other);
    };
    BigInteger.create = function (sign, bits, clamp) {
        if (clamp === void 0) { clamp = false; }
        var bi = Object.create(BigInteger.prototype);
        bi._sign = sign;
        bi._bits = bits;
        if (clamp)
            bi.clamp();
        return bi;
    };
    BigInteger.divide = function (x, y) {
        var bi_x = typeof x === "number" ? new BigInteger(x) : x;
        var bi_y = typeof y === "number" ? new BigInteger(y) : y;
        return BigInteger.divRem(bi_x, bi_y).result;
    };
    BigInteger.prototype.divide = function (other) {
        return BigInteger.divide(this, other);
    };
    BigInteger.divRem = function (x, y) {
        var bi_x = typeof x === "number" ? new BigInteger(x) : x;
        var bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_y._sign == 0)
            throw new RangeError();
        if (bi_x._sign == 0)
            return { result: BigInteger.Zero, remainder: BigInteger.Zero };
        if (bi_y._sign == 1 && bi_y._bits == null)
            return { result: bi_x, remainder: BigInteger.Zero };
        if (bi_y._sign == -1 && bi_y._bits == null)
            return { result: bi_x.negate(), remainder: BigInteger.Zero };
        var sign_result = (bi_x._sign > 0) == (bi_y._sign > 0) ? +1 : -1;
        var c = BigInteger.compareAbs(bi_x, bi_y);
        if (c == 0)
            return { result: sign_result > 0 ? BigInteger.One : BigInteger.MinusOne, remainder: BigInteger.Zero };
        if (c < 0)
            return { result: BigInteger.Zero, remainder: bi_x };
        var bits_result = new Array();
        var bits_rem = new Array();
        Array.copy(bi_x._bits, 0, bits_rem, 0, bi_x._bits.length);
        var df = bi_y._bits[bi_y._bits.length - 1];
        for (var i = bi_x._bits.length - 1; i >= bi_y._bits.length - 1; i--) {
            var offset = i - bi_y._bits.length + 1;
            var d = bits_rem[i] + (bits_rem[i + 1] || 0) * DV;
            var max = Math.floor(d / df);
            if (max > DM)
                max = DM;
            var min = 0;
            while (min != max) {
                var bits_sub_1 = new Array(offset + bi_y._bits.length);
                for (var i_1 = 0; i_1 < offset; i_1++)
                    bits_sub_1[i_1] = 0;
                bits_result[offset] = Math.ceil((min + max) / 2);
                BigInteger.multiplyTo(bi_y._bits, [bits_result[offset]], bits_sub_1, offset);
                if (BigInteger.subtractTo(bits_rem, bits_sub_1))
                    max = bits_result[offset] - 1;
                else
                    min = bits_result[offset];
            }
            var bits_sub = new Array(offset + bi_y._bits.length);
            for (var i_2 = 0; i_2 < offset; i_2++)
                bits_sub[i_2] = 0;
            bits_result[offset] = min;
            BigInteger.multiplyTo(bi_y._bits, [bits_result[offset]], bits_sub, offset);
            BigInteger.subtractTo(bits_rem, bits_sub, bits_rem);
        }
        return { result: BigInteger.create(sign_result, bits_result, true), remainder: BigInteger.create(bi_x._sign, bits_rem, true) };
    };
    BigInteger.equals = function (x, y) {
        var bi_x = typeof x === "number" ? new BigInteger(x) : x;
        var bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_x._sign != bi_y._sign)
            return false;
        if (bi_x._bits.length != bi_y._bits.length)
            return false;
        for (var i = 0; i < bi_x._bits.length; i++)
            if (bi_x._bits[i] != bi_y._bits[i])
                return false;
        return true;
    };
    BigInteger.prototype.equals = function (other) {
        return BigInteger.equals(this, other);
    };
    BigInteger.fromString = function (str, radix) {
        if (radix === void 0) { radix = 10; }
        var bi = Object.create(BigInteger.prototype);
        bi.fromString(str, radix);
        return bi;
    };
    BigInteger.prototype.fromString = function (str, radix) {
        if (radix === void 0) { radix = 10; }
        if (radix < 2 || radix > 36)
            throw new RangeError();
        if (str.length == 0) {
            this._sign == 0;
            this._bits = [];
            return;
        }
        var bits_radix = [radix];
        var bits_a = [0];
        var first = str.charCodeAt(0);
        var withsign = first == 0x2b || first == 0x2d;
        this._sign = first == 0x2d ? -1 : +1;
        this._bits = [];
        for (var i = withsign ? 1 : 0; i < str.length; i++) {
            bits_a[0] = str.charCodeAt(i);
            if (bits_a[0] >= 0x30 && bits_a[0] <= 0x39)
                bits_a[0] -= 0x30;
            else if (bits_a[0] >= 0x41 && bits_a[0] <= 0x5a)
                bits_a[0] -= 0x37;
            else if (bits_a[0] >= 0x61 && bits_a[0] <= 0x7a)
                bits_a[0] -= 0x57;
            else
                throw new RangeError();
            var bits_temp = new Array();
            BigInteger.multiplyTo(this._bits, bits_radix, bits_temp);
            BigInteger.addTo(bits_temp, bits_a, this._bits);
        }
        this.clamp();
    };
    BigInteger.fromUint8Array = function (arr, sign, littleEndian) {
        if (sign === void 0) { sign = 1; }
        if (littleEndian === void 0) { littleEndian = true; }
        var bi = Object.create(BigInteger.prototype);
        bi.fromUint8Array(arr, sign, littleEndian);
        return bi;
    };
    BigInteger.prototype.fromUint8Array = function (arr, sign, littleEndian) {
        if (sign === void 0) { sign = 1; }
        if (littleEndian === void 0) { littleEndian = true; }
        if (!littleEndian) {
            var arr_new = new Uint8Array(arr.length);
            for (var i = 0; i < arr.length; i++)
                arr_new[arr.length - 1 - i] = arr[i];
            arr = arr_new;
        }
        var actual_length = BigInteger.getActualLength(arr);
        var bits = actual_length * 8;
        var units = Math.ceil(bits / DB);
        this._bits = [];
        for (var i = 0; i < units; i++) {
            var cb = i * DB;
            var cu = Math.floor(cb / 8);
            cb %= 8;
            this._bits[i] = ((arr[cu] | arr[cu + 1] << 8 | arr[cu + 2] << 16 | arr[cu + 3] << 24) >>> cb) & DM;
        }
        this._sign = sign < 0 ? -1 : +1;
        this.clamp();
    };
    BigInteger.prototype.fromUint64 = function (i, sign) {
        while (i.bits[0] != 0 || i.bits[1] != 0) {
            this._bits.push(i.toUint32() & DM);
            i = i.rightShift(DB);
        }
        this._sign = sign;
        this.clamp();
    };
    BigInteger.getActualLength = function (arr) {
        var actual_length = arr.length;
        for (var i = arr.length - 1; i >= 0; i--)
            if (arr[i] != 0) {
                actual_length = i + 1;
                break;
            }
        return actual_length;
    };
    BigInteger.getDoubleParts = function (dbl) {
        var uu = new Uint32Array(2);
        new Float64Array(uu.buffer)[0] = dbl;
        var result = {
            sign: 1 - ((uu[1] >>> 30) & 2),
            man: new index_1.Uint64(uu[0], uu[1] & 0x000FFFFF),
            exp: (uu[1] >>> 20) & 0x7FF,
            fFinite: true
        };
        if (result.exp == 0) {
            if (!result.man.equals(index_1.Uint64.Zero))
                result.exp = -1074;
        }
        else if (result.exp == 0x7FF) {
            result.fFinite = false;
        }
        else {
            result.man = result.man.or(new index_1.Uint64(0, 0x00100000));
            result.exp -= 1075;
        }
        return result;
    };
    BigInteger.prototype.getLowestSetBit = function () {
        if (this._sign == 0)
            return -1;
        var w = 0;
        while (this._bits[w] == 0)
            w++;
        for (var x = 0; x < DB; x++)
            if ((this._bits[w] & 1 << x) > 0)
                return x + w * DB;
    };
    BigInteger.prototype.isEven = function () {
        if (this._sign == 0)
            return true;
        return (this._bits[0] & 1) == 0;
    };
    BigInteger.prototype.isZero = function () {
        return this._sign == 0;
    };
    BigInteger.prototype.leftShift = function (shift) {
        if (shift == 0)
            return this;
        var shift_units = Math.floor(shift / DB);
        shift %= DB;
        var bits_new = new Array(this._bits.length + shift_units);
        if (shift == 0) {
            for (var i = 0; i < this._bits.length; i++)
                bits_new[i + shift_units] = this._bits[i];
        }
        else {
            for (var i = shift_units; i < bits_new.length; i++)
                bits_new[i] = (this._bits[i - shift_units] << shift | this._bits[i - shift_units - 1] >>> (DB - shift)) & DM;
            bits_new[bits_new.length] = this._bits[this._bits.length - 1] >>> (DB - shift) & DM;
        }
        return BigInteger.create(this._sign, bits_new, true);
    };
    BigInteger.mod = function (x, y) {
        var bi_x = typeof x === "number" ? new BigInteger(x) : x;
        var bi_y = typeof y === "number" ? new BigInteger(y) : y;
        var bi_new = BigInteger.divRem(bi_x, bi_y).remainder;
        if (bi_new._sign < 0)
            bi_new = BigInteger.add(bi_new, bi_y);
        return bi_new;
    };
    BigInteger.prototype.mod = function (other) {
        return BigInteger.mod(this, other);
    };
    BigInteger.modInverse = function (value, modulus) {
        var a = typeof value === "number" ? new BigInteger(value) : value;
        var n = typeof modulus === "number" ? new BigInteger(modulus) : modulus;
        var i = n, v = BigInteger.Zero, d = BigInteger.One;
        while (a._sign > 0) {
            var t = BigInteger.divRem(i, a);
            var x = d;
            i = a;
            a = t.remainder;
            d = v.subtract(t.result.multiply(x));
            v = x;
        }
        return BigInteger.mod(v, n);
    };
    BigInteger.prototype.modInverse = function (modulus) {
        return BigInteger.modInverse(this, modulus);
    };
    BigInteger.modPow = function (value, exponent, modulus) {
        var bi_v = typeof value === "number" ? new BigInteger(value) : value;
        var bi_e = typeof exponent === "number" ? new BigInteger(exponent) : exponent;
        var bi_m = typeof modulus === "number" ? new BigInteger(modulus) : modulus;
        if (bi_e._sign < 0 || bi_m._sign == 0)
            throw new RangeError();
        if (Math.abs(bi_m._sign) == 1 && bi_m._bits == null)
            return BigInteger.Zero;
        var h = bi_e.bitLength();
        var bi_new = BigInteger.One;
        for (var i = 0; i < h; i++) {
            if (i > 0)
                bi_v = BigInteger.multiply(bi_v, bi_v);
            bi_v = bi_v.remainder(bi_m);
            if (bi_e.testBit(i))
                bi_new = BigInteger.multiply(bi_v, bi_new).remainder(bi_m);
        }
        if (bi_new._sign < 0)
            bi_new = BigInteger.add(bi_new, bi_m);
        return bi_new;
    };
    BigInteger.prototype.modPow = function (exponent, modulus) {
        return BigInteger.modPow(this, exponent, modulus);
    };
    BigInteger.multiply = function (x, y) {
        var bi_x = typeof x === "number" ? new BigInteger(x) : x;
        var bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_x._sign == 0)
            return bi_x;
        if (bi_y._sign == 0)
            return bi_y;
        if (bi_x._sign == 1 && bi_x._bits == null)
            return bi_y;
        if (bi_x._sign == -1 && bi_x._bits == null)
            return bi_y.negate();
        if (bi_y._sign == 1 && bi_y._bits == null)
            return bi_x;
        if (bi_y._sign == -1 && bi_y._bits == null)
            return bi_x.negate();
        var bits_r = new Array();
        BigInteger.multiplyTo(bi_x._bits, bi_y._bits, bits_r);
        return BigInteger.create((bi_x._sign > 0) == (bi_y._sign > 0) ? +1 : -1, bits_r);
    };
    BigInteger.prototype.multiply = function (other) {
        return BigInteger.multiply(this, other);
    };
    BigInteger.multiplyTo = function (x, y, r, offset) {
        if (offset === void 0) { offset = 0; }
        if (x.length > y.length) {
            var t = x;
            x = y;
            y = t;
        }
        for (var i = x.length + y.length - 2; i >= 0; i--)
            r[i + offset] = 0;
        for (var i = 0; i < x.length; i++) {
            if (x[i] == 0)
                continue;
            for (var j = 0; j < y.length; j++) {
                var c = x[i] * y[j];
                if (c == 0)
                    continue;
                var k = i + j;
                do {
                    c += r[k + offset] || 0;
                    r[k + offset] = c & DM;
                    c = Math.floor(c / DV);
                    k++;
                } while (c > 0);
            }
        }
    };
    BigInteger.prototype.negate = function () {
        return BigInteger.create(-this._sign, this._bits);
    };
    BigInteger.parse = function (str) {
        return BigInteger.fromString(str);
    };
    BigInteger.pow = function (value, exponent) {
        var bi_v = typeof value === "number" ? new BigInteger(value) : value;
        if (exponent < 0 || exponent > 0x7fffffff)
            throw new RangeError();
        if (exponent == 0)
            return BigInteger.One;
        if (exponent == 1)
            return bi_v;
        if (bi_v._sign == 0)
            return bi_v;
        if (bi_v._bits.length == 1) {
            if (bi_v._bits[0] == 1)
                return bi_v;
            if (bi_v._bits[0] == -1)
                return (exponent & 1) != 0 ? bi_v : BigInteger.One;
        }
        var h = BigInteger.bitLengthInternal(exponent);
        var bi_new = BigInteger.One;
        for (var i = 0; i < h; i++) {
            var e = 1 << i;
            if (e > 1)
                bi_v = BigInteger.multiply(bi_v, bi_v);
            if ((exponent & e) != 0)
                bi_new = BigInteger.multiply(bi_v, bi_new);
        }
        return bi_new;
    };
    BigInteger.prototype.pow = function (exponent) {
        return BigInteger.pow(this, exponent);
    };
    BigInteger.random = function (bitLength, rng) {
        if (bitLength == 0)
            return BigInteger.Zero;
        var bytes = new Uint8Array(Math.ceil(bitLength / 8));
        if (rng == null) {
            for (var i = 0; i < bytes.length; i++)
                bytes[i] = Math.random() * 256;
        }
        else {
            rng.getRandomValues(bytes);
        }
        bytes[bytes.length - 1] &= 0xff >>> (8 - bitLength % 8);
        return new BigInteger(bytes);
    };
    BigInteger.remainder = function (x, y) {
        var bi_x = typeof x === "number" ? new BigInteger(x) : x;
        var bi_y = typeof y === "number" ? new BigInteger(y) : y;
        return BigInteger.divRem(bi_x, bi_y).remainder;
    };
    BigInteger.prototype.remainder = function (other) {
        return BigInteger.remainder(this, other);
    };
    BigInteger.prototype.rightShift = function (shift) {
        if (shift == 0)
            return this;
        var shift_units = Math.floor(shift / DB);
        shift %= DB;
        if (this._bits.length <= shift_units)
            return BigInteger.Zero;
        var bits_new = new Array(this._bits.length - shift_units);
        if (shift == 0) {
            for (var i = 0; i < bits_new.length; i++)
                bits_new[i] = this._bits[i + shift_units];
        }
        else {
            for (var i = 0; i < bits_new.length; i++)
                bits_new[i] = (this._bits[i + shift_units] >>> shift | this._bits[i + shift_units + 1] << (DB - shift)) & DM;
        }
        return BigInteger.create(this._sign, bits_new, true);
    };
    BigInteger.prototype.sign = function () {
        return this._sign;
    };
    BigInteger.subtract = function (x, y) {
        var bi_x = typeof x === "number" ? new BigInteger(x) : x;
        var bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_x._sign == 0)
            return bi_y.negate();
        if (bi_y._sign == 0)
            return bi_x;
        if ((bi_x._sign > 0) != (bi_y._sign > 0))
            return BigInteger.add(bi_x, bi_y.negate());
        var c = BigInteger.compareAbs(bi_x, bi_y);
        if (c == 0)
            return BigInteger.Zero;
        if (c < 0)
            return BigInteger.subtract(bi_y, bi_x).negate();
        var bits_r = new Array();
        BigInteger.subtractTo(bi_x._bits, bi_y._bits, bits_r);
        return BigInteger.create(bi_x._sign, bits_r, true);
    };
    BigInteger.prototype.subtract = function (other) {
        return BigInteger.subtract(this, other);
    };
    BigInteger.subtractTo = function (x, y, r) {
        if (r == null)
            r = [];
        var l = Math.min(x.length, y.length);
        var c = 0, i = 0;
        while (i < l) {
            c += x[i] - y[i];
            r[i++] = c & DM;
            c >>= DB;
        }
        if (x.length < y.length)
            while (i < y.length) {
                c -= y[i];
                r[i++] = c & DM;
                c >>= DB;
            }
        else
            while (i < x.length) {
                c += x[i];
                r[i++] = c & DM;
                c >>= DB;
            }
        return c < 0;
    };
    BigInteger.prototype.testBit = function (n) {
        var units = Math.floor(n / DB);
        if (this._bits.length <= units)
            return false;
        return (this._bits[units] & (1 << (n %= DB))) != 0;
    };
    BigInteger.prototype.toInt32 = function () {
        if (this._sign == 0)
            return 0;
        if (this._bits.length == 1)
            return this._bits[0] * this._sign;
        return ((this._bits[0] | this._bits[1] * DV) & 0x7fffffff) * this._sign;
    };
    BigInteger.prototype.toString = function (radix) {
        if (radix === void 0) { radix = 10; }
        if (this._sign == 0)
            return "0";
        if (radix < 2 || radix > 36)
            throw new RangeError();
        var s = "";
        for (var bi = this; bi._sign != 0;) {
            var r = BigInteger.divRem(bi, radix);
            var rem = Math.abs(r.remainder.toInt32());
            if (rem < 10)
                rem += 0x30;
            else
                rem += 0x57;
            s = String.fromCharCode(rem) + s;
            bi = r.result;
        }
        if (this._sign < 0)
            s = "-" + s;
        return s;
    };
    BigInteger.prototype.toUint8Array = function (littleEndian, length) {
        if (littleEndian === void 0) { littleEndian = true; }
        if (this._sign == 0)
            return new Uint8Array(length || 1);
        var cb = Math.ceil(this._bits.length * DB / 8);
        var array = new Uint8Array(length || cb);
        for (var i = 0; i < array.length; i++) {
            var offset = littleEndian ? i : array.length - 1 - i;
            var cbits = i * 8;
            var cu = Math.floor(cbits / DB);
            cbits %= DB;
            if (DB - cbits < 8)
                array[offset] = (this._bits[cu] >>> cbits | this._bits[cu + 1] << (DB - cbits)) & 0xff;
            else
                array[offset] = this._bits[cu] >>> cbits & 0xff;
        }
        length = length || BigInteger.getActualLength(array);
        if (length < array.length)
            array = array.subarray(0, length);
        return array;
    };
    return BigInteger;
}());
exports.BigInteger = BigInteger;
