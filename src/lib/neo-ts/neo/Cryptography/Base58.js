"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BigInteger_1 = require("../BigInteger");
class Base58 {
    static decode(input) {
        let bi = BigInteger_1.BigInteger.Zero;
        for (let i = input.length - 1; i >= 0; i--) {
            let index = Base58.Alphabet.indexOf(input[i]);
            if (index == -1)
                throw new RangeError();
            bi = BigInteger_1.BigInteger.add(bi, BigInteger_1.BigInteger.multiply(BigInteger_1.BigInteger.pow(Base58.Alphabet.length, input.length - 1 - i), index));
        }
        let bytes = bi.toUint8Array();
        let leadingZeros = 0;
        for (let i = 0; i < input.length && input[i] == Base58.Alphabet[0]; i++) {
            leadingZeros++;
        }
        let tmp = new Uint8Array(bytes.length + leadingZeros);
        for (let i = 0; i < bytes.length; i++)
            tmp[i + leadingZeros] = bytes[bytes.length - 1 - i];
        return tmp;
    }
    static encode(input) {
        let value = BigInteger_1.BigInteger.fromUint8Array(input, 1, false);
        let s = "";
        while (!value.isZero()) {
            let r = BigInteger_1.BigInteger.divRem(value, Base58.Alphabet.length);
            s = Base58.Alphabet[r.remainder.toInt32()] + s;
            value = r.result;
        }
        for (let i = 0; i < input.length; i++) {
            if (input[i] == 0)
                s = Base58.Alphabet[0] + s;
            else
                break;
        }
        return s;
    }
}
Base58.Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
exports.Base58 = Base58;
//# sourceMappingURL=Base58.js.map