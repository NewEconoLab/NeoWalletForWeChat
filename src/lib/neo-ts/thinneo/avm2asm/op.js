"use strict";
exports.__esModule = true;
var index_1 = require("../../index");
var ParamType;
(function (ParamType) {
    ParamType[ParamType["None"] = 0] = "None";
    ParamType[ParamType["ByteArray"] = 1] = "ByteArray";
    ParamType[ParamType["String"] = 2] = "String";
    ParamType[ParamType["Addr"] = 3] = "Addr";
})(ParamType = exports.ParamType || (exports.ParamType = {}));
var Op = /** @class */ (function () {
    function Op() {
    }
    Op.prototype.toString = function () {
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
    };
    Op.prototype.AsHexString = function () {
        var str = "0x";
        for (var i = 0; i < this.paramData.length; i++) {
            var s = this.paramData[i].toString(16);
            if (s.length % 2 == 1)
                s = "0" + s;
            str += s;
        }
        return str;
    };
    Op.prototype.AsString = function () {
        var str = "";
        for (var i = 0; i < this.paramData.length; i++) {
            str += this.paramData[i].toLocaleString();
        }
        return str;
    };
    Op.prototype.AsAddr = function () {
        var dview = new DataView(this.paramData.buffer);
        return dview.getInt16(0, true);
    };
    Op.prototype.getCodeName = function () {
        var name = "";
        if (this.error)
            name = "[E]";
        if (this.code == index_1.OpCode.PUSHT)
            return "PUSH1(true)";
        if (this.code == index_1.OpCode.PUSHF)
            return "PUSH0(false)";
        if (this.code > index_1.OpCode.PUSHBYTES1 && this.code < index_1.OpCode.PUSHBYTES75)
            return name + "PUSHBYTES" + (this.code - index_1.OpCode.PUSHBYTES1 + 1);
        else
            return name + index_1.OpCode[this.code].toString();
    };
    return Op;
}());
exports.Op = Op;
