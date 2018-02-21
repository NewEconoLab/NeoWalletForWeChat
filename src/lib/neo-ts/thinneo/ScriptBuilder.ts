export class ScriptBuilder {
    writer: number[];
    Offset: number = 0;

    public constructor() {
        this.writer = [];
    }

    _WriteUint8(num: number): void {
        this.writer.push(num);
        this.Offset++;
    }
    _WriteUint16(num: number): void {
        var buf = new Uint8Array(2);
        var d = new DataView(buf.buffer, 0, 2);
        d.setUint16(0, num, true);
        this.writer.push(buf[0]);
        this.writer.push(buf[1]);
        this.Offset += 2;
    }
    _WriteUint32(num: number): void {
        var buf = new Uint8Array(4);
        var d = new DataView(buf.buffer, 0, 4);
        d.setUint32(0, num, true);
        this.writer.push(buf[0]);
        this.writer.push(buf[1]);
        this.writer.push(buf[2]);
        this.writer.push(buf[3]);
        this.Offset += 4;
    }
    _WriteUint8Array(nums: Uint8Array): void {
        for (var i = 0; i < nums.length; i++)
            this.writer.push(nums[i]);
        this.Offset += nums.length;
    }
    _ConvertInt16ToBytes(num: number): Uint8Array {
        var buf = new Uint8Array(2);
        var d = new DataView(buf.buffer, 0, 2);
        d.setInt16(0, num, true);
        return buf;
    }
    public Emit(op: OpCode, arg: Uint8Array = null): ScriptBuilder {
        this._WriteUint8(op);
        if (arg != null)
            this._WriteUint8Array(arg);
        return this;
    }

    public EmitAppCall(scriptHash: Uint8Array, useTailCall: boolean = false): ScriptBuilder {
        if (scriptHash.length != 20)
            throw new Error("error scriptHash length");
        return this.Emit(useTailCall ? OpCode.TAILCALL : OpCode.APPCALL, scriptHash);
    }

    public EmitJump(op: OpCode, offset: number): ScriptBuilder {
        if (op != OpCode.JMP && op != OpCode.JMPIF && op != OpCode.JMPIFNOT && op != OpCode.CALL)
            throw new Error("ArgumentException");
        return this.Emit(op, this._ConvertInt16ToBytes(offset));
    }

    public EmitPushNumber(number: Neo.BigInteger): ScriptBuilder {
        var i32 = number.toInt32();
        if (i32 == -1) return this.Emit(OpCode.PUSHM1);
        if (i32 == 0) return this.Emit(OpCode.PUSH0);
        if (i32 > 0 && i32 <= 16) return this.Emit(OpCode.PUSH1 - 1 + i32);
        return this.EmitPushBytes(number.toUint8Array(true));
    }

    public EmitPushBool(data: boolean): ScriptBuilder {
        return this.Emit(data ? OpCode.PUSHT : OpCode.PUSHF);
    }

    public EmitPushBytes(data: Uint8Array): ScriptBuilder {
        if (data == null)
            throw new Error("ArgumentNullException");
        if (data.length <= OpCode.PUSHBYTES75) {
            this._WriteUint8(data.length);
            this._WriteUint8Array(data);
        }
        else if (data.length < 0x100) {
            this.Emit(OpCode.PUSHDATA1);
            this._WriteUint8(data.length);
            this._WriteUint8Array(data);
        }
        else if (data.length < 0x10000) {
            this.Emit(OpCode.PUSHDATA2);
            this._WriteUint16(data.length);
            this._WriteUint8Array(data);
        }
        else// if (data.Length < 0x100000000L)
        {
            this.Emit(OpCode.PUSHDATA4);
            this._WriteUint32(data.length);
            this._WriteUint8Array(data);
        }
        return this;
    }

    public EmitPushString(data: string): ScriptBuilder {
        return this.EmitPushBytes(ThinNeo.Helper.String2Bytes(data));
    }

    public EmitSysCall(api: string): ScriptBuilder {
        if (api == null)
            throw new Error("ArgumentNullException");
        var api_bytes = ThinNeo.Helper.String2Bytes(api);
        if (api_bytes.length == 0 || api_bytes.length > 252)
            throw new Error("ArgumentException");
        var arg: Uint8Array = new Uint8Array(api_bytes.length + 1);
        arg[0] = api_bytes.length;
        for (var i = 0; i < api_bytes.length; i++) {
            arg[i + 1] = api_bytes[i];
        }
        return this.Emit(OpCode.SYSCALL, arg);
    }

    public ToArray(): Uint8Array {

        var array = new Uint8Array(this.writer.length);
        for (var i = 0; i < this.writer.length; i++) {
            array[i] = this.writer[i];
        }
        return array;
    }
    //如果参数为string,其实是特殊值
    //(string) or(str) 开头，表示是个字符串，utf8编码为bytes
    //(bytes) or([])开头，表示就是一个bytearray
    //(address) or(addr)开头，表示是一个地址，转换为脚本hash
    //(integer) or(int) 开头，表示是一个大整数
    //(hexinteger) or (hexint) or (hex) 开头，表示是一个16进制表示的大整数，转换为bytes就是反序
    //(int256) or (hex256) 开头,表示是一个定长的256位 16进制大整数
    //(int160) or (hex160) 开头,表示是一个定长的160位 16进制大整数
    public EmitParamJson(param: any): ScriptBuilder {
        if (typeof param === "number")//bool 或小整数
        {
            this.EmitPushNumber(new Neo.BigInteger(param as number));
        }
        else if (typeof param === "boolean") {
            this.EmitPushBool(param as boolean);
        }
        else if (typeof param === "object") {
            var list = param as any[];
            for (var i = list.length - 1; i >= 0; i--) {
                this.EmitParamJson(list[i]);
            }
            this.EmitPushNumber(new Neo.BigInteger(list.length));
            this.Emit(ThinNeo.OpCode.PACK);
        }

        else if (typeof param === "string")//复杂格式
        {
            var str = param as string;
            if (str[0] != '(')
                throw new Error("must start with:(str) or (hex) or (hexrev) or (addr)or(int)");
            //(string) or(str) 开头，表示是个字符串，utf8编码为bytes
            if (str.indexOf("(string)") == 0) {
                this.EmitPushString(str.substr(8));
            }
            if (str.indexOf("(str)") == 0) {
                this.EmitPushString(str.substr(5));
            }
            //(bytes) or([])开头，表示就是一个bytearray
            else if (str.indexOf("(bytes)") == 0) {
                var hex = str.substr(7).hexToBytes();
                this.EmitPushBytes(hex);
            }
            else if (str.indexOf("([])") == 0) {
                var hex = str.substr(4).hexToBytes();
                this.EmitPushBytes(hex);
            }
            //(address) or(addr)开头，表示是一个地址，转换为脚本hash
            else if (str.indexOf("(address)") == 0) {
                var addr = (str.substr(9));
                var hex = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(addr);
                this.EmitPushBytes(hex);
            }
            else if (str.indexOf("(addr)") == 0) {
                var addr = (str.substr(6));
                var hex = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(addr);
                this.EmitPushBytes(hex);
            }
            //(integer) or(int) 开头，表示是一个大整数
            else if (str.indexOf("(integer)") == 0) {
                var num = new Neo.BigInteger(str.substr(9));
                this.EmitPushNumber(num);
            }
            else if (str.indexOf("(int)") == 0) {
                var num = new Neo.BigInteger(str.substr(5));
                this.EmitPushNumber(num);
            }
            //(hexinteger) or (hexint) or (hex) 开头，表示是一个16进制表示的大整数，转换为bytes就是反序
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
            //(int256) or (hex256) 开头,表示是一个定长的256位 16进制大整数
            else if (str.indexOf("(int256)") == 0 || str.indexOf("(hex256)") == 0) {
                var hex = str.substr(8).hexToBytes();
                if (hex.length != 32)
                    throw new Error("not a int256");
                this.EmitPushBytes(hex.reverse());
            }
            //(int160) or (hex160) 开头,表示是一个定长的160位 16进制大整数
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
    }
}
