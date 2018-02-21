import { OpCode } from '../../index';
export declare enum ParamType {
    None = 0,
    ByteArray = 1,
    String = 2,
    Addr = 3,
}
export declare class Op {
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
