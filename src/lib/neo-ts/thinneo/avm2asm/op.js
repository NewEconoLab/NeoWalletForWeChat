import { OpCode } from '../../index';
export var ParamType;
(function (ParamType) {
    ParamType[ParamType["None"] = 0] = "None";
    ParamType[ParamType["ByteArray"] = 1] = "ByteArray";
    ParamType[ParamType["String"] = 2] = "String";
    ParamType[ParamType["Addr"] = 3] = "Addr";
})(ParamType || (ParamType = {}));
export class Op {
    toString() {
        var name = this.getCodeName();
        if (this.paramType == ParamType.None) {
        }
        else if (this.paramType == ParamType.ByteArray) {
            name += "[" + this.AsHexString() + "]";
        }
        else if (this.paramType == ParamType.String) {
            name += "[" + this.AsString() + "]";
        }
        else if (this.paramType == ParamType.Addr) {
            name += "[" + this.AsAddr() + "]";
        }
        return this.addr.toString(16) + ":" + name;
    }
    AsHexString() {
        var str = "0x";
        for (var i = 0; i < this.paramData.length; i++) {
            var s = this.paramData[i].toString(16);
            if (s.length % 2 == 1)
                s = "0" + s;
            str += s;
        }
        return str;
    }
    AsString() {
        var str = "";
        for (var i = 0; i < this.paramData.length; i++) {
            str += this.paramData[i].toLocaleString();
        }
        return str;
    }
    AsAddr() {
        var dview = new DataView(this.paramData.buffer);
        return dview.getInt16(0, true);
    }
    getCodeName() {
        var name = "";
        if (this.error)
            name = "[E]";
        if (this.code == OpCode.PUSHT)
            return "PUSH1(true)";
        if (this.code == OpCode.PUSHF)
            return "PUSH0(false)";
        if (this.code > OpCode.PUSHBYTES1 && this.code < OpCode.PUSHBYTES75)
            return name + "PUSHBYTES" + (this.code - OpCode.PUSHBYTES1 + 1);
        else
            return name + OpCode[this.code].toString();
    }
}
//# sourceMappingURL=op.js.map