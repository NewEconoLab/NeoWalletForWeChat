"use strict";
exports.__esModule = true;
var index_1 = require("../index");
var ScriptBuilder = /** @class */ (function () {
    function ScriptBuilder() {
        this.Offset = 0;
        this.writer = [];
    }
    ScriptBuilder.prototype._WriteUint8 = function (num) {
        this.writer.push(num);
        this.Offset++;
    };
    ScriptBuilder.prototype._WriteUint16 = function (num) {
        var buf = new Uint8Array(2);
        var d = new DataView(buf.buffer, 0, 2);
        d.setUint16(0, num, true);
        this.writer.push(buf[0]);
        this.writer.push(buf[1]);
        this.Offset += 2;
    };
    ScriptBuilder.prototype._WriteUint32 = function (num) {
        var buf = new Uint8Array(4);
        var d = new DataView(buf.buffer, 0, 4);
        d.setUint32(0, num, true);
        this.writer.push(buf[0]);
        this.writer.push(buf[1]);
        this.writer.push(buf[2]);
        this.writer.push(buf[3]);
        this.Offset += 4;
    };
    ScriptBuilder.prototype._WriteUint8Array = function (nums) {
        for (var i = 0; i < nums.length; i++)
            this.writer.push(nums[i]);
        this.Offset += nums.length;
    };
    ScriptBuilder.prototype._ConvertInt16ToBytes = function (num) {
        var buf = new Uint8Array(2);
        var d = new DataView(buf.buffer, 0, 2);
        d.setInt16(0, num, true);
        return buf;
    };
    ScriptBuilder.prototype.Emit = function (op, arg) {
        if (arg === void 0) { arg = null; }
        this._WriteUint8(op);
        if (arg != null)
            this._WriteUint8Array(arg);
        return this;
    };
    ScriptBuilder.prototype.EmitAppCall = function (scriptHash, useTailCall) {
        if (useTailCall === void 0) { useTailCall = false; }
        if (scriptHash.length != 20)
            throw new Error("error scriptHash length");
        return this.Emit(useTailCall ? index_1.OpCode.TAILCALL : index_1.OpCode.APPCALL, scriptHash);
    };
    ScriptBuilder.prototype.EmitJump = function (op, offset) {
        if (op != index_1.OpCode.JMP && op != index_1.OpCode.JMPIF && op != index_1.OpCode.JMPIFNOT && op != index_1.OpCode.CALL)
            throw new Error("ArgumentException");
        return this.Emit(op, this._ConvertInt16ToBytes(offset));
    };
    ScriptBuilder.prototype.EmitPushNumber = function (number) {
        var i32 = number.toInt32();
        if (i32 == -1)
            return this.Emit(index_1.OpCode.PUSHM1);
        if (i32 == 0)
            return this.Emit(index_1.OpCode.PUSH0);
        if (i32 > 0 && i32 <= 16)
            return this.Emit(index_1.OpCode.PUSH1 - 1 + i32);
        return this.EmitPushBytes(number.toUint8Array(true));
    };
    ScriptBuilder.prototype.EmitPushBool = function (data) {
        return this.Emit(data ? index_1.OpCode.PUSHT : index_1.OpCode.PUSHF);
    };
    ScriptBuilder.prototype.EmitPushBytes = function (data) {
        if (data == null)
            throw new Error("ArgumentNullException");
        if (data.length <= index_1.OpCode.PUSHBYTES75) {
            this._WriteUint8(data.length);
            this._WriteUint8Array(data);
        }
        else if (data.length < 0x100) {
            this.Emit(index_1.OpCode.PUSHDATA1);
            this._WriteUint8(data.length);
            this._WriteUint8Array(data);
        }
        else if (data.length < 0x10000) {
            this.Emit(index_1.OpCode.PUSHDATA2);
            this._WriteUint16(data.length);
            this._WriteUint8Array(data);
        }
        else {
            this.Emit(index_1.OpCode.PUSHDATA4);
            this._WriteUint32(data.length);
            this._WriteUint8Array(data);
        }
        return this;
    };
    ScriptBuilder.prototype.EmitPushString = function (data) {
        return this.EmitPushBytes(index_1.Helper.String2Bytes(data));
    };
    ScriptBuilder.prototype.EmitSysCall = function (api) {
        if (api == null)
            throw new Error("ArgumentNullException");
        var api_bytes = index_1.Helper.String2Bytes(api);
        if (api_bytes.length == 0 || api_bytes.length > 252)
            throw new Error("ArgumentException");
        var arg = new Uint8Array(api_bytes.length + 1);
        arg[0] = api_bytes.length;
        for (var i = 0; i < api_bytes.length; i++) {
            arg[i + 1] = api_bytes[i];
        }
        return this.Emit(index_1.OpCode.SYSCALL, arg);
    };
    ScriptBuilder.prototype.ToArray = function () {
        var array = new Uint8Array(this.writer.length);
        for (var i = 0; i < this.writer.length; i++) {
            array[i] = this.writer[i];
        }
        return array;
    };
    //如果参数为string,其实是特殊值
    //(string) or(str) 开头，表示是个字符串，utf8编码为bytes
    //(bytes) or([])开头，表示就是一个bytearray
    //(address) or(addr)开头，表示是一个地址，转换为脚本hash
    //(integer) or(int) 开头，表示是一个大整数
    //(hexinteger) or (hexint) or (hex) 开头，表示是一个16进制表示的大整数，转换为bytes就是反序
    //(int256) or (hex256) 开头,表示是一个定长的256位 16进制大整数
    //(int160) or (hex160) 开头,表示是一个定长的160位 16进制大整数
    ScriptBuilder.prototype.EmitParamJson = function (param) {
        if (typeof param === "number") {
            this.EmitPushNumber(new index_1.BigInteger(param));
        }
        else if (typeof param === "boolean") {
            this.EmitPushBool(param);
        }
        else if (typeof param === "object") {
            var list = param;
            for (var i = list.length - 1; i >= 0; i--) {
                this.EmitParamJson(list[i]);
            }
            this.EmitPushNumber(new index_1.BigInteger(list.length));
            this.Emit(index_1.OpCode.PACK);
        }
        else if (typeof param === "string") {
            var str = param;
            if (str[0] != '(')
                throw new Error("must start with:(str) or (hex) or (hexrev) or (addr)or(int)");
            //(string) or(str) 开头，表示是个字符串，utf8编码为bytes
            if (str.indexOf("(string)") == 0) {
                this.EmitPushString(str.substr(8));
            }
            if (str.indexOf("(str)") == 0) {
                this.EmitPushString(str.substr(5));
            }
            else if (str.indexOf("(bytes)") == 0) {
                var hex = str.substr(7).hexToBytes();
                this.EmitPushBytes(hex);
            }
            else if (str.indexOf("([])") == 0) {
                var hex = str.substr(4).hexToBytes();
                this.EmitPushBytes(hex);
            }
            else if (str.indexOf("(address)") == 0) {
                var addr = (str.substr(9));
                var hex = index_1.Helper.GetPublicKeyScriptHash_FromAddress(addr);
                this.EmitPushBytes(hex);
            }
            else if (str.indexOf("(addr)") == 0) {
                var addr = (str.substr(6));
                var hex = index_1.Helper.GetPublicKeyScriptHash_FromAddress(addr);
                this.EmitPushBytes(hex);
            }
            else if (str.indexOf("(integer)") == 0) {
                var num = new index_1.BigInteger(str.substr(9));
                this.EmitPushNumber(num);
            }
            else if (str.indexOf("(int)") == 0) {
                var num = new index_1.BigInteger(str.substr(5));
                this.EmitPushNumber(num);
            }
            else if (str.indexOf("(hexinteger)") == 0) {
                var hex = str.substr(12).hexToBytes();
                this.EmitPushBytes(hex.reverse());
            }
            else if (str.indexOf("(hexint)") == 0) {
                var hex = str.substr(8).hexToBytes();
                this.EmitPushBytes(hex.reverse());
            }
            else if (str.indexOf("(hex)") == 0) {
                var hex = str.substr(5).hexToBytes();
                this.EmitPushBytes(hex.reverse());
            }
            else if (str.indexOf("(int256)") == 0 || str.indexOf("(hex256)") == 0) {
                var hex = str.substr(8).hexToBytes();
                if (hex.length != 32)
                    throw new Error("not a int256");
                this.EmitPushBytes(hex.reverse());
            }
            else if (str.indexOf("(int160)") == 0 || str.indexOf("(hex160)") == 0) {
                var hex = str.substr(8).hexToBytes();
                if (hex.length != 20)
                    throw new Error("not a int160");
                this.EmitPushBytes(hex.reverse());
            }
            else
                throw new Error("must start with:(str) or (hex) or (hexbig) or (addr) or(int)");
        }
        else {
            throw new Error("error type:" + typeof param);
        }
        return this;
    };
    return ScriptBuilder;
}());
exports.ScriptBuilder = ScriptBuilder;
