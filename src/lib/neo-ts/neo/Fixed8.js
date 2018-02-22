import { Uint64 } from './Uint64';
import { BigInteger } from './BigInteger';
const D = 100000000;
let _max, _minus, _min, _one, _satoshi;
export class Fixed8 {
    constructor(data) {
        this.data = data;
        if (data.bits[1] >= 0x80000000 && (data.bits[0] != 0xffffffff || data.bits[1] != 0xffffffff))
            throw new RangeError();
    }
    static get MaxValue() { return _max || (_max = new Fixed8(new Uint64(0xffffffff, 0x7fffffff))); }
    static get MinusOne() { return _minus || (_minus = new Fixed8(new Uint64(0xffffffff, 0xffffffff))); }
    static get MinValue() { return _min || (_min = new Fixed8(Uint64.MinValue)); }
    static get One() { return _one || (_one = Fixed8.fromNumber(1)); }
    static get Satoshi() { return _satoshi || (_satoshi = new Fixed8(new Uint64(1))); }
    static get Zero() { return Fixed8.MinValue; }
    add(other) {
        let result = this.data.add(other.data);
        if (result.compareTo(this.data) < 0)
            throw new Error();
        return new Fixed8(result);
    }
    compareTo(other) {
        return this.data.compareTo(other.data);
    }
    equals(other) {
        return this.data.equals(other.data);
    }
    static fromNumber(value) {
        if (value < 0)
            throw new RangeError();
        value *= D;
        if (value >= 0x8000000000000000)
            throw new RangeError();
        let array = new Uint32Array((new BigInteger(value)).toUint8Array(true, 8).buffer);
        return new Fixed8(new Uint64(array[0], array[1]));
    }
    getData() {
        return this.data;
    }
    static max(first, ...others) {
        for (let i = 0; i < others.length; i++)
            if (first.compareTo(others[i]) < 0)
                first = others[i];
        return first;
    }
    static min(first, ...others) {
        for (let i = 0; i < others.length; i++)
            if (first.compareTo(others[i]) > 0)
                first = others[i];
        return first;
    }
    static parse(str) {
        let dot = str.indexOf('.');
        let digits = dot >= 0 ? str.length - dot - 1 : 0;
        str = str.replace('.', '');
        if (digits > 8)
            str = str.substr(0, str.length - digits + 8);
        else if (digits < 8)
            for (let i = digits; i < 8; i++)
                str += '0';
        let bi = BigInteger.parse(str);
        if (bi.bitLength() > 64)
            throw new RangeError();
        return new Fixed8(Uint64.parse(bi.toUint8Array(true, 8).buffer));
    }
    subtract(other) {
        if (this.data.compareTo(other.data) < 0)
            throw new Error();
        return new Fixed8(this.data.subtract(other.data));
    }
    toString() {
        let str = this.data.toString();
        while (str.length <= 8)
            str = '0' + str;
        str = str.substr(0, str.length - 8) + '.' + str.substr(str.length - 8);
        let e = 0;
        for (let i = str.length - 1; i >= 0; i--)
            if (str[i] == '0')
                e++;
            else
                break;
        str = str.substr(0, str.length - e);
        if (str[str.length - 1] == '.')
            str = str.substr(0, str.length - 1);
        return str;
    }
    deserialize(reader) {
        this.data = reader.readUint64();
    }
    serialize(writer) {
        writer.writeUint64(this.getData());
    }
}
//# sourceMappingURL=Fixed8.js.map