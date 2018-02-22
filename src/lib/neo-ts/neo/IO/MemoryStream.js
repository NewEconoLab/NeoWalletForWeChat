import { Stream, SeekOrigin } from './Stream';
const BufferSize = 1024;
export class MemoryStream extends Stream {
    constructor() {
        super();
        this._buffers = new Array();
        this._origin = 0;
        this._position = 0;
        if (arguments.length == 0) {
            this._length = 0;
            this._capacity = 0;
            this._expandable = true;
            this._writable = true;
        }
        else if (arguments.length == 1 && typeof arguments[0] === "number") {
            this._length = 0;
            this._capacity = arguments[0];
            this._expandable = true;
            this._writable = true;
            this._buffers.push(new ArrayBuffer(this._capacity));
        }
        else {
            let buffer = arguments[0];
            this._buffers.push(buffer);
            this._expandable = false;
            if (arguments.length == 1) {
                this._writable = false;
                this._length = buffer.byteLength;
            }
            else if (typeof arguments[1] === "boolean") {
                this._writable = arguments[1];
                this._length = buffer.byteLength;
            }
            else {
                this._origin = arguments[1];
                this._length = arguments[2];
                this._writable = arguments.length == 4 ? arguments[3] : false;
                if (this._origin < 0 || this._origin + this._length > buffer.byteLength)
                    throw new RangeError();
            }
            this._capacity = this._length;
        }
    }
    canRead() {
        return true;
    }
    canSeek() {
        return true;
    }
    canWrite() {
        return this._writable;
    }
    capacity() {
        return this._capacity;
    }
    findBuffer(position) {
        let iBuff, pBuff;
        let firstSize = this._buffers[0] == null ? BufferSize : this._buffers[0].byteLength;
        if (position < firstSize) {
            iBuff = 0;
            pBuff = position;
        }
        else {
            iBuff = Math.floor((position - firstSize) / BufferSize) + 1;
            pBuff = (position - firstSize) % BufferSize;
        }
        return { iBuff, pBuff };
    }
    length() {
        return this._length;
    }
    position() {
        return this._position;
    }
    read(buffer, offset, count) {
        if (this._position + count > this._length)
            count = this._length - this._position;
        this.readInternal(new Uint8Array(buffer, offset, count), this._position);
        this._position += count;
        return count;
    }
    readInternal(dst, srcPos) {
        if (this._expandable) {
            let i = 0, count = dst.length;
            let d = this.findBuffer(srcPos);
            while (count > 0) {
                let actual_count;
                if (this._buffers[d.iBuff] == null) {
                    actual_count = Math.min(count, BufferSize - d.pBuff);
                    dst.fill(0, i, i + actual_count);
                }
                else {
                    actual_count = Math.min(count, this._buffers[d.iBuff].byteLength - d.pBuff);
                    let src = new Uint8Array(this._buffers[d.iBuff]);
                    Array.copy(src, d.pBuff, dst, i, actual_count);
                }
                i += actual_count;
                count -= actual_count;
                d.iBuff++;
                d.pBuff = 0;
            }
        }
        else {
            let src = new Uint8Array(this._buffers[0], this._origin, this._length);
            Array.copy(src, srcPos, dst, 0, dst.length);
        }
    }
    seek(offset, origin) {
        switch (origin) {
            case SeekOrigin.Begin:
                break;
            case SeekOrigin.Current:
                offset += this._position;
                break;
            case SeekOrigin.End:
                offset += this._length;
                break;
            default:
                throw new RangeError();
        }
        if (offset < 0 || offset > this._length)
            throw new RangeError();
        this._position = offset;
        return offset;
    }
    setLength(value) {
        if (value < 0 || (value != this._length && !this._writable) || (value > this._capacity && !this._expandable))
            throw new RangeError();
        this._length = value;
        if (this._position > this._length)
            this._position = this._length;
        if (this._capacity < this._length)
            this._capacity = this._length;
    }
    toArray() {
        if (this._buffers.length == 1 && this._origin == 0 && this._length == this._buffers[0].byteLength)
            return this._buffers[0];
        let bw = new Uint8Array(this._length);
        this.readInternal(bw, 0);
        return bw.buffer;
    }
    write(buffer, offset, count) {
        if (!this._writable || (!this._expandable && this._capacity - this._position < count))
            throw new Error();
        if (this._expandable) {
            let src = new Uint8Array(buffer);
            let d = this.findBuffer(this._position);
            while (count > 0) {
                if (this._buffers[d.iBuff] == null)
                    this._buffers[d.iBuff] = new ArrayBuffer(BufferSize);
                let actual_count = Math.min(count, this._buffers[d.iBuff].byteLength - d.pBuff);
                let dst = new Uint8Array(this._buffers[d.iBuff]);
                Array.copy(src, offset, dst, d.pBuff, actual_count);
                this._position += actual_count;
                offset += actual_count;
                count -= actual_count;
                d.iBuff++;
                d.pBuff = 0;
            }
        }
        else {
            let src = new Uint8Array(buffer, offset, count);
            let dst = new Uint8Array(this._buffers[0], this._origin, this._capacity);
            Array.copy(src, 0, dst, this._position, count);
            this._position += count;
        }
        if (this._length < this._position)
            this._length = this._position;
        if (this._capacity < this._length)
            this._capacity = this._length;
    }
}
//# sourceMappingURL=MemoryStream.js.map