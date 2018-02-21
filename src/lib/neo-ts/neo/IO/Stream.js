export var SeekOrigin;
(function (SeekOrigin) {
    SeekOrigin[SeekOrigin["Begin"] = 0] = "Begin";
    SeekOrigin[SeekOrigin["Current"] = 1] = "Current";
    SeekOrigin[SeekOrigin["End"] = 2] = "End";
})(SeekOrigin || (SeekOrigin = {}));
export class Stream {
    constructor() {
        this._array = new Uint8Array(1);
    }
    close() { }
    readByte() {
        if (this.read(this._array.buffer, 0, 1) == 0)
            return -1;
        return this._array[0];
    }
    writeByte(value) {
        if (value < 0 || value > 255)
            throw new RangeError();
        this._array[0] = value;
        this.write(this._array.buffer, 0, 1);
    }
}
//# sourceMappingURL=Stream.js.map