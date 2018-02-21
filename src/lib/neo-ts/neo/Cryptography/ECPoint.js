import { ECFieldElement } from './index';
import { BigInteger } from '../BigInteger';
export class ECPoint {
    constructor(x, y, curve) {
        this.x = x;
        this.y = y;
        this.curve = curve;
        if ((x == null) != (y == null))
            throw new RangeError("Exactly one of the field elements is null");
    }
    static add(x, y) {
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
        let gamma = y.y.subtract(x.y).divide(y.x.subtract(x.x));
        let x3 = gamma.square().subtract(x.x).subtract(y.x);
        let y3 = gamma.multiply(x.x.subtract(x3)).subtract(x.y);
        return new ECPoint(x3, y3, x.curve);
    }
    compareTo(other) {
        if (this === other)
            return 0;
        let result = this.x.compareTo(other.x);
        if (result != 0)
            return result;
        return this.y.compareTo(other.y);
    }
    static decodePoint(encoded, curve) {
        let p;
        let expectedLength = Math.ceil(curve.Q.bitLength() / 8);
        switch (encoded[0]) {
            case 0x00:
                {
                    if (encoded.length != 1)
                        throw new RangeError("Incorrect length for infinity encoding");
                    p = curve.Infinity;
                    break;
                }
            case 0x02:
            case 0x03:
                {
                    if (encoded.length != (expectedLength + 1))
                        throw new RangeError("Incorrect length for compressed encoding");
                    let yTilde = encoded[0] & 1;
                    let X1 = BigInteger.fromUint8Array(encoded.subarray(1), 1, false);
                    p = ECPoint.decompressPoint(yTilde, X1, curve);
                    break;
                }
            case 0x04:
            case 0x06:
            case 0x07:
                {
                    if (encoded.length != (2 * expectedLength + 1))
                        throw new RangeError("Incorrect length for uncompressed/hybrid encoding");
                    let X1 = BigInteger.fromUint8Array(encoded.subarray(1, 1 + expectedLength), 1, false);
                    let Y1 = BigInteger.fromUint8Array(encoded.subarray(1 + expectedLength), 1, false);
                    p = new ECPoint(new ECFieldElement(X1, curve), new ECFieldElement(Y1, curve), curve);
                    break;
                }
            default:
                throw new RangeError("Invalid point encoding " + encoded[0]);
        }
        return p;
    }
    static decompressPoint(yTilde, X1, curve) {
        let x = new ECFieldElement(X1, curve);
        let alpha = x.multiply(x.square().add(curve.A)).add(curve.B);
        let beta = alpha.sqrt();
        if (beta == null)
            throw new RangeError("Invalid point compression");
        let betaValue = beta.value;
        let bit0 = betaValue.isEven() ? 0 : 1;
        if (bit0 != yTilde) {
            beta = new ECFieldElement(curve.Q.subtract(betaValue), curve);
        }
        return new ECPoint(x, beta, curve);
    }
    static deserializeFrom(reader, curve) {
        let expectedLength = Math.floor((curve.Q.bitLength() + 7) / 8);
        let array = new Uint8Array(1 + expectedLength * 2);
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
    }
    encodePoint(commpressed) {
        if (this.isInfinity())
            return new Uint8Array(1);
        let data;
        if (commpressed) {
            data = new Uint8Array(33);
        }
        else {
            data = new Uint8Array(65);
            let yBytes = this.y.value.toUint8Array();
            for (let i = 0; i < yBytes.length; i++)
                data[65 - yBytes.length + i] = yBytes[yBytes.length - 1 - i];
        }
        let xBytes = this.x.value.toUint8Array();
        for (let i = 0; i < xBytes.length; i++)
            data[33 - xBytes.length + i] = xBytes[xBytes.length - 1 - i];
        data[0] = commpressed ? this.y.value.isEven() ? 0x02 : 0x03 : 0x04;
        return data;
    }
    equals(other) {
        if (this === other)
            return true;
        if (null === other)
            return false;
        if (this.isInfinity && other.isInfinity)
            return true;
        if (this.isInfinity || other.isInfinity)
            return false;
        return this.x.equals(other.x) && this.y.equals(other.y);
    }
    static fromUint8Array(arr, curve) {
        switch (arr.length) {
            case 33:
            case 65:
                return ECPoint.decodePoint(arr, curve);
            case 64:
            case 72:
                {
                    let arr_new = new Uint8Array(65);
                    arr_new[0] = 0x04;
                    arr_new.set(arr.subarray(arr.length - 64), 1);
                    return ECPoint.decodePoint(arr_new, curve);
                }
            case 96:
            case 104:
                {
                    let arr_new = new Uint8Array(65);
                    arr_new[0] = 0x04;
                    arr_new.set(arr.subarray(arr.length - 96, arr.length - 32), 1);
                    return ECPoint.decodePoint(arr_new, curve);
                }
            default:
                throw new RangeError();
        }
    }
    isInfinity() {
        return this.x == null && this.y == null;
    }
    static multiply(p, n) {
        let k = n instanceof Uint8Array ? BigInteger.fromUint8Array(n, 1, false) : n;
        if (p.isInfinity())
            return p;
        if (k.isZero())
            return p.curve.Infinity;
        let m = k.bitLength();
        let width;
        let reqPreCompLen;
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
        let preCompLen = 1;
        let preComp = [p];
        let twiceP = p.twice();
        if (preCompLen < reqPreCompLen) {
            let oldPreComp = preComp;
            preComp = new Array(reqPreCompLen);
            for (let i = 0; i < preCompLen; i++)
                preComp[i] = oldPreComp[i];
            for (let i = preCompLen; i < reqPreCompLen; i++) {
                preComp[i] = ECPoint.add(twiceP, preComp[i - 1]);
            }
        }
        let wnaf = ECPoint.windowNaf(width, k);
        let l = wnaf.length;
        let q = p.curve.Infinity;
        for (let i = l - 1; i >= 0; i--) {
            q = q.twice();
            if (wnaf[i] != 0) {
                if (wnaf[i] > 0) {
                    q = ECPoint.add(q, preComp[Math.floor((wnaf[i] - 1) / 2)]);
                }
                else {
                    q = ECPoint.subtract(q, preComp[Math.floor((-wnaf[i] - 1) / 2)]);
                }
            }
        }
        return q;
    }
    negate() {
        return new ECPoint(this.x, this.y.negate(), this.curve);
    }
    static parse(str, curve) {
        return ECPoint.decodePoint(str.hexToBytes(), curve);
    }
    static subtract(x, y) {
        if (y.isInfinity())
            return x;
        return ECPoint.add(x, y.negate());
    }
    toString() {
        return this.encodePoint(true).toHexString();
    }
    twice() {
        if (this.isInfinity())
            return this;
        if (this.y.value.sign() == 0)
            return this.curve.Infinity;
        let TWO = new ECFieldElement(new BigInteger(2), this.curve);
        let THREE = new ECFieldElement(new BigInteger(3), this.curve);
        let gamma = this.x.square().multiply(THREE).add(this.curve.A).divide(this.y.multiply(TWO));
        let x3 = gamma.square().subtract(this.x.multiply(TWO));
        let y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);
        return new ECPoint(x3, y3, this.curve);
    }
    static windowNaf(width, k) {
        let wnaf = new Array(k.bitLength() + 1);
        let pow2wB = 1 << width;
        let i = 0;
        let length = 0;
        while (k.sign() > 0) {
            if (!k.isEven()) {
                let remainder = BigInteger.remainder(k, pow2wB);
                if (remainder.testBit(width - 1)) {
                    wnaf[i] = BigInteger.subtract(remainder, pow2wB).toInt32();
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
    }
}
//# sourceMappingURL=ECPoint.js.map