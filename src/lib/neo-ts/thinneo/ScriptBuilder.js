"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const opcode_1 = require("./opcode");
const AccountHelper_1 = require("../Helper/AccountHelper");
class ScriptBuilder {
    constructor() {
        this.Offset = 0;
        this.writer = [];
    }
    _WriteUint8(num) {
        this.writer.push(num);
        this.Offset++;
    }
    _WriteUint16(num) {
        var buf = new Uint8Array(2);
        var d = new DataView(buf.buffer, 0, 2);
        d.setUint16(0, num, true);
        this.writer.push(buf[0]);
        this.writer.push(buf[1]);
        this.Offset += 2;
    }
    _WriteUint32(num) {
        var buf = new Uint8Array(4);
        var d = new DataView(buf.buffer, 0, 4);
        d.setUint32(0, num, true);
        this.writer.push(buf[0]);
        this.writer.push(buf[1]);
        this.writer.push(buf[2]);
        this.writer.push(buf[3]);
        this.Offset += 4;
    }
    _WriteUint8Array(nums) {
        for (var i = 0; i < nums.length; i++)
            this.writer.push(nums[i]);
        this.Offset += nums.length;
    }
    _ConvertInt16ToBytes(num) {
        var buf = new Uint8Array(2);
        var d = new DataView(buf.buffer, 0, 2);
        d.setInt16(0, num, true);
        return buf;
    }
    Emit(op, arg = null) {
        this._WriteUint8(op);
        if (arg != null)
            this._WriteUint8Array(arg);
        return this;
    }
    EmitAppCall(scriptHash, useTailCall = false) {
        if (scriptHash.length != 20)
            throw new Error("error scriptHash length");
        return this.Emit(useTailCall ? opcode_1.OpCode.TAILCALL : opcode_1.OpCode.APPCALL, scriptHash);
    }
    EmitJump(op, offset) {
        if (op != opcode_1.OpCode.JMP && op != opcode_1.OpCode.JMPIF && op != opcode_1.OpCode.JMPIFNOT && op != opcode_1.OpCode.CALL)
            throw new Error("ArgumentException");
        return this.Emit(op, this._ConvertInt16ToBytes(offset));
    }
    EmitPushNumber(number) {
        var i32 = number.toInt32();
        if (i32 == -1)
            return this.Emit(opcode_1.OpCode.PUSHM1);
        if (i32 == 0)
            return this.Emit(opcode_1.OpCode.PUSH0);
        if (i32 > 0 && i32 <= 16)
            return this.Emit(opcode_1.OpCode.PUSH1 - 1 + i32);
        return this.EmitPushBytes(number.toUint8Array(true));
    }
    EmitPushBool(data) {
        return this.Emit(data ? opcode_1.OpCode.PUSHT : opcode_1.OpCode.PUSHF);
    }
    EmitPushBytes(data) {
        if (data == null)
            throw new Error("ArgumentNullException");
        if (data.length <= opcode_1.OpCode.PUSHBYTES75) {
            this._WriteUint8(data.length);
            this._WriteUint8Array(data);
        }
        else if (data.length < 0x100) {
            this.Emit(opcode_1.OpCode.PUSHDATA1);
            this._WriteUint8(data.length);
            this._WriteUint8Array(data);
        }
        else if (data.length < 0x10000) {
            this.Emit(opcode_1.OpCode.PUSHDATA2);
            this._WriteUint16(data.length);
            this._WriteUint8Array(data);
        }
        else {
            this.Emit(opcode_1.OpCode.PUSHDATA4);
            this._WriteUint32(data.length);
            this._WriteUint8Array(data);
        }
        return this;
    }
    EmitPushString(data) {
        return this.EmitPushBytes(AccountHelper_1.Helper.String2Bytes(data));
    }
    EmitSysCall(api) {
        if (api == null)
            throw new Error("ArgumentNullException");
        var api_bytes = AccountHelper_1.Helper.String2Bytes(api);
        if (api_bytes.length == 0 || api_bytes.length > 252)
            throw new Error("ArgumentException");
        var arg = new Uint8Array(api_bytes.length + 1);
        arg[0] = api_bytes.length;
        for (var i = 0; i < api_bytes.length; i++) {
            arg[i + 1] = api_bytes[i];
        }
        return this.Emit(opcode_1.OpCode.SYSCALL, arg);
    }
    ToArray() {
        var array = new Uint8Array(this.writer.length);
        for (var i = 0; i < this.writer.length; i++) {
            array[i] = this.writer[i];
        }
        return array;
    }
    EmitParamJson(param) {
        return this;
    }
}
exports.ScriptBuilder = ScriptBuilder;
//# sourceMappingURL=ScriptBuilder.js.map