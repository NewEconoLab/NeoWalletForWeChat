/// <reference path="Stream.d.ts" />
import { Stream, SeekOrigin } from './index';
export declare class MemoryStream extends Stream {
    private _buffers;
    private _origin;
    private _position;
    private _length;
    private _capacity;
    private _expandable;
    private _writable;
    constructor(capacity?: number);
    constructor(buffer: ArrayBuffer, writable?: boolean);
    constructor(buffer: ArrayBuffer, index: number, count: number, writable?: boolean);
    canRead(): boolean;
    canSeek(): boolean;
    canWrite(): boolean;
    capacity(): number;
    private findBuffer(position);
    length(): number;
    position(): number;
    read(buffer: ArrayBuffer, offset: number, count: number): number;
    private readInternal(dst, srcPos);
    seek(offset: number, origin: SeekOrigin): number;
    setLength(value: number): void;
    toArray(): ArrayBuffer;
    write(buffer: ArrayBuffer, offset: number, count: number): void;
}
