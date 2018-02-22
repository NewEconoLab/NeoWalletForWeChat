type Func<T, TResult> = (arg: T) => TResult;
type Action<T> = Func<T, void>;


export function slice(arrbuf:ArrayBuffer,begin: number, end = this.byteLength): ArrayBuffer {
    if (begin < 0) begin += arrbuf.byteLength;
    if (begin < 0) begin = 0;
    if (end < 0) end += arrbuf.byteLength;
    if (end > arrbuf.byteLength) end = arrbuf.byteLength;
    let length = end - begin;
    if (length < 0) length = 0;
    let src = new Uint8Array(arrbuf);
    let dst = new Uint8Array(length);
    for (let i = 0; i < length; i++)
        dst[i] = src[i + begin];
    return dst.buffer;
}

export function toHexString(uintarr:Uint8Array): string {
    let s = "";
    for (let i = 0; i < uintarr.length; i++) {
        s += (uintarr[i] >>> 4).toString(16);
        s += (uintarr[i] & 0xf).toString(16);
    }
    return s;
}

void function () {
    function fillArray<T>(value: T, start = 0, end = this.length) {
        if (start < 0) start += this.length;
        if (start < 0) start = 0;
        if (start >= this.length) return this;
        if (end < 0) end += this.length;
        if (end < 0) return this;
        if (end > this.length) end = this.length;
        for (let i = start; i < end; i++)
            this[i] = value;
        return this;
    }
    Array.prototype.fill = Array.prototype.fill || fillArray;
    Int8Array.prototype.fill = Int8Array.prototype.fill || fillArray;
    Int16Array.prototype.fill = Int16Array.prototype.fill || fillArray;
    Int32Array.prototype.fill = Int32Array.prototype.fill || fillArray;
    Uint8Array.prototype.fill = Uint8Array.prototype.fill || fillArray;
    Uint16Array.prototype.fill = Uint16Array.prototype.fill || fillArray;
    Uint32Array.prototype.fill = Uint32Array.prototype.fill || fillArray;
}();
