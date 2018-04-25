import { BigInteger } from '../neo/BigInteger'
import { NeoPromise } from '../neo/Promise'
import * as BaseHelper from './Base64Helper'
import * as ArrayHelper from './Arrayhelper'

export function fromArrayBuffer(buffer: ArrayBuffer | ArrayBufferView): Uint8Array {
    if (buffer instanceof Uint8Array) return buffer;
    else if (buffer instanceof ArrayBuffer) return new Uint8Array(buffer);
    else {
        let view = buffer as ArrayBufferView;
        return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }
}

export function hexToBytes(str: string): Uint8Array {
    if ((str.length & 1) != 0) throw new RangeError();
    var temp = str;
    if (str.length >= 2 && str[0] == '0' && str[1] == 'x')
        temp = str.substr(2);
    let bytes = new Uint8Array(temp.length / 2);
    for (let i = 0; i < bytes.length; i++) {

        bytes[i] = parseInt(temp.substr(i * 2, 2), 16);
    }
    return bytes;
}
export function clone(uintarr: Uint8Array): Uint8Array {
    var u8 = new Uint8Array(uintarr.length);
    for (let i = 0; i < uintarr.length; i++)
        u8[i] = uintarr[i];
    return u8;
}

export function concat(src: Uint8Array, data: Uint8Array): Uint8Array {
    var newarr = new Uint8Array(src.length + data.length);
    for (var i = 0; i < src.length; i++) {
        newarr[i] = src[i];
    }
    for (var i = 0; i < data.length; i++) {
        newarr[src.length + i] = data[i];
    }
    return newarr;
}
