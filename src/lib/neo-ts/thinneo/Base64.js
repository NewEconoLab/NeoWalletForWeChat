"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Base64 {
    static init() {
        if (Base64.binited)
            return;
        Base64.lookup = [];
        Base64.revLookup = [];
        for (var i = 0, len = Base64.code.length; i < len; ++i) {
            Base64.lookup[i] = Base64.code[i];
            Base64.revLookup[Base64.code.charCodeAt(i)] = i;
        }
        Base64.revLookup['-'.charCodeAt(0)] = 62;
        Base64.revLookup['_'.charCodeAt(0)] = 63;
        Base64.binited = true;
    }
    static placeHoldersCount(b64) {
        var len = b64.length;
        if (len % 4 > 0) {
            throw new Error('Invalid string. Length must be a multiple of 4');
        }
        return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;
    }
    static byteLength(b64) {
        return (b64.length * 3 / 4) - Base64.placeHoldersCount(b64);
    }
    static toByteArray(b64) {
        Base64.init();
        var i, l, tmp, placeHolders, arr;
        var len = b64.length;
        placeHolders = Base64.placeHoldersCount(b64);
        arr = new Uint8Array((len * 3 / 4) - placeHolders);
        l = placeHolders > 0 ? len - 4 : len;
        var L = 0;
        for (i = 0; i < l; i += 4) {
            tmp = (Base64.revLookup[b64.charCodeAt(i)] << 18) | (Base64.revLookup[b64.charCodeAt(i + 1)] << 12) | (Base64.revLookup[b64.charCodeAt(i + 2)] << 6) | Base64.revLookup[b64.charCodeAt(i + 3)];
            arr[L++] = (tmp >> 16) & 0xFF;
            arr[L++] = (tmp >> 8) & 0xFF;
            arr[L++] = tmp & 0xFF;
        }
        if (placeHolders === 2) {
            tmp = (Base64.revLookup[b64.charCodeAt(i)] << 2) | (Base64.revLookup[b64.charCodeAt(i + 1)] >> 4);
            arr[L++] = tmp & 0xFF;
        }
        else if (placeHolders === 1) {
            tmp = (Base64.revLookup[b64.charCodeAt(i)] << 10) | (Base64.revLookup[b64.charCodeAt(i + 1)] << 4) | (Base64.revLookup[b64.charCodeAt(i + 2)] >> 2);
            arr[L++] = (tmp >> 8) & 0xFF;
            arr[L++] = tmp & 0xFF;
        }
        return arr;
    }
    static tripletToBase64(num) {
        return Base64.lookup[num >> 18 & 0x3F] + Base64.lookup[num >> 12 & 0x3F] + Base64.lookup[num >> 6 & 0x3F] + Base64.lookup[num & 0x3F];
    }
    static encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i = start; i < end; i += 3) {
            tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
            output.push(Base64.tripletToBase64(tmp));
        }
        return output.join('');
    }
    static fromByteArray(uint8) {
        Base64.init();
        var tmp;
        var len = uint8.length;
        var extraBytes = len % 3;
        var output = '';
        var parts = [];
        var maxChunkLength = 16383;
        for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
            parts.push(Base64.encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
        }
        if (extraBytes === 1) {
            tmp = uint8[len - 1];
            output += Base64.lookup[tmp >> 2];
            output += Base64.lookup[(tmp << 4) & 0x3F];
            output += '==';
        }
        else if (extraBytes === 2) {
            tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
            output += Base64.lookup[tmp >> 10];
            output += Base64.lookup[(tmp >> 4) & 0x3F];
            output += Base64.lookup[(tmp << 2) & 0x3F];
            output += '=';
        }
        parts.push(output);
        return parts.join('');
    }
}
Base64.lookup = [];
Base64.revLookup = [];
Base64.code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
Base64.binited = false;
exports.Base64 = Base64;
//# sourceMappingURL=Base64.js.map