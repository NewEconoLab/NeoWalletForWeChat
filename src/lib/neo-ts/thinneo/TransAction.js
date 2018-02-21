"use strict";
exports.__esModule = true;
///<reference path="helper.ts"/>
var index_1 = require("../index");
var TransactionType;
(function (TransactionType) {
    /// <summary>
    /// 用于分配字节费的特殊交易
    /// </summary>
    TransactionType[TransactionType["MinerTransaction"] = 0] = "MinerTransaction";
    /// <summary>
    /// 用于分发资产的特殊交易
    /// </summary>
    TransactionType[TransactionType["IssueTransaction"] = 1] = "IssueTransaction";
    /// <summary>
    /// 用于分配小蚁币的特殊交易
    /// </summary>
    TransactionType[TransactionType["ClaimTransaction"] = 2] = "ClaimTransaction";
    /// <summary>
    /// 用于报名成为记账候选人的特殊交易
    /// </summary>
    TransactionType[TransactionType["EnrollmentTransaction"] = 32] = "EnrollmentTransaction";
    /// <summary>
    /// 用于资产登记的特殊交易
    /// </summary>
    TransactionType[TransactionType["RegisterTransaction"] = 64] = "RegisterTransaction";
    /// <summary>
    /// 合约交易，这是最常用的一种交易
    /// </summary>
    TransactionType[TransactionType["ContractTransaction"] = 128] = "ContractTransaction";
    /// <summary>
    /// Publish scripts to the blockchain for being invoked later.
    /// </summary>
    TransactionType[TransactionType["PublishTransaction"] = 208] = "PublishTransaction";
    TransactionType[TransactionType["InvocationTransaction"] = 209] = "InvocationTransaction";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
var TransactionAttributeUsage;
(function (TransactionAttributeUsage) {
    /// <summary>
    /// 外部合同的散列值
    /// </summary>
    TransactionAttributeUsage[TransactionAttributeUsage["ContractHash"] = 0] = "ContractHash";
    /// <summary>
    /// 用于ECDH密钥交换的公钥，该公钥的第一个字节为0x02
    /// </summary>
    TransactionAttributeUsage[TransactionAttributeUsage["ECDH02"] = 2] = "ECDH02";
    /// <summary>
    /// 用于ECDH密钥交换的公钥，该公钥的第一个字节为0x03
    /// </summary>
    TransactionAttributeUsage[TransactionAttributeUsage["ECDH03"] = 3] = "ECDH03";
    /// <summary>
    /// 用于对交易进行额外的验证
    /// </summary>
    TransactionAttributeUsage[TransactionAttributeUsage["Script"] = 32] = "Script";
    TransactionAttributeUsage[TransactionAttributeUsage["Vote"] = 48] = "Vote";
    TransactionAttributeUsage[TransactionAttributeUsage["DescriptionUrl"] = 129] = "DescriptionUrl";
    TransactionAttributeUsage[TransactionAttributeUsage["Description"] = 144] = "Description";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash1"] = 161] = "Hash1";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash2"] = 162] = "Hash2";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash3"] = 163] = "Hash3";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash4"] = 164] = "Hash4";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash5"] = 165] = "Hash5";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash6"] = 166] = "Hash6";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash7"] = 167] = "Hash7";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash8"] = 168] = "Hash8";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash9"] = 169] = "Hash9";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash10"] = 170] = "Hash10";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash11"] = 171] = "Hash11";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash12"] = 172] = "Hash12";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash13"] = 173] = "Hash13";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash14"] = 174] = "Hash14";
    TransactionAttributeUsage[TransactionAttributeUsage["Hash15"] = 175] = "Hash15";
    /// <summary>
    /// 备注
    /// </summary>
    TransactionAttributeUsage[TransactionAttributeUsage["Remark"] = 240] = "Remark";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark1"] = 241] = "Remark1";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark2"] = 242] = "Remark2";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark3"] = 243] = "Remark3";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark4"] = 244] = "Remark4";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark5"] = 245] = "Remark5";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark6"] = 246] = "Remark6";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark7"] = 247] = "Remark7";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark8"] = 248] = "Remark8";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark9"] = 249] = "Remark9";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark10"] = 250] = "Remark10";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark11"] = 251] = "Remark11";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark12"] = 252] = "Remark12";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark13"] = 253] = "Remark13";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark14"] = 254] = "Remark14";
    TransactionAttributeUsage[TransactionAttributeUsage["Remark15"] = 255] = "Remark15";
})(TransactionAttributeUsage = exports.TransactionAttributeUsage || (exports.TransactionAttributeUsage = {}));
var Attribute = /** @class */ (function () {
    function Attribute() {
    }
    return Attribute;
}());
exports.Attribute = Attribute;
var TransactionOutput = /** @class */ (function () {
    function TransactionOutput() {
    }
    return TransactionOutput;
}());
exports.TransactionOutput = TransactionOutput;
var TransactionInput = /** @class */ (function () {
    function TransactionInput() {
    }
    return TransactionInput;
}());
exports.TransactionInput = TransactionInput;
var Witness = /** @class */ (function () {
    function Witness() {
    }
    Object.defineProperty(Witness.prototype, "Address", {
        //这个就是地址的脚本
        get: function () {
            var hash = index_1.Helper.GetScriptHashFromScript(this.VerificationScript);
            return index_1.Helper.GetAddressFromScriptHash(hash);
        },
        enumerable: true,
        configurable: true
    });
    return Witness;
}());
exports.Witness = Witness;
var InvokeTransData = /** @class */ (function () {
    function InvokeTransData() {
    }
    InvokeTransData.prototype.Serialize = function (trans, writer) {
        writer.writeVarBytes(this.script.buffer);
        if (trans.version >= 1) {
            writer.writeUint64(this.gas.getData());
        }
    };
    InvokeTransData.prototype.Deserialize = function (trans, reader) {
        var buf = reader.readVarBytes(10000000);
        this.script = new Uint8Array(buf, 0, buf.byteLength);
        if (trans.version >= 1) {
            this.gas = new index_1.Fixed8(reader.readUint64());
        }
    };
    return InvokeTransData;
}());
exports.InvokeTransData = InvokeTransData;
var Transaction = /** @class */ (function () {
    function Transaction() {
    }
    Transaction.prototype.SerializeUnsigned = function (writer) {
        //write type
        writer.writeByte(this.type);
        //write version
        writer.writeByte(this.version);
        //SerializeExclusiveData(writer);
        if (this.type == TransactionType.ContractTransaction) {
            //ContractTransaction 就是最常见的转账交易
            //他没有自己的独特处理
        }
        else if (this.type == TransactionType.InvocationTransaction) {
            this.extdata.Serialize(this, writer);
        }
        else {
            throw new Error("未编写针对这个交易类型的代码");
        }
        //#region write attribute
        var countAttributes = this.attributes.length;
        writer.writeVarInt(countAttributes);
        for (var i = 0; i < countAttributes; i++) {
            var attributeData = this.attributes[i].data;
            var Usage = this.attributes[i].usage;
            writer.writeByte(Usage);
            if (Usage == TransactionAttributeUsage.ContractHash || Usage == TransactionAttributeUsage.Vote || (Usage >= TransactionAttributeUsage.Hash1 && Usage <= TransactionAttributeUsage.Hash15)) {
                //attributeData =new byte[32];
                writer.write(attributeData.buffer, 0, 32);
            }
            else if (Usage == TransactionAttributeUsage.ECDH02 || Usage == TransactionAttributeUsage.ECDH03) {
                //attributeData = new byte[33];
                //attributeData[0] = (byte)Usage;
                writer.write(attributeData.buffer, 1, 32);
            }
            else if (Usage == TransactionAttributeUsage.Script) {
                //attributeData = new byte[20];
                writer.write(attributeData.buffer, 0, 20);
            }
            else if (Usage == TransactionAttributeUsage.DescriptionUrl) {
                //var len = (byte)ms.ReadByte();
                //attributeData = new byte[len];
                var len = attributeData.length;
                writer.writeByte(len);
                writer.write(attributeData.buffer, 0, len);
            }
            else if (Usage == TransactionAttributeUsage.Description || Usage >= TransactionAttributeUsage.Remark) {
                //var len = (int)readVarInt(ms, 65535);
                //attributeData = new byte[len];
                var len = attributeData.length;
                writer.writeVarInt(len);
                writer.write(attributeData.buffer, 0, len);
            }
            else
                throw new Error();
        }
        //#endregion
        //#region write Input
        var countInputs = this.inputs.length;
        writer.writeVarInt(countInputs);
        for (var i = 0; i < countInputs; i++) {
            writer.write(this.inputs[i].hash, 0, 32);
            writer.writeUint16(this.inputs[i].index);
        }
        //#endregion
        //#region write Outputs
        var countOutputs = this.outputs.length;
        writer.writeVarInt(countOutputs);
        for (var i = 0; i < countOutputs; i++) {
            var item = this.outputs[i];
            //资产种类
            writer.write(item.assetId.buffer, 0, 32);
            writer.writeUint64(item.value.getData());
            writer.write(item.toAddress.buffer, 0, 20);
        }
        //#endregion
    };
    Transaction.prototype.Serialize = function (writer) {
        this.SerializeUnsigned(writer);
        var witnesscount = this.witnesses.length;
        writer.writeVarInt(witnesscount);
        for (var i = 0; i < witnesscount; i++) {
            var _witness = this.witnesses[i];
            writer.writeVarBytes(_witness.InvocationScript.buffer);
            writer.writeVarBytes(_witness.VerificationScript.buffer);
        }
    };
    Transaction.prototype.Deserialize = function (ms) {
        //参考源码来自
        //      https://github.com/neo-project/neo
        //      Transaction.cs
        //      源码采用c#序列化技术
        //参考源码2
        //      https://github.com/AntSharesSDK/antshares-ts
        //      Transaction.ts
        //      采用typescript开发
        this.type = ms.readByte(); //读一个字节，交易类型
        this.version = ms.readByte();
        if (this.type == TransactionType.ContractTransaction) {
            //ContractTransaction 就是最常见的合约交易，
            //他没有自己的独特处理
            this.extdata = null;
        }
        else if (this.type == TransactionType.InvocationTransaction) {
            this.extdata = new InvokeTransData();
        }
        else {
            throw new Error("未编写针对这个交易类型的代码");
        }
        if (this.extdata != null) {
            this.extdata.Deserialize(this, ms);
        }
        //attributes
        var countAttributes = ms.readVarInt();
        this.attributes = new Attribute[countAttributes];
        // Console.WriteLine("countAttributes:" + countAttributes);
        for (var i = 0; i < countAttributes; i++) {
            //读取attributes
            var attributeData = null;
            var Usage = ms.readByte();
            if (Usage == TransactionAttributeUsage.ContractHash || Usage == TransactionAttributeUsage.Vote || (Usage >= TransactionAttributeUsage.Hash1 && Usage <= TransactionAttributeUsage.Hash15)) {
                var arr = ms.readBytes(32);
                attributeData = new Uint8Array(arr, 0, arr.byteLength);
            }
            else if (Usage == TransactionAttributeUsage.ECDH02 || Usage == TransactionAttributeUsage.ECDH03) {
                var arr = ms.readBytes(32);
                var data = new Uint8Array(arr, 0, arr.byteLength);
                attributeData = new Uint8Array(33);
                attributeData[0] = Usage;
                for (var i = 0; i < 32; i++) {
                    attributeData[i + 1] = data[i];
                }
            }
            else if (Usage == TransactionAttributeUsage.Script) {
                var arr = ms.readBytes(20);
                attributeData = new Uint8Array(arr, 0, arr.byteLength);
            }
            else if (Usage == TransactionAttributeUsage.DescriptionUrl) {
                var len = ms.readByte();
                var arr = ms.readBytes(len);
                attributeData = new Uint8Array(arr, 0, arr.byteLength);
            }
            else if (Usage == TransactionAttributeUsage.Description || Usage >= TransactionAttributeUsage.Remark) {
                var len = ms.readVarInt(65535);
                var arr = ms.readBytes(len);
                attributeData = new Uint8Array(arr, 0, arr.byteLength);
            }
            else
                throw new Error();
        }
        //inputs  输入表示基于哪些交易
        var countInputs = ms.readVarInt();
        //Console.WriteLine("countInputs:" + countInputs);
        this.inputs = new TransactionInput[countInputs];
        for (var i = 0; i < countInputs; i++) {
            this.inputs[i] = new TransactionInput();
            var arr = ms.readBytes(32);
            this.inputs[i].hash = new Uint8Array(arr, 0, arr.byteLength);
            this.inputs[i].index = ms.readUint16();
        }
        //outputes 输出表示最后有哪几个地址得到多少钱，肯定有一个是自己的地址,因为每笔交易都会把之前交易的余额清空,刨除自己,就是要转给谁多少钱
        //这个机制叫做UTXO
        var countOutputs = ms.readVarInt();
        //Console.WriteLine("countOutputs:" + countOutputs);
        this.outputs = new TransactionOutput[countOutputs];
        for (var i = 0; i < countOutputs; i++) {
            this.outputs[i] = new TransactionOutput();
            var outp = this.outputs[i];
            //资产种类
            var arr = ms.readBytes(32);
            var assetid = new Uint8Array(arr, 0, arr.byteLength);
            var value = new index_1.Fixed8(ms.readUint64());
            //资产数量
            var arr = ms.readBytes(20);
            var scripthash = new Uint8Array(arr, 0, arr.byteLength);
            outp.assetId = assetid;
            outp.value = value;
            outp.toAddress = scripthash;
            this.outputs[i] = outp;
        }
    };
    Transaction.prototype.GetMessage = function () {
        var ms = new index_1.IO.MemoryStream();
        var writer = new index_1.IO.BinaryWriter(ms);
        this.SerializeUnsigned(writer);
        var arr = ms.toArray();
        var msg = new Uint8Array(arr, 0, arr.byteLength);
        return msg;
    };
    Transaction.prototype.GetRawData = function () {
        var ms = new index_1.IO.MemoryStream();
        var writer = new index_1.IO.BinaryWriter(ms);
        this.Serialize(writer);
        var arr = ms.toArray();
        var msg = new Uint8Array(arr, 0, arr.byteLength);
        return msg;
    };
    //增加个人账户见证人（就是用这个人的私钥对交易签个名，signdata传进来）
    Transaction.prototype.AddWitness = function (signdata, pubkey, addrs) {
        {
            var msg = this.GetMessage();
            var bsign = index_1.Helper.VerifySignature(msg, signdata, pubkey);
            if (bsign == false)
                throw new Error("wrong sign");
            var addr = index_1.Helper.GetAddressFromPublicKey(pubkey);
            if (addr != addrs)
                throw new Error("wrong script");
        }
        var vscript = index_1.Helper.GetAddressCheckScriptFromPublicKey(pubkey);
        //iscript 对个人账户见证人他是一条pushbytes 指令
        var sb = new index_1.ScriptBuilder();
        sb.EmitPushBytes(signdata);
        var iscript = sb.ToArray();
        this.AddWitnessScript(vscript, iscript);
    };
    //增加智能合约见证人
    Transaction.prototype.AddWitnessScript = function (vscript, iscript) {
        var scripthash = index_1.Helper.GetScriptHashFromScript(vscript);
        if (this.witnesses == null)
            this.witnesses = [];
        var newwit = new Witness();
        newwit.VerificationScript = vscript;
        newwit.InvocationScript = iscript;
        for (var i = 0; i < this.witnesses.length; i++) {
            if (this.witnesses[i].Address == newwit.Address)
                throw new Error("alread have this witness");
        }
        this.witnesses.push(newwit);
    };
    //TXID
    Transaction.prototype.GetHash = function () {
        var msg = this.GetMessage();
        var data = index_1.Sha256.computeHash(msg);
        data = index_1.Sha256.computeHash(data);
        return new Uint8Array(data, 0, data.byteLength);
    };
    return Transaction;
}());
exports.Transaction = Transaction;
