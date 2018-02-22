import * as Base64 from 'base-64';
import { Base58 } from '../neo/Cryptography/Base58';
export function base58Decode(str) {
    return Base58.decode(str);
}
export function base64UrlDecode(str) {
    let temp = Base64.decode(this.replace(/-/g, '+').replace(/_/g, '/'));
    let arr = new Uint8Array(temp.length);
    for (let i = 0; i < str.length; i++)
        arr[i] = str.charCodeAt(i);
    return arr;
}
export function base58Encode(arr) {
    return Base58.encode(this);
}
export function base64UrlEncode(arr) {
    let str = String.fromCharCode.apply(null, this);
    str = Base64.encode(str);
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
//# sourceMappingURL=Base64Helper.js.map