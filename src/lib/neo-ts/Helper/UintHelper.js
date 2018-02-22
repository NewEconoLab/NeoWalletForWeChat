export function fromArrayBuffer(buffer) {
    if (buffer instanceof Uint8Array)
        return buffer;
    else if (buffer instanceof ArrayBuffer)
        return new Uint8Array(buffer);
    else {
        let view = buffer;
        return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }
}
export function hexToBytes(str) {
    if ((str.length & 1) != 0)
        throw new RangeError();
    var temp = str;
    if (str.length >= 2 && str[0] == '0' && str[1] == 'x')
        temp = str.substr(2);
    let bytes = new Uint8Array(temp.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(temp.substr(i * 2, 2), 16);
    }
    return bytes;
}
export function clone(uintarr) {
    var u8 = new Uint8Array(uintarr.length);
    for (let i = 0; i < uintarr.length; i++)
        u8[i] = uintarr[i];
    return u8;
}
//# sourceMappingURL=UintHelper.js.map