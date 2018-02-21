type Func<T, TResult> = (arg: T) => TResult;
type Action<T> = Func<T, void>;

interface Array<T>
{
    fill(value: T, start?: number, end?: number);
}

interface ArrayConstructor
{
    copy<T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void;
    fromArray<T>(arr: ArrayLike<T>): Array<T>;
}

interface String
{
    hexToBytes(): Uint8Array;
}

interface Uint8Array
{
    toHexString(): string;
    clone(): Uint8Array;
}

interface Uint8ArrayConstructor
{
    fromArrayBuffer(buffer: ArrayBuffer | ArrayBufferView): Uint8Array
}

Array.copy = function <T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void
{
    for (let i = 0; i < count; i++)
        (<any>dst)[i + dstOffset] = src[i + srcOffset];
}

Array.fromArray = function <T>(arr: ArrayLike<T>): Array<T>
{
    let array = new Array<T>(arr.length);
    for (let i = 0; i < array.length; i++)
        array[i] = arr[i];
    return array;
}

Uint8Array.fromArrayBuffer = function (buffer: ArrayBuffer | ArrayBufferView): Uint8Array
{
    if (buffer instanceof Uint8Array) return buffer;
    else if (buffer instanceof ArrayBuffer) return new Uint8Array(buffer);
    else
    {
        let view = buffer as ArrayBufferView;
        return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }
}

String.prototype.hexToBytes = function (): Uint8Array
{
    if ((this.length & 1) != 0) throw new RangeError();
    var str = this;
    if (this.length >= 2 && this[0] == '0' && this[1] == 'x')
        str = this.substr(2);
    let bytes = new Uint8Array(str.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        
        bytes[i] = parseInt(str.substr(i * 2, 2), 16);
    }
    return bytes;
}

ArrayBuffer.prototype.slice = ArrayBuffer.prototype.slice || function (begin: number, end = this.byteLength): ArrayBuffer
{
    if (begin < 0) begin += this.byteLength;
    if (begin < 0) begin = 0;
    if (end < 0) end += this.byteLength;
    if (end > this.byteLength) end = this.byteLength;
    let length = end - begin;
    if (length < 0) length = 0;
    let src = new Uint8Array(this);
    let dst = new Uint8Array(length);
    for (let i = 0; i < length; i++)
        dst[i] = src[i + begin];
    return dst.buffer;
}

Uint8Array.prototype.toHexString = function (): string
{
    let s = "";
    for (let i = 0; i < this.length; i++)
    {
        s += (this[i] >>> 4).toString(16);
        s += (this[i] & 0xf).toString(16);
    }
    return s;
}
Uint8Array.prototype.clone = function (): Uint8Array
{
    var u8 = new Uint8Array(this.length);
    for (let i = 0; i < this.length; i++)
        u8[i] = this[i];
    return u8;
}
void function ()
{
    function fillArray<T>(value: T, start = 0, end = this.length)
    {
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
} ();
