declare type Func<T, TResult> = (arg: T) => TResult;
declare type Action<T> = Func<T, void>;
interface Array<T> {
    fill(value: T, start?: number, end?: number): any;
}
interface ArrayConstructor {
    copy<T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void;
    fromArray<T>(arr: ArrayLike<T>): Array<T>;
}
interface String {
    hexToBytes(): Uint8Array;
}
interface Uint8Array {
    toHexString(): string;
    clone(): Uint8Array;
}
interface Uint8ArrayConstructor {
    fromArrayBuffer(buffer: ArrayBuffer | ArrayBufferView): Uint8Array;
}
