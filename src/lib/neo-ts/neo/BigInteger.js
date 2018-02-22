import { Uint64 } from './Uint64';
const DB = 26;
const DM = (1 << DB) - 1;
const DV = DM + 1;
let _minusone, _one, _zero;
export class BigInteger {
    constructor(value) {
        this._sign = 0;
        this._bits = new Array();
        if (typeof value === "number") {
            if (!isFinite(value) || isNaN(value))
                throw new RangeError();
            let parts = BigInteger.getDoubleParts(value);
            if (parts.man.equals(Uint64.Zero) || parts.exp <= -64)
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
                let units = Math.ceil((parts.exp + 64) / DB);
                let cu = Math.ceil(parts.exp / DB);
                let cbit = cu * DB - parts.exp;
                for (let i = cu; i < units; i++)
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
    static get MinusOne() { return _minusone || (_minusone = new BigInteger(-1)); }
    static get One() { return _one || (_one = new BigInteger(1)); }
    static get Zero() { return _zero || (_zero = new BigInteger(0)); }
    static add(x, y) {
        let bi_x = typeof x === "number" ? new BigInteger(x) : x;
        let bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_x._sign == 0)
            return bi_y;
        if (bi_y._sign == 0)
            return bi_x;
        if ((bi_x._sign > 0) != (bi_y._sign > 0))
            return BigInteger.subtract(bi_x, bi_y.negate());
        let bits_r = new Array();
        BigInteger.addTo(bi_x._bits, bi_y._bits, bits_r);
        return BigInteger.create(bi_x._sign, bits_r);
    }
    add(other) {
        return BigInteger.add(this, other);
    }
    static addTo(x, y, r) {
        if (x.length < y.length) {
            let t = x;
            x = y;
            y = t;
        }
        let c = 0, i = 0;
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
    }
    bitLength() {
        let l = this._bits.length;
        if (l == 0)
            return 0;
        return --l * DB + BigInteger.bitLengthInternal(this._bits[l]);
    }
    static bitLengthInternal(w) {
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
    }
    clamp() {
        let l = this._bits.length;
        while (l > 0 && (this._bits[--l] | 0) == 0)
            this._bits.pop();
        while (l > 0)
            this._bits[--l] |= 0;
        if (this._bits.length == 0)
            this._sign = 0;
    }
    static compare(x, y) {
        let bi_x = typeof x === "number" ? new BigInteger(x) : x;
        let bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_x._sign >= 0 && bi_y._sign < 0)
            return +1;
        if (bi_x._sign < 0 && bi_y._sign >= 0)
            return -1;
        let c = BigInteger.compareAbs(bi_x, bi_y);
        return bi_x._sign < 0 ? -c : c;
    }
    static compareAbs(x, y) {
        if (x._bits.length > y._bits.length)
            return +1;
        if (x._bits.length < y._bits.length)
            return -1;
        for (let i = x._bits.length - 1; i >= 0; i--)
            if (x._bits[i] > y._bits[i])
                return +1;
            else if (x._bits[i] < y._bits[i])
                return -1;
        return 0;
    }
    compareTo(other) {
        return BigInteger.compare(this, other);
    }
    static create(sign, bits, clamp = false) {
        let bi = Object.create(BigInteger.prototype);
        bi._sign = sign;
        bi._bits = bits;
        if (clamp)
            bi.clamp();
        return bi;
    }
    static divide(x, y) {
        let bi_x = typeof x === "number" ? new BigInteger(x) : x;
        let bi_y = typeof y === "number" ? new BigInteger(y) : y;
        return BigInteger.divRem(bi_x, bi_y).result;
    }
    divide(other) {
        return BigInteger.divide(this, other);
    }
    static divRem(x, y) {
        let bi_x = typeof x === "number" ? new BigInteger(x) : x;
        let bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_y._sign == 0)
            throw new RangeError();
        if (bi_x._sign == 0)
            return { result: BigInteger.Zero, remainder: BigInteger.Zero };
        if (bi_y._sign == 1 && bi_y._bits == null)
            return { result: bi_x, remainder: BigInteger.Zero };
        if (bi_y._sign == -1 && bi_y._bits == null)
            return { result: bi_x.negate(), remainder: BigInteger.Zero };
        let sign_result = (bi_x._sign > 0) == (bi_y._sign > 0) ? +1 : -1;
        let c = BigInteger.compareAbs(bi_x, bi_y);
        if (c == 0)
            return { result: sign_result > 0 ? BigInteger.One : BigInteger.MinusOne, remainder: BigInteger.Zero };
        if (c < 0)
            return { result: BigInteger.Zero, remainder: bi_x };
        let bits_result = new Array();
        let bits_rem = new Array();
        Array.copy(bi_x._bits, 0, bits_rem, 0, bi_x._bits.length);
        let df = bi_y._bits[bi_y._bits.length - 1];
        for (let i = bi_x._bits.length - 1; i >= bi_y._bits.length - 1; i--) {
            let offset = i - bi_y._bits.length + 1;
            let d = bits_rem[i] + (bits_rem[i + 1] || 0) * DV;
            let max = Math.floor(d / df);
            if (max > DM)
                max = DM;
            let min = 0;
            while (min != max) {
                let bits_sub = new Array(offset + bi_y._bits.length);
                for (let i = 0; i < offset; i++)
                    bits_sub[i] = 0;
                bits_result[offset] = Math.ceil((min + max) / 2);
                BigInteger.multiplyTo(bi_y._bits, [bits_result[offset]], bits_sub, offset);
                if (BigInteger.subtractTo(bits_rem, bits_sub))
                    max = bits_result[offset] - 1;
                else
                    min = bits_result[offset];
            }
            let bits_sub = new Array(offset + bi_y._bits.length);
            for (let i = 0; i < offset; i++)
                bits_sub[i] = 0;
            bits_result[offset] = min;
            BigInteger.multiplyTo(bi_y._bits, [bits_result[offset]], bits_sub, offset);
            BigInteger.subtractTo(bits_rem, bits_sub, bits_rem);
        }
        return { result: BigInteger.create(sign_result, bits_result, true), remainder: BigInteger.create(bi_x._sign, bits_rem, true) };
    }
    static equals(x, y) {
        let bi_x = typeof x === "number" ? new BigInteger(x) : x;
        let bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_x._sign != bi_y._sign)
            return false;
        if (bi_x._bits.length != bi_y._bits.length)
            return false;
        for (let i = 0; i < bi_x._bits.length; i++)
            if (bi_x._bits[i] != bi_y._bits[i])
                return false;
        return true;
    }
    equals(other) {
        return BigInteger.equals(this, other);
    }
    static fromString(str, radix = 10) {
        let bi = Object.create(BigInteger.prototype);
        bi.fromString(str, radix);
        return bi;
    }
    fromString(str, radix = 10) {
        if (radix < 2 || radix > 36)
            throw new RangeError();
        if (str.length == 0) {
            this._sign == 0;
            this._bits = [];
            return;
        }
        let bits_radix = [radix];
        let bits_a = [0];
        let first = str.charCodeAt(0);
        let withsign = first == 0x2b || first == 0x2d;
        this._sign = first == 0x2d ? -1 : +1;
        this._bits = [];
        for (let i = withsign ? 1 : 0; i < str.length; i++) {
            bits_a[0] = str.charCodeAt(i);
            if (bits_a[0] >= 0x30 && bits_a[0] <= 0x39)
                bits_a[0] -= 0x30;
            else if (bits_a[0] >= 0x41 && bits_a[0] <= 0x5a)
                bits_a[0] -= 0x37;
            else if (bits_a[0] >= 0x61 && bits_a[0] <= 0x7a)
                bits_a[0] -= 0x57;
            else
                throw new RangeError();
            let bits_temp = new Array();
            BigInteger.multiplyTo(this._bits, bits_radix, bits_temp);
            BigInteger.addTo(bits_temp, bits_a, this._bits);
        }
        this.clamp();
    }
    static fromUint8Array(arr, sign = 1, littleEndian = true) {
        let bi = Object.create(BigInteger.prototype);
        bi.fromUint8Array(arr, sign, littleEndian);
        return bi;
    }
    fromUint8Array(arr, sign = 1, littleEndian = true) {
        if (!littleEndian) {
            let arr_new = new Uint8Array(arr.length);
            for (let i = 0; i < arr.length; i++)
                arr_new[arr.length - 1 - i] = arr[i];
            arr = arr_new;
        }
        let actual_length = BigInteger.getActualLength(arr);
        let bits = actual_length * 8;
        let units = Math.ceil(bits / DB);
        this._bits = [];
        for (let i = 0; i < units; i++) {
            let cb = i * DB;
            let cu = Math.floor(cb / 8);
            cb %= 8;
            this._bits[i] = ((arr[cu] | arr[cu + 1] << 8 | arr[cu + 2] << 16 | arr[cu + 3] << 24) >>> cb) & DM;
        }
        this._sign = sign < 0 ? -1 : +1;
        this.clamp();
    }
    fromUint64(i, sign) {
        while (i.bits[0] != 0 || i.bits[1] != 0) {
            this._bits.push(i.toUint32() & DM);
            i = i.rightShift(DB);
        }
        this._sign = sign;
        this.clamp();
    }
    static getActualLength(arr) {
        let actual_length = arr.length;
        for (let i = arr.length - 1; i >= 0; i--)
            if (arr[i] != 0) {
                actual_length = i + 1;
                break;
            }
        return actual_length;
    }
    static getDoubleParts(dbl) {
        let uu = new Uint32Array(2);
        new Float64Array(uu.buffer)[0] = dbl;
        let result = {
            sign: 1 - ((uu[1] >>> 30) & 2),
            man: new Uint64(uu[0], uu[1] & 0x000FFFFF),
            exp: (uu[1] >>> 20) & 0x7FF,
            fFinite: true
        };
        if (result.exp == 0) {
            if (!result.man.equals(Uint64.Zero))
                result.exp = -1074;
        }
        else if (result.exp == 0x7FF) {
            result.fFinite = false;
        }
        else {
            result.man = result.man.or(new Uint64(0, 0x00100000));
            result.exp -= 1075;
        }
        return result;
    }
    getLowestSetBit() {
        if (this._sign == 0)
            return -1;
        let w = 0;
        while (this._bits[w] == 0)
            w++;
        for (let x = 0; x < DB; x++)
            if ((this._bits[w] & 1 << x) > 0)
                return x + w * DB;
    }
    isEven() {
        if (this._sign == 0)
            return true;
        return (this._bits[0] & 1) == 0;
    }
    isZero() {
        return this._sign == 0;
    }
    leftShift(shift) {
        if (shift == 0)
            return this;
        let shift_units = Math.floor(shift / DB);
        shift %= DB;
        let bits_new = new Array(this._bits.length + shift_units);
        if (shift == 0) {
            for (let i = 0; i < this._bits.length; i++)
                bits_new[i + shift_units] = this._bits[i];
        }
        else {
            for (let i = shift_units; i < bits_new.length; i++)
                bits_new[i] = (this._bits[i - shift_units] << shift | this._bits[i - shift_units - 1] >>> (DB - shift)) & DM;
            bits_new[bits_new.length] = this._bits[this._bits.length - 1] >>> (DB - shift) & DM;
        }
        return BigInteger.create(this._sign, bits_new, true);
    }
    static mod(x, y) {
        let bi_x = typeof x === "number" ? new BigInteger(x) : x;
        let bi_y = typeof y === "number" ? new BigInteger(y) : y;
        let bi_new = BigInteger.divRem(bi_x, bi_y).remainder;
        if (bi_new._sign < 0)
            bi_new = BigInteger.add(bi_new, bi_y);
        return bi_new;
    }
    mod(other) {
        return BigInteger.mod(this, other);
    }
    static modInverse(value, modulus) {
        let a = typeof value === "number" ? new BigInteger(value) : value;
        let n = typeof modulus === "number" ? new BigInteger(modulus) : modulus;
        let i = n, v = BigInteger.Zero, d = BigInteger.One;
        while (a._sign > 0) {
            let t = BigInteger.divRem(i, a);
            let x = d;
            i = a;
            a = t.remainder;
            d = v.subtract(t.result.multiply(x));
            v = x;
        }
        return BigInteger.mod(v, n);
    }
    modInverse(modulus) {
        return BigInteger.modInverse(this, modulus);
    }
    static modPow(value, exponent, modulus) {
        let bi_v = typeof value === "number" ? new BigInteger(value) : value;
        let bi_e = typeof exponent === "number" ? new BigInteger(exponent) : exponent;
        let bi_m = typeof modulus === "number" ? new BigInteger(modulus) : modulus;
        if (bi_e._sign < 0 || bi_m._sign == 0)
            throw new RangeError();
        if (Math.abs(bi_m._sign) == 1 && bi_m._bits == null)
            return BigInteger.Zero;
        let h = bi_e.bitLength();
        let bi_new = BigInteger.One;
        for (let i = 0; i < h; i++) {
            if (i > 0)
                bi_v = BigInteger.multiply(bi_v, bi_v);
            bi_v = bi_v.remainder(bi_m);
            if (bi_e.testBit(i))
                bi_new = BigInteger.multiply(bi_v, bi_new).remainder(bi_m);
        }
        if (bi_new._sign < 0)
            bi_new = BigInteger.add(bi_new, bi_m);
        return bi_new;
    }
    modPow(exponent, modulus) {
        return BigInteger.modPow(this, exponent, modulus);
    }
    static multiply(x, y) {
        let bi_x = typeof x === "number" ? new BigInteger(x) : x;
        let bi_y = typeof y === "number" ? new BigInteger(y) : y;
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
        let bits_r = new Array();
        BigInteger.multiplyTo(bi_x._bits, bi_y._bits, bits_r);
        return BigInteger.create((bi_x._sign > 0) == (bi_y._sign > 0) ? +1 : -1, bits_r);
    }
    multiply(other) {
        return BigInteger.multiply(this, other);
    }
    static multiplyTo(x, y, r, offset = 0) {
        if (x.length > y.length) {
            let t = x;
            x = y;
            y = t;
        }
        for (let i = x.length + y.length - 2; i >= 0; i--)
            r[i + offset] = 0;
        for (let i = 0; i < x.length; i++) {
            if (x[i] == 0)
                continue;
            for (let j = 0; j < y.length; j++) {
                let c = x[i] * y[j];
                if (c == 0)
                    continue;
                let k = i + j;
                do {
                    c += r[k + offset] || 0;
                    r[k + offset] = c & DM;
                    c = Math.floor(c / DV);
                    k++;
                } while (c > 0);
            }
        }
    }
    negate() {
        return BigInteger.create(-this._sign, this._bits);
    }
    static parse(str) {
        return BigInteger.fromString(str);
    }
    static pow(value, exponent) {
        let bi_v = typeof value === "number" ? new BigInteger(value) : value;
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
        let h = BigInteger.bitLengthInternal(exponent);
        let bi_new = BigInteger.One;
        for (let i = 0; i < h; i++) {
            let e = 1 << i;
            if (e > 1)
                bi_v = BigInteger.multiply(bi_v, bi_v);
            if ((exponent & e) != 0)
                bi_new = BigInteger.multiply(bi_v, bi_new);
        }
        return bi_new;
    }
    pow(exponent) {
        return BigInteger.pow(this, exponent);
    }
    static random(bitLength, rng) {
        if (bitLength == 0)
            return BigInteger.Zero;
        let bytes = new Uint8Array(Math.ceil(bitLength / 8));
        if (rng == null) {
            for (let i = 0; i < bytes.length; i++)
                bytes[i] = Math.random() * 256;
        }
        else {
            rng.getRandomValues(bytes);
        }
        bytes[bytes.length - 1] &= 0xff >>> (8 - bitLength % 8);
        return new BigInteger(bytes);
    }
    static remainder(x, y) {
        let bi_x = typeof x === "number" ? new BigInteger(x) : x;
        let bi_y = typeof y === "number" ? new BigInteger(y) : y;
        return BigInteger.divRem(bi_x, bi_y).remainder;
    }
    remainder(other) {
        return BigInteger.remainder(this, other);
    }
    rightShift(shift) {
        if (shift == 0)
            return this;
        let shift_units = Math.floor(shift / DB);
        shift %= DB;
        if (this._bits.length <= shift_units)
            return BigInteger.Zero;
        let bits_new = new Array(this._bits.length - shift_units);
        if (shift == 0) {
            for (let i = 0; i < bits_new.length; i++)
                bits_new[i] = this._bits[i + shift_units];
        }
        else {
            for (let i = 0; i < bits_new.length; i++)
                bits_new[i] = (this._bits[i + shift_units] >>> shift | this._bits[i + shift_units + 1] << (DB - shift)) & DM;
        }
        return BigInteger.create(this._sign, bits_new, true);
    }
    sign() {
        return this._sign;
    }
    static subtract(x, y) {
        let bi_x = typeof x === "number" ? new BigInteger(x) : x;
        let bi_y = typeof y === "number" ? new BigInteger(y) : y;
        if (bi_x._sign == 0)
            return bi_y.negate();
        if (bi_y._sign == 0)
            return bi_x;
        if ((bi_x._sign > 0) != (bi_y._sign > 0))
            return BigInteger.add(bi_x, bi_y.negate());
        let c = BigInteger.compareAbs(bi_x, bi_y);
        if (c == 0)
            return BigInteger.Zero;
        if (c < 0)
            return BigInteger.subtract(bi_y, bi_x).negate();
        let bits_r = new Array();
        BigInteger.subtractTo(bi_x._bits, bi_y._bits, bits_r);
        return BigInteger.create(bi_x._sign, bits_r, true);
    }
    subtract(other) {
        return BigInteger.subtract(this, other);
    }
    static subtractTo(x, y, r) {
        if (r == null)
            r = [];
        let l = Math.min(x.length, y.length);
        let c = 0, i = 0;
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
    }
    testBit(n) {
        let units = Math.floor(n / DB);
        if (this._bits.length <= units)
            return false;
        return (this._bits[units] & (1 << (n %= DB))) != 0;
    }
    toInt32() {
        if (this._sign == 0)
            return 0;
        if (this._bits.length == 1)
            return this._bits[0] * this._sign;
        return ((this._bits[0] | this._bits[1] * DV) & 0x7fffffff) * this._sign;
    }
    toString(radix = 10) {
        if (this._sign == 0)
            return "0";
        if (radix < 2 || radix > 36)
            throw new RangeError();
        let s = "";
        for (let bi = this; bi._sign != 0;) {
            let r = BigInteger.divRem(bi, radix);
            let rem = Math.abs(r.remainder.toInt32());
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
    }
    toUint8Array(littleEndian = true, length) {
        if (this._sign == 0)
            return new Uint8Array(length || 1);
        let cb = Math.ceil(this._bits.length * DB / 8);
        let array = new Uint8Array(length || cb);
        for (let i = 0; i < array.length; i++) {
            let offset = littleEndian ? i : array.length - 1 - i;
            let cbits = i * 8;
            let cu = Math.floor(cbits / DB);
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
    }
}
//# sourceMappingURL=BigInteger.js.map