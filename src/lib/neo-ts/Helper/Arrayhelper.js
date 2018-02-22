export function fromArray(arr) {
    let array = new Array(arr.length);
    for (let i = 0; i < array.length; i++)
        array[i] = arr[i];
    return array;
}
export function copy(src, srcOffset, dst, dstOffset, count) {
    for (let i = 0; i < count; i++)
        dst[i + dstOffset] = src[i + srcOffset];
}
export function toAesKey(str) {
    let utf8 = unescape(encodeURIComponent(this));
    let codes = new Uint8Array(utf8.length);
    for (let i = 0; i < codes.length; i++)
        codes[i] = utf8.charCodeAt(i);
    return crypto.subtle.digest({ name: "SHA-256" }, codes).then(result => {
        return crypto.subtle.digest({ name: "SHA-256" }, result);
    });
}
//# sourceMappingURL=Arrayhelper.js.map