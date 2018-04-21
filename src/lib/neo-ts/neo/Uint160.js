"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UintVariable_1 = require("./UintVariable");
const UintHelper = require("../Helper/UintHelper");
let _zero;
class Uint160 extends UintVariable_1.UintVariable {
    static get Zero() { return _zero || (_zero = new Uint160()); }
    constructor(value) {
        if (value == null)
            value = new ArrayBuffer(20);
        if (value.byteLength != 20)
            throw new RangeError();
        super(new Uint32Array(value));
    }
    static parse(str) {
        if (str.length != 40)
            throw new RangeError();
        let x = UintHelper.hexToBytes(str);
        let y = new Uint8Array(x.length);
        for (let i = 0; i < y.length; i++)
            y[i] = x[x.length - i - 1];
        return new Uint160(y.buffer);
    }
}
exports.Uint160 = Uint160;
//# sourceMappingURL=Uint160.js.map