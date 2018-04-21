"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UintVariable_1 = require("./UintVariable");
const UintHelper = require("../Helper/UintHelper");
let _zero;
class Uint256 extends UintVariable_1.UintVariable {
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
        let x = UintHelper.hexToBytes(str);
        let y = new Uint8Array(x.length);
        for (let i = 0; i < y.length; i++)
            y[i] = x[x.length - i - 1];
        return new Uint256(y.buffer);
    }
}
exports.Uint256 = Uint256;
//# sourceMappingURL=Uint256.js.map