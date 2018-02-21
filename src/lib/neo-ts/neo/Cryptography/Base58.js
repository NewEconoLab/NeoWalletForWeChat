"use strict";
exports.__esModule = true;
var index_1 = require("../../index");
var Base58 = /** @class */ (function () {
    function Base58() {
    }
    Base58.decode = function (input) {
        var bi = index_1.BigInteger.Zero;
        for (var i = input.length - 1; i >= 0; i--) {
            var index = Base58.Alphabet.indexOf(input[i]);
            if (index == -1)
                throw new RangeError();
            bi = index_1.BigInteger.add(bi, index_1.BigInteger.multiply(index_1.BigInteger.pow(Base58.Alphabet.length, input.length - 1 - i), index));
        }
        var bytes = bi.toUint8Array();
        var leadingZeros = 0;
        for (var i = 0; i < input.length && input[i] == Base58.Alphabet[0]; i++) {
            leadingZeros++;
        }
        var tmp = new Uint8Array(bytes.length + leadingZeros);
        for (var i = 0; i < bytes.length; i++)
            tmp[i + leadingZeros] = bytes[bytes.length - 1 - i];
        return tmp;
    };
    Base58.encode = function (input) {
        var value = index_1.BigInteger.fromUint8Array(input, 1, false);
        var s = "";
        while (!value.isZero()) {
            var r = index_1.BigInteger.divRem(value, Base58.Alphabet.length);
            s = Base58.Alphabet[r.remainder.toInt32()] + s;
            value = r.result;
        }
        for (var i = 0; i < input.length; i++) {
            if (input[i] == 0)
                s = Base58.Alphabet[0] + s;
            else
                break;
        }
        return s;
    };
    Base58.Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    return Base58;
}());
exports.Base58 = Base58;
