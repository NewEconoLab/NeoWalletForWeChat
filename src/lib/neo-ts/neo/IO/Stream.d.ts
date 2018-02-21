export declare enum SeekOrigin {
    Begin = 0,
    Current = 1,
    End = 2,
}
export declare abstract class Stream {
    private _array;
    abstract canRead(): boolean;
    abstract canSeek(): boolean;
    abstract canWrite(): boolean;
    close(): void;
    abstract length(): number;
    abstract position(): number;
    abstract read(buffer: ArrayBuffer, offset: number, count: number): number;
    readByte(): number;
    abstract seek(offset: number, origin: SeekOrigin): number;
    abstract setLength(value: number): void;
    abstract write(buffer: ArrayBuffer, offset: number, count: number): void;
    writeByte(value: number): void;
}
