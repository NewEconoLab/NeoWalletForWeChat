type Func<T, TResult> = (arg: T) => TResult;
type Action<T> = Func<T, void>;

export function contains<T>(arr:{}, key: T) {
    for (let i in arr) {
        if (arr[i] === key) return true;
    }
    return false;
}

export function fromArray<T>(arr: ArrayLike<T>): Array<T> {
    let array = new Array<T>(arr.length);
    for (let i = 0; i < array.length; i++)
        array[i] = arr[i];
    return array;
}

export function copy<T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void {
    for (let i = 0; i < count; i++)
        (<any>dst)[i + dstOffset] = src[i + srcOffset];
}

export function toAesKey(str: string): PromiseLike<ArrayBuffer> {
    let utf8 = unescape(encodeURIComponent(this));
    let codes = new Uint8Array(utf8.length);
    for (let i = 0; i < codes.length; i++)
        codes[i] = utf8.charCodeAt(i);
    return crypto.subtle.digest({ name: "SHA-256" }, codes).then(result => {
        return crypto.subtle.digest({ name: "SHA-256" }, result);
    });
}