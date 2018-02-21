import { UintVariable } from './UintVariable';
let _zero;
export class Uint256 extends UintVariable {
    static get Zero() { return _zero || (_zero = new Uint256()); }
    constructor(value) {
        if (value == null)
            value = new ArrayBuffer(32);
        if (value.byteLength != 32)
            throw new RangeError();
        super(new Uint32Array(value));
    }
    static parse(str) {
        if (str.length != 64)
            throw new RangeError();
        let x = str.hexToBytes();
        let y = new Uint8Array(x.length);
        for (let i = 0; i < y.length; i++)
            y[i] = x[x.length - i - 1];
        return new Uint256(y.buffer);
    }
}
//# sourceMappingURL=Uint256.js.map