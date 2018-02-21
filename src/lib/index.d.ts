declare module "neo/Cryptography/Aes" {
    export class Aes {
        private static numberOfRounds;
        private static rcon;
        private static S;
        private static Si;
        private static T1;
        private static T2;
        private static T3;
        private static T4;
        private static T5;
        private static T6;
        private static T7;
        private static T8;
        private static U1;
        private static U2;
        private static U3;
        private static U4;
        private _Ke;
        private _Kd;
        private _lastCipherblock;
        readonly mode: string;
        constructor(key: ArrayBuffer | ArrayBufferView, iv: ArrayBuffer | ArrayBufferView);
        private static convertToInt32(bytes);
        decrypt(ciphertext: ArrayBuffer | ArrayBufferView): ArrayBuffer;
        decryptBlock(ciphertext: Uint8Array, plaintext: Uint8Array): void;
        encrypt(plaintext: ArrayBuffer | ArrayBufferView): ArrayBuffer;
        encryptBlock(plaintext: Uint8Array, ciphertext: Uint8Array): void;
    }
}
declare module "neo/Cryptography/Base58" {
    export class Base58 {
        static Alphabet: string;
        static decode(input: string): Uint8Array;
        static encode(input: Uint8Array): string;
    }
}
declare module "neo/Cryptography/CryptoKey" {
    import { ECPoint } from "index";
    export class CryptoKey {
        type: string;
        extractable: boolean;
        algorithm: Algorithm;
        usages: string[];
        constructor(type: string, extractable: boolean, algorithm: Algorithm, usages: string[]);
    }
    export class AesCryptoKey extends CryptoKey {
        private _key_bytes;
        constructor(_key_bytes: Uint8Array);
        static create(length: number): AesCryptoKey;
        export(): Uint8Array;
        static import(keyData: ArrayBuffer | ArrayBufferView): AesCryptoKey;
    }
    export class ECDsaCryptoKey extends CryptoKey {
        publicKey: ECPoint;
        privateKey: Uint8Array;
        constructor(publicKey: ECPoint, privateKey?: Uint8Array);
    }
}
declare module "neo/Cryptography/ECCurve" {
    import { BigInteger, ECFieldElement, ECPoint } from "index";
    export class ECCurve {
        Q: BigInteger;
        A: ECFieldElement;
        B: ECFieldElement;
        N: BigInteger;
        Infinity: ECPoint;
        G: ECPoint;
        static readonly secp256k1: ECCurve;
        static readonly secp256r1: ECCurve;
        constructor(Q: BigInteger, A: BigInteger, B: BigInteger, N: BigInteger, G: Uint8Array);
    }
}
declare module "neo/Cryptography/ECDsa" {
    import { ECCurve, ECDsaCryptoKey } from "index";
    export class ECDsa {
        private key;
        constructor(key: ECDsaCryptoKey);
        private static calculateE(n, message);
        static generateKey(curve: ECCurve): {
            privateKey: ECDsaCryptoKey;
            publicKey: ECDsaCryptoKey;
        };
        sign(message: ArrayBuffer | ArrayBufferView): ArrayBuffer;
        private static sumOfTwoMultiplies(P, k, Q, l);
        verify(message: ArrayBuffer | ArrayBufferView, signature: ArrayBuffer | ArrayBufferView): boolean;
    }
}
declare module "neo/Cryptography/ECFieldElement" {
    import { ECCurve, BigInteger } from "index";
    export class ECFieldElement {
        value: BigInteger;
        private curve;
        constructor(value: BigInteger, curve: ECCurve);
        add(other: ECFieldElement): ECFieldElement;
        compareTo(other: ECFieldElement): number;
        divide(other: ECFieldElement): ECFieldElement;
        equals(other: ECFieldElement): boolean;
        private static fastLucasSequence(p, P, Q, k);
        multiply(other: ECFieldElement): ECFieldElement;
        negate(): ECFieldElement;
        sqrt(): ECFieldElement;
        square(): ECFieldElement;
        subtract(other: ECFieldElement): ECFieldElement;
    }
}
declare module "neo/Cryptography/ECPoint" {
    import { ECCurve, BigInteger, ECFieldElement, IO } from "index";
    export class ECPoint {
        x: ECFieldElement;
        y: ECFieldElement;
        curve: ECCurve;
        constructor(x: ECFieldElement, y: ECFieldElement, curve: ECCurve);
        static add(x: ECPoint, y: ECPoint): ECPoint;
        compareTo(other: ECPoint): number;
        static decodePoint(encoded: Uint8Array, curve: ECCurve): ECPoint;
        private static decompressPoint(yTilde, X1, curve);
        static deserializeFrom(reader: IO.BinaryReader, curve: ECCurve): ECPoint;
        encodePoint(commpressed: boolean): Uint8Array;
        equals(other: ECPoint): boolean;
        static fromUint8Array(arr: Uint8Array, curve: ECCurve): ECPoint;
        isInfinity(): boolean;
        static multiply(p: ECPoint, n: Uint8Array | BigInteger): ECPoint;
        negate(): ECPoint;
        static parse(str: string, curve: ECCurve): ECPoint;
        static subtract(x: ECPoint, y: ECPoint): ECPoint;
        toString(): string;
        twice(): ECPoint;
        private static windowNaf(width, k);
    }
}
declare module "neo/Cryptography/RandomNumberGenerator" {
    export class RandomNumberGenerator {
        private static _entropy;
        private static _strength;
        private static _started;
        private static _stopped;
        private static _key;
        private static addEntropy(data, strength);
        static getRandomValues<T extends Int8Array | Uint8ClampedArray | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array>(array: T): T;
        private static getWeakRandomValues(array);
        private static processDeviceMotionEvent(event);
        private static processEvent(event);
        private static processMouseEvent(event);
        private static processTouchEvent(event);
        static startCollectors(): void;
        private static stopCollectors();
    }
}
declare module "neo/Cryptography/RIPEMD160" {
    export class RIPEMD160 {
        private static zl;
        private static zr;
        private static sl;
        private static sr;
        private static hl;
        private static hr;
        private static bytesToWords(bytes);
        private static wordsToBytes(words);
        private static processBlock(H, M, offset);
        private static f1(x, y, z);
        private static f2(x, y, z);
        private static f3(x, y, z);
        private static f4(x, y, z);
        private static f5(x, y, z);
        private static rotl(x, n);
        static computeHash(data: ArrayBuffer | ArrayBufferView): ArrayBuffer;
    }
}
declare module "neo/Cryptography/Sha256" {
    export class Sha256 {
        private static K;
        static computeHash(data: ArrayBuffer | ArrayBufferView): ArrayBuffer;
        private static ROTR(n, x);
        private static Σ0(x);
        private static Σ1(x);
        private static σ0(x);
        private static σ1(x);
        private static Ch(x, y, z);
        private static Maj(x, y, z);
    }
}
declare module "neo/Cryptography/index" {
    export * from "neo/Cryptography/Aes";
    export * from "neo/Cryptography/Base58";
    export * from "neo/Cryptography/CryptoKey";
    export * from "neo/Cryptography/ECCurve";
    export * from "neo/Cryptography/ECDsa";
    export * from "neo/Cryptography/ECFieldElement";
    export * from "neo/Cryptography/ECPoint";
    export * from "neo/Cryptography/RandomNumberGenerator";
    export * from "neo/Cryptography/RIPEMD160";
    export * from "neo/Cryptography/Sha256";
}
declare module "neo/IO/Caching/TrackState" {
    export enum TrackState {
        None = 0,
        Added = 1,
        Changed = 2,
        Deleted = 3,
    }
}
declare module "neo/IO/Caching/ITrackable" {
    import { TrackState } from "neo/IO/Caching/TrackState";
    export interface ITrackable<TKey> {
        key: TKey;
        trackState: TrackState;
    }
}
declare module "neo/IO/Caching/TrackableCollection" {
    import { ITrackable } from "neo/IO/Caching/index";
    export class TrackableCollection<TKey, TItem extends ITrackable<TKey>> {
        private _map;
        constructor(items?: ArrayLike<TItem>);
        add(item: TItem): void;
        clear(): void;
        commit(): void;
        forEach(callback: (value: TItem, key: TKey, collection: TrackableCollection<TKey, TItem>) => void): void;
        get(key: TKey): TItem;
        getChangeSet(): TItem[];
        has(key: TKey): boolean;
        remove(key: TKey): void;
    }
}
declare module "neo/IO/Caching/index" {
    export * from "neo/IO/Caching/ITrackable";
    export * from "neo/IO/Caching/TrackableCollection";
    export * from "neo/IO/Caching/TrackState";
}
declare module "neo/IO/BinaryReader" {
    import { Stream, Fixed8, ISerializable, Uint64, Uint160, Uint256 } from "index";
    export class BinaryReader {
        private input;
        private _buffer;
        private array_uint8;
        private array_int8;
        private array_uint16;
        private array_int16;
        private array_uint32;
        private array_int32;
        private array_float32;
        private array_float64;
        constructor(input: Stream);
        close(): void;
        private fillBuffer(buffer, count);
        read(buffer: ArrayBuffer, index: number, count: number): number;
        readBoolean(): boolean;
        readByte(): number;
        readBytes(count: number): ArrayBuffer;
        readDouble(): number;
        readFixed8(): Fixed8;
        readInt16(): number;
        readInt32(): number;
        readSByte(): number;
        readSerializable(T: Function): ISerializable;
        readSerializableArray(T: Function): ISerializable[];
        readSingle(): number;
        readUint16(): number;
        readUint160(): Uint160;
        readUint256(): Uint256;
        readUint32(): number;
        readUint64(): Uint64;
        readVarBytes(max?: number): ArrayBuffer;
        readVarInt(max?: number): number;
        readVarString(): string;
    }
}
declare module "neo/IO/BinaryWriter" {
    import { Stream, SeekOrigin, ISerializable, Uint64, UintVariable } from "index";
    export class BinaryWriter {
        private output;
        private _buffer;
        private array_uint8;
        private array_int8;
        private array_uint16;
        private array_int16;
        private array_uint32;
        private array_int32;
        private array_float32;
        private array_float64;
        constructor(output: Stream);
        close(): void;
        seek(offset: number, origin: SeekOrigin): number;
        write(buffer: ArrayBuffer, index?: number, count?: number): void;
        writeBoolean(value: boolean): void;
        writeByte(value: number): void;
        writeDouble(value: number): void;
        writeInt16(value: number): void;
        writeInt32(value: number): void;
        writeSByte(value: number): void;
        writeSerializableArray(array: ISerializable[]): void;
        writeSingle(value: number): void;
        writeUint16(value: number): void;
        writeUint32(value: number): void;
        writeUint64(value: Uint64): void;
        writeUintVariable(value: UintVariable): void;
        writeVarBytes(value: ArrayBuffer): void;
        writeVarInt(value: number): void;
        writeVarString(value: string): void;
    }
}
declare module "neo/IO/ISerializable" {
    import { BinaryReader, BinaryWriter } from "neo/IO/index";
    export interface ISerializable {
        deserialize(reader: BinaryReader): void;
        serialize(writer: BinaryWriter): void;
    }
}
declare module "neo/IO/Stream" {
    export enum SeekOrigin {
        Begin = 0,
        Current = 1,
        End = 2,
    }
    export abstract class Stream {
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
}
declare module "neo/IO/MemoryStream" {
    import { Stream, SeekOrigin } from "index";
    export class MemoryStream extends Stream {
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
}
declare module "neo/IO/index" {
    import * as Caching from "neo/IO/Caching/index";
    export * from "neo/IO/BinaryReader";
    export * from "neo/IO/BinaryWriter";
    export * from "neo/IO/ISerializable";
    export * from "neo/IO/MemoryStream";
    export * from "neo/IO/Stream";
    export { Caching };
}
declare module "neo/UintVariable" {
    abstract class UintVariable {
        protected _bits: Uint32Array;
        readonly bits: Uint32Array;
        constructor(bits: number | Uint8Array | Uint32Array | number[]);
        compareTo(other: UintVariable): number;
        equals(other: UintVariable): boolean;
        toString(): string;
    }
    export { UintVariable };
}
declare module "neo/Uint64" {
    import { UintVariable } from "neo/UintVariable";
    import * as NEO from "index";
    export class Uint64 extends UintVariable {
        static readonly MaxValue: NEO.Uint64;
        static readonly MinValue: NEO.Uint64;
        static readonly Zero: NEO.Uint64;
        constructor(low?: number, high?: number);
        add(other: Uint64): Uint64;
        and(other: number | Uint64): Uint64;
        leftShift(shift: number): Uint64;
        not(): Uint64;
        or(other: number | Uint64): Uint64;
        static parse(str: string): Uint64;
        rightShift(shift: number): Uint64;
        subtract(other: Uint64): Uint64;
        toInt32(): number;
        toNumber(): number;
        toString(): string;
        toUint32(): number;
        xor(other: number | Uint64): Uint64;
    }
}
declare module "neo/BigInteger" {
    import * as NEO from "index";
    export class BigInteger {
        private _sign;
        private _bits;
        static readonly MinusOne: NEO.BigInteger;
        static readonly One: NEO.BigInteger;
        static readonly Zero: NEO.BigInteger;
        constructor(value: number | string | ArrayBuffer | Uint8Array);
        static add(x: number | BigInteger, y: number | BigInteger): BigInteger;
        add(other: number | BigInteger): BigInteger;
        private static addTo(x, y, r);
        bitLength(): number;
        private static bitLengthInternal(w);
        private clamp();
        static compare(x: number | BigInteger, y: number | BigInteger): number;
        private static compareAbs(x, y);
        compareTo(other: number | BigInteger): number;
        private static create(sign, bits, clamp?);
        static divide(x: number | BigInteger, y: number | BigInteger): BigInteger;
        divide(other: number | BigInteger): BigInteger;
        static divRem(x: number | BigInteger, y: number | BigInteger): {
            result: BigInteger;
            remainder: BigInteger;
        };
        static equals(x: number | BigInteger, y: number | BigInteger): boolean;
        equals(other: number | BigInteger): boolean;
        static fromString(str: string, radix?: number): BigInteger;
        private fromString(str, radix?);
        static fromUint8Array(arr: Uint8Array, sign?: number, littleEndian?: boolean): BigInteger;
        private fromUint8Array(arr, sign?, littleEndian?);
        private fromUint64(i, sign);
        private static getActualLength(arr);
        private static getDoubleParts(dbl);
        getLowestSetBit(): number;
        isEven(): boolean;
        isZero(): boolean;
        leftShift(shift: number): BigInteger;
        static mod(x: number | BigInteger, y: number | BigInteger): BigInteger;
        mod(other: number | BigInteger): BigInteger;
        static modInverse(value: number | BigInteger, modulus: number | BigInteger): BigInteger;
        modInverse(modulus: number | BigInteger): BigInteger;
        static modPow(value: number | BigInteger, exponent: number | BigInteger, modulus: number | BigInteger): BigInteger;
        modPow(exponent: number | BigInteger, modulus: number | BigInteger): BigInteger;
        static multiply(x: number | BigInteger, y: number | BigInteger): BigInteger;
        multiply(other: number | BigInteger): BigInteger;
        private static multiplyTo(x, y, r, offset?);
        negate(): BigInteger;
        static parse(str: string): BigInteger;
        static pow(value: number | BigInteger, exponent: number): BigInteger;
        pow(exponent: number): BigInteger;
        static random(bitLength: number, rng?: RandomSource): BigInteger;
        static remainder(x: number | BigInteger, y: number | BigInteger): BigInteger;
        remainder(other: number | BigInteger): BigInteger;
        rightShift(shift: number): BigInteger;
        sign(): number;
        static subtract(x: number | BigInteger, y: number | BigInteger): BigInteger;
        subtract(other: number | BigInteger): BigInteger;
        private static subtractTo(x, y, r?);
        testBit(n: number): boolean;
        toInt32(): number;
        toString(radix?: number): string;
        toUint8Array(littleEndian?: boolean, length?: number): Uint8Array;
    }
}
declare module "neo/Map" {
    export class NeoMap<TKey, TValue> {
        private _map;
        private _size;
        readonly size: number;
        clear(): void;
        delete(key: TKey): boolean;
        forEach(callback: (value: TValue, key: TKey, map: NeoMap<TKey, TValue>) => void): void;
        get(key: TKey): TValue;
        has(key: TKey): boolean;
        set(key: TKey, value: TValue): void;
    }
}
declare module "neo/Promise" {
    export type PromiseExecutor<T> = (resolve: Action<T | PromiseLike<T>>, reject: Action<any>) => void;
    export enum PromiseState {
        pending = 0,
        fulfilled = 1,
        rejected = 2,
    }
    export class NeoPromise<T> implements PromiseLike<T> {
        private _state;
        private _callback_attached;
        private _value;
        private _reason;
        private _onFulfilled;
        private _onRejected;
        private _next_promise;
        private _tag;
        constructor(executor: PromiseExecutor<T>);
        static all(iterable: NeoPromise<any>[]): NeoPromise<any[]>;
        catch<TResult>(onRejected: Func<any, TResult | PromiseLike<TResult>>): PromiseLike<TResult>;
        private checkState();
        private reject(reason);
        static reject(reason: any): PromiseLike<any>;
        private resolve(value);
        static resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>;
        then<TResult>(onFulfilled?: Func<T, TResult | PromiseLike<TResult>>, onRejected?: Func<any, TResult | PromiseLike<TResult>>): PromiseLike<TResult>;
    }
}
declare module "neo/Uint160" {
    import { UintVariable } from "neo/UintVariable";
    export class Uint160 extends UintVariable {
        static readonly Zero: Uint160;
        constructor(value?: ArrayBuffer);
        static parse(str: string): Uint160;
    }
}
declare module "neo/Uint256" {
    import { UintVariable } from "neo/UintVariable";
    export class Uint256 extends UintVariable {
        static readonly Zero: Uint256;
        constructor(value?: ArrayBuffer);
        static parse(str: string): Uint256;
    }
}
declare module "neo/Fixed8" {
    import { Uint64, IO } from "index";
    export class Fixed8 implements IO.ISerializable {
        private data;
        static readonly MaxValue: Fixed8;
        static readonly MinusOne: Fixed8;
        static readonly MinValue: Fixed8;
        static readonly One: Fixed8;
        static readonly Satoshi: Fixed8;
        static readonly Zero: Fixed8;
        constructor(data: Uint64);
        add(other: Fixed8): Fixed8;
        compareTo(other: Fixed8): number;
        equals(other: Fixed8): boolean;
        static fromNumber(value: number): Fixed8;
        getData(): Uint64;
        static max(first: Fixed8, ...others: Fixed8[]): Fixed8;
        static min(first: Fixed8, ...others: Fixed8[]): Fixed8;
        static parse(str: string): Fixed8;
        subtract(other: Fixed8): Fixed8;
        toString(): string;
        deserialize(reader: IO.BinaryReader): void;
        serialize(writer: IO.BinaryWriter): void;
    }
}
declare module "neo/index" {
    import * as Cryptography from "neo/Cryptography/index";
    import * as IO from "neo/IO/index";
    export * from "neo/BigInteger";
    export * from "neo/Cryptography/index";
    export * from "neo/IO/index";
    export * from "neo/Map";
    export * from "neo/Promise";
    export * from "neo/Uint160";
    export * from "neo/Uint256";
    export * from "neo/Uint64";
    export * from "neo/UintVariable";
    export * from "neo/Fixed8";
    export { Cryptography, IO };
}
declare module "nep6/nep6wallet" {
    export class nep6account {
        address: string;
        nep2key: string;
        getPrivateKey(scrypt: nep6ScryptParameters, password: string, callback: (info: string, result: string | Uint8Array) => void): void;
    }
    export class nep6ScryptParameters {
        N: number;
        r: number;
        p: number;
    }
    export class nep6wallet {
        scrypt: nep6ScryptParameters;
        accounts: nep6account[];
        fromJsonStr(jsonstr: string): void;
        toJson(): any;
    }
}
declare module "nep6/index" {
    export * from "nep6/nep6wallet";
}
declare module "thinneo/Base64" {
    export class Base64 {
        static lookup: any[];
        static revLookup: any[];
        static code: string;
        static binited: boolean;
        static init(): void;
        static placeHoldersCount(b64: string): number;
        static byteLength(b64: string): number;
        static toByteArray(b64: string): Uint8Array;
        static tripletToBase64(num: any): any;
        static encodeChunk(uint8: any, start: any, end: any): string;
        static fromByteArray(uint8: Uint8Array): string;
    }
}
declare module "thinneo/ScriptBuilder" {
    import { OpCode, BigInteger } from "index";
    export class ScriptBuilder {
        writer: number[];
        Offset: number;
        constructor();
        _WriteUint8(num: number): void;
        _WriteUint16(num: number): void;
        _WriteUint32(num: number): void;
        _WriteUint8Array(nums: Uint8Array): void;
        _ConvertInt16ToBytes(num: number): Uint8Array;
        Emit(op: OpCode, arg?: Uint8Array): ScriptBuilder;
        EmitAppCall(scriptHash: Uint8Array, useTailCall?: boolean): ScriptBuilder;
        EmitJump(op: OpCode, offset: number): ScriptBuilder;
        EmitPushNumber(number: BigInteger): ScriptBuilder;
        EmitPushBool(data: boolean): ScriptBuilder;
        EmitPushBytes(data: Uint8Array): ScriptBuilder;
        EmitPushString(data: string): ScriptBuilder;
        EmitSysCall(api: string): ScriptBuilder;
        ToArray(): Uint8Array;
        EmitParamJson(param: any): ScriptBuilder;
    }
}
declare module "thinneo/helper" {
    export class Helper {
        static GetPrivateKeyFromWIF(wif: string): Uint8Array;
        static GetWifFromPrivateKey(prikey: Uint8Array): string;
        static GetPublicKeyFromPrivateKey(privateKey: Uint8Array): Uint8Array;
        static Hash160(data: Uint8Array): Uint8Array;
        static GetAddressCheckScriptFromPublicKey(publicKey: Uint8Array): Uint8Array;
        static GetPublicKeyScriptHashFromPublicKey(publicKey: Uint8Array): Uint8Array;
        static GetScriptHashFromScript(script: Uint8Array): Uint8Array;
        static GetAddressFromScriptHash(scripthash: Uint8Array): string;
        static GetAddressFromPublicKey(publicKey: Uint8Array): string;
        static GetPublicKeyScriptHash_FromAddress(address: string): Uint8Array;
        static Sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array;
        static VerifySignature(message: Uint8Array, signature: Uint8Array, pubkey: Uint8Array): boolean;
        static String2Bytes(str: any): Uint8Array;
        static Bytes2String(_arr: Uint8Array): string;
        static Aes256Encrypt(src: string, key: string): string;
        static Aes256Encrypt_u8(src: Uint8Array, key: Uint8Array): Uint8Array;
        static Aes256Decrypt_u8(encryptedkey: Uint8Array, key: Uint8Array): Uint8Array;
        static GetNep2FromPrivateKey(prikey: Uint8Array, passphrase: string, n: number, r: number, p: number, callback: (info: string, result: string) => void): void;
        static GetPrivateKeyFromNep2(nep2: string, passphrase: string, n: number, r: number, p: number, callback: (info: string, result: string | Uint8Array) => void): void;
    }
}
declare module "thinneo/TransAction" {
    import { Fixed8, IO } from "index";
    export enum TransactionType {
        MinerTransaction = 0,
        IssueTransaction = 1,
        ClaimTransaction = 2,
        EnrollmentTransaction = 32,
        RegisterTransaction = 64,
        ContractTransaction = 128,
        PublishTransaction = 208,
        InvocationTransaction = 209,
    }
    export enum TransactionAttributeUsage {
        ContractHash = 0,
        ECDH02 = 2,
        ECDH03 = 3,
        Script = 32,
        Vote = 48,
        DescriptionUrl = 129,
        Description = 144,
        Hash1 = 161,
        Hash2 = 162,
        Hash3 = 163,
        Hash4 = 164,
        Hash5 = 165,
        Hash6 = 166,
        Hash7 = 167,
        Hash8 = 168,
        Hash9 = 169,
        Hash10 = 170,
        Hash11 = 171,
        Hash12 = 172,
        Hash13 = 173,
        Hash14 = 174,
        Hash15 = 175,
        Remark = 240,
        Remark1 = 241,
        Remark2 = 242,
        Remark3 = 243,
        Remark4 = 244,
        Remark5 = 245,
        Remark6 = 246,
        Remark7 = 247,
        Remark8 = 248,
        Remark9 = 249,
        Remark10 = 250,
        Remark11 = 251,
        Remark12 = 252,
        Remark13 = 253,
        Remark14 = 254,
        Remark15 = 255,
    }
    export class Attribute {
        usage: TransactionAttributeUsage;
        data: Uint8Array;
    }
    export class TransactionOutput {
        assetId: Uint8Array;
        value: Fixed8;
        toAddress: Uint8Array;
    }
    export class TransactionInput {
        hash: Uint8Array;
        index: number;
    }
    export class Witness {
        InvocationScript: Uint8Array;
        VerificationScript: Uint8Array;
        readonly Address: string;
    }
    export interface IExtData {
        Serialize(trans: Transaction, writer: IO.BinaryWriter): void;
        Deserialize(trans: Transaction, reader: IO.BinaryReader): void;
    }
    export class InvokeTransData implements IExtData {
        script: Uint8Array;
        gas: Fixed8;
        Serialize(trans: Transaction, writer: IO.BinaryWriter): void;
        Deserialize(trans: Transaction, reader: IO.BinaryReader): void;
    }
    export class Transaction {
        type: TransactionType;
        version: number;
        attributes: Attribute[];
        inputs: TransactionInput[];
        outputs: TransactionOutput[];
        witnesses: Witness[];
        SerializeUnsigned(writer: IO.BinaryWriter): void;
        Serialize(writer: IO.BinaryWriter): void;
        extdata: IExtData;
        Deserialize(ms: IO.BinaryReader): void;
        GetMessage(): Uint8Array;
        GetRawData(): Uint8Array;
        AddWitness(signdata: Uint8Array, pubkey: Uint8Array, addrs: string): void;
        AddWitnessScript(vscript: Uint8Array, iscript: Uint8Array): void;
        GetHash(): Uint8Array;
    }
}
declare module "thinneo/opcode" {
    export enum OpCode {
        PUSH0 = 0,
        PUSHF = 0,
        PUSHBYTES1 = 1,
        PUSHBYTES75 = 75,
        PUSHDATA1 = 76,
        PUSHDATA2 = 77,
        PUSHDATA4 = 78,
        PUSHM1 = 79,
        PUSH1 = 81,
        PUSHT = 81,
        PUSH2 = 82,
        PUSH3 = 83,
        PUSH4 = 84,
        PUSH5 = 85,
        PUSH6 = 86,
        PUSH7 = 87,
        PUSH8 = 88,
        PUSH9 = 89,
        PUSH10 = 90,
        PUSH11 = 91,
        PUSH12 = 92,
        PUSH13 = 93,
        PUSH14 = 94,
        PUSH15 = 95,
        PUSH16 = 96,
        NOP = 97,
        JMP = 98,
        JMPIF = 99,
        JMPIFNOT = 100,
        CALL = 101,
        RET = 102,
        APPCALL = 103,
        SYSCALL = 104,
        TAILCALL = 105,
        DUPFROMALTSTACK = 106,
        TOALTSTACK = 107,
        FROMALTSTACK = 108,
        XDROP = 109,
        XSWAP = 114,
        XTUCK = 115,
        DEPTH = 116,
        DROP = 117,
        DUP = 118,
        NIP = 119,
        OVER = 120,
        PICK = 121,
        ROLL = 122,
        ROT = 123,
        SWAP = 124,
        TUCK = 125,
        CAT = 126,
        SUBSTR = 127,
        LEFT = 128,
        RIGHT = 129,
        SIZE = 130,
        INVERT = 131,
        AND = 132,
        OR = 133,
        XOR = 134,
        EQUAL = 135,
        INC = 139,
        DEC = 140,
        SIGN = 141,
        NEGATE = 143,
        ABS = 144,
        NOT = 145,
        NZ = 146,
        ADD = 147,
        SUB = 148,
        MUL = 149,
        DIV = 150,
        MOD = 151,
        SHL = 152,
        SHR = 153,
        BOOLAND = 154,
        BOOLOR = 155,
        NUMEQUAL = 156,
        NUMNOTEQUAL = 158,
        LT = 159,
        GT = 160,
        LTE = 161,
        GTE = 162,
        MIN = 163,
        MAX = 164,
        WITHIN = 165,
        SHA1 = 167,
        SHA256 = 168,
        HASH160 = 169,
        HASH256 = 170,
        CSHARPSTRHASH32 = 171,
        JAVAHASH32 = 173,
        CHECKSIG = 172,
        CHECKMULTISIG = 174,
        ARRAYSIZE = 192,
        PACK = 193,
        UNPACK = 194,
        PICKITEM = 195,
        SETITEM = 196,
        NEWARRAY = 197,
        NEWSTRUCT = 198,
        SWITCH = 208,
        THROW = 240,
        THROWIFNOT = 241,
    }
}
declare module "thinneo/avm2asm/avm2asm" {
    import { Op } from "index";
    export class Avm2Asm {
        static Trans(script: Uint8Array): Op[];
    }
}
declare module "thinneo/avm2asm/byteReader" {
    import { OpCode } from "index";
    export class ByteReader {
        constructor(data: Uint8Array);
        data: Uint8Array;
        addr: number;
        ReadOP(): OpCode;
        ReadBytes(count: number): Uint8Array;
        ReadByte(): number;
        ReadUInt16(): number;
        ReadInt16(): number;
        ReadUInt32(): number;
        ReadInt32(): number;
        ReadUInt64(): number;
        ReadVarBytes(): Uint8Array;
        ReadVarInt(): number;
        readonly End: boolean;
    }
}
declare module "thinneo/avm2asm/op" {
    import { OpCode } from "index";
    export enum ParamType {
        None = 0,
        ByteArray = 1,
        String = 2,
        Addr = 3,
    }
    export class Op {
        addr: number;
        error: boolean;
        code: OpCode;
        paramData: Uint8Array;
        paramType: ParamType;
        toString(): string;
        AsHexString(): string;
        AsString(): string;
        AsAddr(): number;
        getCodeName(): string;
    }
}
declare module "thinneo/avm2asm/index" {
    export * from "thinneo/avm2asm/avm2asm";
    export * from "thinneo/avm2asm/byteReader";
    export * from "thinneo/avm2asm/op";
}
declare module "thinneo/index" {
    export * from "thinneo/Base64";
    export * from "thinneo/ScriptBuilder";
    export * from "thinneo/TransAction";
    export * from "thinneo/opcode";
    export * from "thinneo/helper";
    export * from "thinneo/avm2asm/index";
    import * as Complier from "thinneo/avm2asm/index";
    export { Complier };
}
declare module "index" {
    import * as neo from "neo/index";
    import * as nep6 from "nep6/index";
    import * as thinneo from "thinneo/index";
    export * from "neo/index";
    export * from "thinneo/index";
    export { neo, nep6, thinneo };
}
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
