export declare function fromArray<T>(arr: ArrayLike<T>): Array<T>;
export declare function copy<T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void;
export declare function toAesKey(str: string): PromiseLike<ArrayBuffer>;
