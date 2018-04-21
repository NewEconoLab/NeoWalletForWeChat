"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const op_1 = require("./op");
const byteReader_1 = require("./byteReader");
const opcode_1 = require("../opcode");
class Avm2Asm {
    static Trans(script) {
        var breader = new byteReader_1.ByteReader(script);
        var arr = new Array();
        while (breader.End == false) {
            var o = new op_1.Op();
            o.addr = breader.addr;
            o.code = breader.ReadOP();
            try {
                if (o.code >= opcode_1.OpCode.PUSHBYTES1 && o.code <= opcode_1.OpCode.PUSHBYTES75) {
                    o.paramType = op_1.ParamType.ByteArray;
                    var _count = o.code;
                    o.paramData = breader.ReadBytes(_count);
                }
                else {
                    switch (o.code) {
                        case opcode_1.OpCode.PUSH0:
                        case opcode_1.OpCode.PUSHM1:
                        case opcode_1.OpCode.PUSH1:
                        case opcode_1.OpCode.PUSH2:
                        case opcode_1.OpCode.PUSH3:
                        case opcode_1.OpCode.PUSH4:
                        case opcode_1.OpCode.PUSH5:
                        case opcode_1.OpCode.PUSH6:
                        case opcode_1.OpCode.PUSH7:
                        case opcode_1.OpCode.PUSH8:
                        case opcode_1.OpCode.PUSH9:
                        case opcode_1.OpCode.PUSH10:
                        case opcode_1.OpCode.PUSH11:
                        case opcode_1.OpCode.PUSH12:
                        case opcode_1.OpCode.PUSH13:
                        case opcode_1.OpCode.PUSH14:
                        case opcode_1.OpCode.PUSH15:
                        case opcode_1.OpCode.PUSH16:
                            o.paramType = op_1.ParamType.None;
                            break;
                        case opcode_1.OpCode.PUSHDATA1:
                            {
                                o.paramType = op_1.ParamType.ByteArray;
                                var _count = breader.ReadByte();
                                o.paramData = breader.ReadBytes(_count);
                            }
                            break;
                        case opcode_1.OpCode.PUSHDATA2:
                            {
                                o.paramType = op_1.ParamType.ByteArray;
                                var _count = breader.ReadUInt16();
                                o.paramData = breader.ReadBytes(_count);
                            }
                            break;
                        case opcode_1.OpCode.PUSHDATA4:
                            {
                                o.paramType = op_1.ParamType.ByteArray;
                                var _count = breader.ReadInt32();
                                o.paramData = breader.ReadBytes(_count);
                            }
                            break;
                        case opcode_1.OpCode.NOP:
                            o.paramType = op_1.ParamType.None;
                            break;
                        case opcode_1.OpCode.JMP:
                        case opcode_1.OpCode.JMPIF:
                        case opcode_1.OpCode.JMPIFNOT:
                            o.paramType = op_1.ParamType.Addr;
                            o.paramData = breader.ReadBytes(2);
                            break;
                        case opcode_1.OpCode.CALL:
                            o.paramType = op_1.ParamType.Addr;
                            o.paramData = breader.ReadBytes(2);
                            break;
                        case opcode_1.OpCode.RET:
                            o.paramType = op_1.ParamType.None;
                            break;
                        case opcode_1.OpCode.APPCALL:
                        case opcode_1.OpCode.TAILCALL:
                            o.paramType = op_1.ParamType.ByteArray;
                            o.paramData = breader.ReadBytes(20);
                            break;
                        case opcode_1.OpCode.SYSCALL:
                            o.paramType = op_1.ParamType.String;
                            o.paramData = breader.ReadVarBytes();
                            break;
                        case opcode_1.OpCode.DUPFROMALTSTACK:
                        case opcode_1.OpCode.TOALTSTACK:
                        case opcode_1.OpCode.FROMALTSTACK:
                        case opcode_1.OpCode.XDROP:
                        case opcode_1.OpCode.XSWAP:
                        case opcode_1.OpCode.XTUCK:
                        case opcode_1.OpCode.DEPTH:
                        case opcode_1.OpCode.DROP:
                        case opcode_1.OpCode.DUP:
                        case opcode_1.OpCode.NIP:
                        case opcode_1.OpCode.OVER:
                        case opcode_1.OpCode.PICK:
                        case opcode_1.OpCode.ROLL:
                        case opcode_1.OpCode.ROT:
                        case opcode_1.OpCode.SWAP:
                        case opcode_1.OpCode.TUCK:
                            o.paramType = op_1.ParamType.None;
                            break;
                        case opcode_1.OpCode.CAT:
                        case opcode_1.OpCode.SUBSTR:
                        case opcode_1.OpCode.LEFT:
                        case opcode_1.OpCode.RIGHT:
                        case opcode_1.OpCode.SIZE:
                            o.paramType = op_1.ParamType.None;
                            break;
                        case opcode_1.OpCode.INVERT:
                        case opcode_1.OpCode.AND:
                        case opcode_1.OpCode.OR:
                        case opcode_1.OpCode.XOR:
                        case opcode_1.OpCode.EQUAL:
                            o.paramType = op_1.ParamType.None;
                            break;
                        case opcode_1.OpCode.INC:
                        case opcode_1.OpCode.DEC:
                        case opcode_1.OpCode.SIGN:
                        case opcode_1.OpCode.NEGATE:
                        case opcode_1.OpCode.ABS:
                        case opcode_1.OpCode.NOT:
                        case opcode_1.OpCode.NZ:
                        case opcode_1.OpCode.ADD:
                        case opcode_1.OpCode.SUB:
                        case opcode_1.OpCode.MUL:
                        case opcode_1.OpCode.DIV:
                        case opcode_1.OpCode.MOD:
                        case opcode_1.OpCode.SHL:
                        case opcode_1.OpCode.SHR:
                        case opcode_1.OpCode.BOOLAND:
                        case opcode_1.OpCode.BOOLOR:
                        case opcode_1.OpCode.NUMEQUAL:
                        case opcode_1.OpCode.NUMNOTEQUAL:
                        case opcode_1.OpCode.LT:
                        case opcode_1.OpCode.GT:
                        case opcode_1.OpCode.LTE:
                        case opcode_1.OpCode.GTE:
                        case opcode_1.OpCode.MIN:
                        case opcode_1.OpCode.MAX:
                        case opcode_1.OpCode.WITHIN:
                            o.paramType = op_1.ParamType.None;
                            break;
                        case opcode_1.OpCode.SHA1:
                        case opcode_1.OpCode.SHA256:
                        case opcode_1.OpCode.HASH160:
                        case opcode_1.OpCode.HASH256:
                        case opcode_1.OpCode.CSHARPSTRHASH32:
                        case opcode_1.OpCode.JAVAHASH32:
                        case opcode_1.OpCode.CHECKSIG:
                        case opcode_1.OpCode.CHECKMULTISIG:
                            o.paramType = op_1.ParamType.None;
                            break;
                        case opcode_1.OpCode.ARRAYSIZE:
                        case opcode_1.OpCode.PACK:
                        case opcode_1.OpCode.UNPACK:
                        case opcode_1.OpCode.PICKITEM:
                        case opcode_1.OpCode.SETITEM:
                        case opcode_1.OpCode.NEWARRAY:
                        case opcode_1.OpCode.NEWSTRUCT:
                            o.paramType = op_1.ParamType.None;
                            break;
                        case opcode_1.OpCode.THROW:
                        case opcode_1.OpCode.THROWIFNOT:
                            o.paramType = op_1.ParamType.None;
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
    }
}
exports.Avm2Asm = Avm2Asm;
//# sourceMappingURL=avm2asm.js.map