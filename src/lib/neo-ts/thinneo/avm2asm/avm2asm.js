"use strict";
exports.__esModule = true;
var index_1 = require("../../index");
var Avm2Asm = /** @class */ (function () {
    function Avm2Asm() {
    }
    Avm2Asm.Trans = function (script) {
        var breader = new index_1.ByteReader(script);
        var arr = new Array();
        while (breader.End == false) {
            var o = new index_1.Op();
            o.addr = breader.addr;
            o.code = breader.ReadOP();
            try {
                //push 特别处理
                if (o.code >= index_1.OpCode.PUSHBYTES1 && o.code <= index_1.OpCode.PUSHBYTES75) {
                    o.paramType = index_1.ParamType.ByteArray;
                    var _count = o.code;
                    o.paramData = breader.ReadBytes(_count);
                }
                else {
                    switch (o.code) {
                        case index_1.OpCode.PUSH0:
                        case index_1.OpCode.PUSHM1:
                        case index_1.OpCode.PUSH1:
                        case index_1.OpCode.PUSH2:
                        case index_1.OpCode.PUSH3:
                        case index_1.OpCode.PUSH4:
                        case index_1.OpCode.PUSH5:
                        case index_1.OpCode.PUSH6:
                        case index_1.OpCode.PUSH7:
                        case index_1.OpCode.PUSH8:
                        case index_1.OpCode.PUSH9:
                        case index_1.OpCode.PUSH10:
                        case index_1.OpCode.PUSH11:
                        case index_1.OpCode.PUSH12:
                        case index_1.OpCode.PUSH13:
                        case index_1.OpCode.PUSH14:
                        case index_1.OpCode.PUSH15:
                        case index_1.OpCode.PUSH16:
                            o.paramType = index_1.ParamType.None;
                            break;
                        case index_1.OpCode.PUSHDATA1:
                            {
                                o.paramType = index_1.ParamType.ByteArray;
                                var _count = breader.ReadByte();
                                o.paramData = breader.ReadBytes(_count);
                            }
                            break;
                        case index_1.OpCode.PUSHDATA2:
                            {
                                o.paramType = index_1.ParamType.ByteArray;
                                var _count = breader.ReadUInt16();
                                o.paramData = breader.ReadBytes(_count);
                            }
                            break;
                        case index_1.OpCode.PUSHDATA4:
                            {
                                o.paramType = index_1.ParamType.ByteArray;
                                var _count = breader.ReadInt32();
                                o.paramData = breader.ReadBytes(_count);
                            }
                            break;
                        case index_1.OpCode.NOP:
                            o.paramType = index_1.ParamType.None;
                            break;
                        case index_1.OpCode.JMP:
                        case index_1.OpCode.JMPIF:
                        case index_1.OpCode.JMPIFNOT:
                            o.paramType = index_1.ParamType.Addr;
                            o.paramData = breader.ReadBytes(2);
                            break;
                        //case OpCode.SWITCH:
                        //    {
                        //        o.paramType = ParamType.ByteArray;
                        //        var count = breader.ReadInt16();
                        //        o.paramData = BitConverter.GetBytes(count).Concat(breader.ReadBytes(count * 6)).ToArray();
                        //    }
                        //    break;
                        case index_1.OpCode.CALL:
                            o.paramType = index_1.ParamType.Addr;
                            o.paramData = breader.ReadBytes(2);
                            break;
                        case index_1.OpCode.RET:
                            o.paramType = index_1.ParamType.None;
                            break;
                        case index_1.OpCode.APPCALL:
                        case index_1.OpCode.TAILCALL:
                            o.paramType = index_1.ParamType.ByteArray;
                            o.paramData = breader.ReadBytes(20);
                            break;
                        case index_1.OpCode.SYSCALL:
                            o.paramType = index_1.ParamType.String;
                            o.paramData = breader.ReadVarBytes();
                            break;
                        case index_1.OpCode.DUPFROMALTSTACK:
                        case index_1.OpCode.TOALTSTACK:
                        case index_1.OpCode.FROMALTSTACK:
                        case index_1.OpCode.XDROP:
                        case index_1.OpCode.XSWAP:
                        case index_1.OpCode.XTUCK:
                        case index_1.OpCode.DEPTH:
                        case index_1.OpCode.DROP:
                        case index_1.OpCode.DUP:
                        case index_1.OpCode.NIP:
                        case index_1.OpCode.OVER:
                        case index_1.OpCode.PICK:
                        case index_1.OpCode.ROLL:
                        case index_1.OpCode.ROT:
                        case index_1.OpCode.SWAP:
                        case index_1.OpCode.TUCK:
                            o.paramType = index_1.ParamType.None;
                            break;
                        case index_1.OpCode.CAT:
                        case index_1.OpCode.SUBSTR:
                        case index_1.OpCode.LEFT:
                        case index_1.OpCode.RIGHT:
                        case index_1.OpCode.SIZE:
                            o.paramType = index_1.ParamType.None;
                            break;
                        case index_1.OpCode.INVERT:
                        case index_1.OpCode.AND:
                        case index_1.OpCode.OR:
                        case index_1.OpCode.XOR:
                        case index_1.OpCode.EQUAL:
                            o.paramType = index_1.ParamType.None;
                            break;
                        case index_1.OpCode.INC:
                        case index_1.OpCode.DEC:
                        case index_1.OpCode.SIGN:
                        case index_1.OpCode.NEGATE:
                        case index_1.OpCode.ABS:
                        case index_1.OpCode.NOT:
                        case index_1.OpCode.NZ:
                        case index_1.OpCode.ADD:
                        case index_1.OpCode.SUB:
                        case index_1.OpCode.MUL:
                        case index_1.OpCode.DIV:
                        case index_1.OpCode.MOD:
                        case index_1.OpCode.SHL:
                        case index_1.OpCode.SHR:
                        case index_1.OpCode.BOOLAND:
                        case index_1.OpCode.BOOLOR:
                        case index_1.OpCode.NUMEQUAL:
                        case index_1.OpCode.NUMNOTEQUAL:
                        case index_1.OpCode.LT:
                        case index_1.OpCode.GT:
                        case index_1.OpCode.LTE:
                        case index_1.OpCode.GTE:
                        case index_1.OpCode.MIN:
                        case index_1.OpCode.MAX:
                        case index_1.OpCode.WITHIN:
                            o.paramType = index_1.ParamType.None;
                            break;
                        // Crypto
                        case index_1.OpCode.SHA1:
                        case index_1.OpCode.SHA256:
                        case index_1.OpCode.HASH160:
                        case index_1.OpCode.HASH256:
                        case index_1.OpCode.CSHARPSTRHASH32:
                        case index_1.OpCode.JAVAHASH32:
                        case index_1.OpCode.CHECKSIG:
                        case index_1.OpCode.CHECKMULTISIG:
                            o.paramType = index_1.ParamType.None;
                            break;
                        // Array
                        case index_1.OpCode.ARRAYSIZE:
                        case index_1.OpCode.PACK:
                        case index_1.OpCode.UNPACK:
                        case index_1.OpCode.PICKITEM:
                        case index_1.OpCode.SETITEM:
                        case index_1.OpCode.NEWARRAY:
                        case index_1.OpCode.NEWSTRUCT:
                            o.paramType = index_1.ParamType.None;
                            break;
                        // Exceptions
                        case index_1.OpCode.THROW:
                        case index_1.OpCode.THROWIFNOT:
                            o.paramType = index_1.ParamType.None;
                            break;
                        default:
                            throw new Error("you fogot a type:" + o.code);
                    }
                }
            }
            catch (_a) {
                o.error = true;
            }
            arr.push(o);
            if (o.error)
                break;
        }
        return arr;
    };
    return Avm2Asm;
}());
exports.Avm2Asm = Avm2Asm;
