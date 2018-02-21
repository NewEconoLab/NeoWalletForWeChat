import { OpCode } from './index';
import { BigInteger } from '../neo/BigInteger';
export declare class ScriptBuilder {
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
