"use strict";
exports.__esModule = true;
var SeekOrigin;
(function (SeekOrigin) {
    SeekOrigin[SeekOrigin["Begin"] = 0] = "Begin";
    SeekOrigin[SeekOrigin["Current"] = 1] = "Current";
    SeekOrigin[SeekOrigin["End"] = 2] = "End";
})(SeekOrigin = exports.SeekOrigin || (exports.SeekOrigin = {}));
var Stream = /** @class */ (function () {
    function Stream() {
        this._array = new Uint8Array(1);
    }
    Stream.prototype.close = function () { };
    Stream.prototype.readByte = function () {
        if (this.read(this._array.buffer, 0, 1) == 0)
            return -1;
        return this._array[0];
    };
    Stream.prototype.writeByte = function (value) {
        if (value < 0 || value > 255)
            throw new RangeError();
        this._array[0] = value;
        this.write(this._array.buffer, 0, 1);
    };
    return Stream;
}());
exports.Stream = Stream;
