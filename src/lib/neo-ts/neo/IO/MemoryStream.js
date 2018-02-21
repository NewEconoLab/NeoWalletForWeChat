"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/// <reference path="Stream.ts"/>
var index_1 = require("../../index");
var BufferSize = 1024;
var MemoryStream = /** @class */ (function (_super) {
    __extends(MemoryStream, _super);
    function MemoryStream() {
        var _this = _super.call(this) || this;
        _this._buffers = new Array();
        _this._origin = 0;
        _this._position = 0;
        if (arguments.length == 0) {
            _this._length = 0;
            _this._capacity = 0;
            _this._expandable = true;
            _this._writable = true;
        }
        else if (arguments.length == 1 && typeof arguments[0] === "number") {
            _this._length = 0;
            _this._capacity = arguments[0];
            _this._expandable = true;
            _this._writable = true;
            _this._buffers.push(new ArrayBuffer(_this._capacity));
        }
        else {
            var buffer = arguments[0];
            _this._buffers.push(buffer);
            _this._expandable = false;
            if (arguments.length == 1) {
                _this._writable = false;
                _this._length = buffer.byteLength;
            }
            else if (typeof arguments[1] === "boolean") {
                _this._writable = arguments[1];
                _this._length = buffer.byteLength;
            }
            else {
                _this._origin = arguments[1];
                _this._length = arguments[2];
                _this._writable = arguments.length == 4 ? arguments[3] : false;
                if (_this._origin < 0 || _this._origin + _this._length > buffer.byteLength)
                    throw new RangeError();
            }
            _this._capacity = _this._length;
        }
        return _this;
    }
    MemoryStream.prototype.canRead = function () {
        return true;
    };
    MemoryStream.prototype.canSeek = function () {
        return true;
    };
    MemoryStream.prototype.canWrite = function () {
        return this._writable;
    };
    MemoryStream.prototype.capacity = function () {
        return this._capacity;
    };
    MemoryStream.prototype.findBuffer = function (position) {
        var iBuff, pBuff;
        var firstSize = this._buffers[0] == null ? BufferSize : this._buffers[0].byteLength;
        if (position < firstSize) {
            iBuff = 0;
            pBuff = position;
        }
        else {
            iBuff = Math.floor((position - firstSize) / BufferSize) + 1;
            pBuff = (position - firstSize) % BufferSize;
        }
        return { iBuff: iBuff, pBuff: pBuff };
    };
    MemoryStream.prototype.length = function () {
        return this._length;
    };
    MemoryStream.prototype.position = function () {
        return this._position;
    };
    MemoryStream.prototype.read = function (buffer, offset, count) {
        if (this._position + count > this._length)
            count = this._length - this._position;
        this.readInternal(new Uint8Array(buffer, offset, count), this._position);
        this._position += count;
        return count;
    };
    MemoryStream.prototype.readInternal = function (dst, srcPos) {
        if (this._expandable) {
            var i = 0, count = dst.length;
            var d = this.findBuffer(srcPos);
            while (count > 0) {
                var actual_count = void 0;
                if (this._buffers[d.iBuff] == null) {
                    actual_count = Math.min(count, BufferSize - d.pBuff);
                    dst.fill(0, i, i + actual_count);
                }
                else {
                    actual_count = Math.min(count, this._buffers[d.iBuff].byteLength - d.pBuff);
                    var src = new Uint8Array(this._buffers[d.iBuff]);
                    Array.copy(src, d.pBuff, dst, i, actual_count);
                }
                i += actual_count;
                count -= actual_count;
                d.iBuff++;
                d.pBuff = 0;
            }
        }
        else {
            var src = new Uint8Array(this._buffers[0], this._origin, this._length);
            Array.copy(src, srcPos, dst, 0, dst.length);
        }
    };
    MemoryStream.prototype.seek = function (offset, origin) {
        switch (origin) {
            case index_1.SeekOrigin.Begin:
                break;
            case index_1.SeekOrigin.Current:
                offset += this._position;
                break;
            case index_1.SeekOrigin.End:
                offset += this._length;
                break;
            default:
                throw new RangeError();
        }
        if (offset < 0 || offset > this._length)
            throw new RangeError();
        this._position = offset;
        return offset;
    };
    MemoryStream.prototype.setLength = function (value) {
        if (value < 0 || (value != this._length && !this._writable) || (value > this._capacity && !this._expandable))
            throw new RangeError();
        this._length = value;
        if (this._position > this._length)
            this._position = this._length;
        if (this._capacity < this._length)
            this._capacity = this._length;
    };
    MemoryStream.prototype.toArray = function () {
        if (this._buffers.length == 1 && this._origin == 0 && this._length == this._buffers[0].byteLength)
            return this._buffers[0];
        var bw = new Uint8Array(this._length);
        this.readInternal(bw, 0);
        return bw.buffer;
    };
    MemoryStream.prototype.write = function (buffer, offset, count) {
        if (!this._writable || (!this._expandable && this._capacity - this._position < count))
            throw new Error();
        if (this._expandable) {
            var src = new Uint8Array(buffer);
            var d = this.findBuffer(this._position);
            while (count > 0) {
                if (this._buffers[d.iBuff] == null)
                    this._buffers[d.iBuff] = new ArrayBuffer(BufferSize);
                var actual_count = Math.min(count, this._buffers[d.iBuff].byteLength - d.pBuff);
                var dst = new Uint8Array(this._buffers[d.iBuff]);
                Array.copy(src, offset, dst, d.pBuff, actual_count);
                this._position += actual_count;
                offset += actual_count;
                count -= actual_count;
                d.iBuff++;
                d.pBuff = 0;
            }
        }
        else {
            var src = new Uint8Array(buffer, offset, count);
            var dst = new Uint8Array(this._buffers[0], this._origin, this._capacity);
            Array.copy(src, 0, dst, this._position, count);
            this._position += count;
        }
        if (this._length < this._position)
            this._length = this._position;
        if (this._capacity < this._length)
            this._capacity = this._length;
    };
    return MemoryStream;
}(index_1.Stream));
exports.MemoryStream = MemoryStream;
