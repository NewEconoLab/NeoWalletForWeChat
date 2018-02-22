import { UintVariable } from './UintVariable';
let _max, _min;
export class Uint64 extends UintVariable {
    static get MaxValue() { return _max || (_max = new Uint64(0xffffffff, 0xffffffff)); }
    static get MinValue() { return _min || (_min = new Uint64()); }
    static get Zero() { return Uint64.MinValue; }
    constructor(low = 0, high = 0) {
        super([low, high]);
    }
    add(other) {
        let low = this._bits[0] + other._bits[0];
        let high = this._bits[1] + other._bits[1] + (low > 0xffffffff ? 1 : 0);
        return new Uint64(low, high);
    }
    and(other) {
        if (typeof other === "number") {
            return this.and(new Uint64(other));
        }
        else {
            let bits = new Uint32Array(this._bits.length);
            for (let i = 0; i < bits.length; i++)
                bits[i] = this._bits[i] & other._bits[i];
            return new Uint64(bits[0], bits[1]);
        }
    }
    leftShift(shift) {
        if (shift == 0)
            return this;
        let shift_units = shift >>> 5;
        shift = shift & 0x1f;
        let bits = new Uint32Array(this._bits.length);
        for (let i = shift_units; i < bits.length; i++)
            if (shift == 0)
                bits[i] = this._bits[i - shift_units];
            else
                bits[i] = this._bits[i - shift_units] << shift | this._bits[i - shift_units - 1] >>> (32 - shift);
        return new Uint64(bits[0], bits[1]);
    }
    not() {
        let bits = new Uint32Array(this._bits.length);
        for (let i = 0; i < bits.length; i++)
            bits[i] = ~this._bits[i];
        return new Uint64(bits[0], bits[1]);
    }
    or(other) {
        if (typeof other === "number") {
            return this.or(new Uint64(other));
        }
        else {
            let bits = new Uint32Array(this._bits.length);
            for (let i = 0; i < bits.length; i++)
                bits[i] = this._bits[i] | other._bits[i];
            return new Uint64(bits[0], bits[1]);
        }
    }
    static parse(buffer) {
        let array = new Uint32Array(buffer);
        return new Uint64(array[0], array[1]);
    }
    rightShift(shift) {
        if (shift == 0)
            return this;
        let shift_units = shift >>> 5;
        shift = shift & 0x1f;
        let bits = new Uint32Array(this._bits.length);
        for (let i = 0; i < bits.length - shift_units; i++)
            if (shift == 0)
                bits[i] = this._bits[i + shift_units];
            else
                bits[i] = this._bits[i + shift_units] >>> shift | this._bits[i + shift_units + 1] << (32 - shift);
        return new Uint64(bits[0], bits[1]);
    }
    subtract(other) {
        let low = this._bits[0] - other._bits[0];
        let high = this._bits[1] - other._bits[1] - (this._bits[0] < other._bits[0] ? 1 : 0);
        return new Uint64(low, high);
    }
    toInt32() {
        return this._bits[0] | 0;
    }
    toNumber() {
        return this._bits[0] + this._bits[1] * Math.pow(2, 32);
    }
    toUint32() {
        return this._bits[0];
    }
    xor(other) {
        if (typeof other === "number") {
            return this.xor(new Uint64(other));
        }
        else {
            let bits = new Uint32Array(this._bits.length);
            for (let i = 0; i < bits.length; i++)
                bits[i] = this._bits[i] ^ other._bits[i];
            return new Uint64(bits[0], bits[1]);
        }
    }
}
//# sourceMappingURL=Uint64.js.map