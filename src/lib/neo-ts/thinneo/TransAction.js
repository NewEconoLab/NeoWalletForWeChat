import { Helper } from '../Helper/AccountHelper';
import { ScriptBuilder } from './ScriptBuilder';
import { Fixed8 } from '../neo/Fixed8';
import { BinaryWriter } from '../neo/IO/BinaryWriter';
import { Sha256 } from '../neo/Cryptography/Sha256';
import { MemoryStream } from '../neo/IO/MemoryStream';
export var TransactionType;
(function (TransactionType) {
    TransactionType[TransactionType["MinerTransaction"] = 0] = "MinerTransaction";
    TransactionType[TransactionType["IssueTransaction"] = 1] = "IssueTransaction";
    TransactionType[TransactionType["ClaimTransaction"] = 2] = "ClaimTransaction";
    TransactionType[TransactionType["EnrollmentTransaction"] = 32] = "EnrollmentTransaction";
    TransactionType[TransactionType["RegisterTransaction"] = 64] = "RegisterTransaction";
    TransactionType[TransactionType["ContractTransaction"] = 128] = "ContractTransaction";
    TransactionType[TransactionType["PublishTransaction"] = 208] = "PublishTransaction";
    TransactionType[TransactionType["InvocationTransaction"] = 209] = "InvocationTransaction";
})(TransactionType || (TransactionType = {}));
export var TransactionAttributeUsage;
(function (TransactionAttributeUsage) {
    TransactionAttributeUsage[TransactionAttributeUsage["ContractHash"] = 0] = "ContractHash";
    TransactionAttributeUsage[TransactionAttributeUsage["ECDH02"] = 2] = "ECDH02";
    TransactionAttributeUsage[TransactionAttributeUsage["ECDH03"] = 3] = "ECDH03";
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
})(TransactionAttributeUsage || (TransactionAttributeUsage = {}));
export class Attribute {
}
export class TransactionOutput {
}
export class TransactionInput {
}
export class Witness {
    get Address() {
        var hash = Helper.GetScriptHashFromScript(this.VerificationScript);
        return Helper.GetAddressFromScriptHash(hash);
    }
}
export class InvokeTransData {
    Serialize(trans, writer) {
        writer.writeVarBytes(this.script.buffer);
        if (trans.version >= 1) {
            writer.writeUint64(this.gas.getData());
        }
    }
    Deserialize(trans, reader) {
        var buf = reader.readVarBytes(10000000);
        this.script = new Uint8Array(buf, 0, buf.byteLength);
        if (trans.version >= 1) {
            this.gas = new Fixed8(reader.readUint64());
        }
    }
}
export class Transaction {
    SerializeUnsigned(writer) {
        writer.writeByte(this.type);
        writer.writeByte(this.version);
        if (this.type == TransactionType.ContractTransaction) {
        }
        else if (this.type == TransactionType.InvocationTransaction) {
            this.extdata.Serialize(this, writer);
        }
        else {
            throw new Error("未编写针对这个交易类型的代码");
        }
        var countAttributes = this.attributes.length;
        writer.writeVarInt(countAttributes);
        for (var i = 0; i < countAttributes; i++) {
            var attributeData = this.attributes[i].data;
            var Usage = this.attributes[i].usage;
            writer.writeByte(Usage);
            if (Usage == TransactionAttributeUsage.ContractHash || Usage == TransactionAttributeUsage.Vote || (Usage >= TransactionAttributeUsage.Hash1 && Usage <= TransactionAttributeUsage.Hash15)) {
                writer.write(attributeData.buffer, 0, 32);
            }
            else if (Usage == TransactionAttributeUsage.ECDH02 || Usage == TransactionAttributeUsage.ECDH03) {
                writer.write(attributeData.buffer, 1, 32);
            }
            else if (Usage == TransactionAttributeUsage.Script) {
                writer.write(attributeData.buffer, 0, 20);
            }
            else if (Usage == TransactionAttributeUsage.DescriptionUrl) {
                var len = attributeData.length;
                writer.writeByte(len);
                writer.write(attributeData.buffer, 0, len);
            }
            else if (Usage == TransactionAttributeUsage.Description || Usage >= TransactionAttributeUsage.Remark) {
                var len = attributeData.length;
                writer.writeVarInt(len);
                writer.write(attributeData.buffer, 0, len);
            }
            else
                throw new Error();
        }
        var countInputs = this.inputs.length;
        writer.writeVarInt(countInputs);
        for (var i = 0; i < countInputs; i++) {
            writer.write(this.inputs[i].hash.buffer, 0, 32);
            writer.writeUint16(this.inputs[i].index);
        }
        var countOutputs = this.outputs.length;
        writer.writeVarInt(countOutputs);
        for (var i = 0; i < countOutputs; i++) {
            var item = this.outputs[i];
            writer.write(item.assetId.buffer, 0, 32);
            writer.writeUint64(item.value.getData());
            writer.write(item.toAddress.buffer, 0, 20);
        }
    }
    Serialize(writer) {
        this.SerializeUnsigned(writer);
        var witnesscount = this.witnesses.length;
        writer.writeVarInt(witnesscount);
        for (var i = 0; i < witnesscount; i++) {
            var _witness = this.witnesses[i];
            writer.writeVarBytes(_witness.InvocationScript.buffer);
            writer.writeVarBytes(_witness.VerificationScript.buffer);
        }
    }
    Deserialize(ms) {
        this.type = ms.readByte();
        this.version = ms.readByte();
        if (this.type == TransactionType.ContractTransaction) {
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
        var countAttributes = ms.readVarInt();
        this.attributes = new Attribute[countAttributes];
        for (var i = 0; i < countAttributes; i++) {
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
        var countInputs = ms.readVarInt();
        this.inputs = new TransactionInput[countInputs];
        for (var i = 0; i < countInputs; i++) {
            this.inputs[i] = new TransactionInput();
            var arr = ms.readBytes(32);
            this.inputs[i].hash = new Uint8Array(arr, 0, arr.byteLength);
            this.inputs[i].index = ms.readUint16();
        }
        var countOutputs = ms.readVarInt();
        this.outputs = new TransactionOutput[countOutputs];
        for (var i = 0; i < countOutputs; i++) {
            this.outputs[i] = new TransactionOutput();
            var outp = this.outputs[i];
            var arr = ms.readBytes(32);
            var assetid = new Uint8Array(arr, 0, arr.byteLength);
            var value = new Fixed8(ms.readUint64());
            var arr = ms.readBytes(20);
            var scripthash = new Uint8Array(arr, 0, arr.byteLength);
            outp.assetId = assetid;
            outp.value = value;
            outp.toAddress = scripthash;
            this.outputs[i] = outp;
        }
    }
    GetMessage() {
        var ms = new MemoryStream();
        var writer = new BinaryWriter(ms);
        this.SerializeUnsigned(writer);
        var arr = ms.toArray();
        var msg = new Uint8Array(arr, 0, arr.byteLength);
        return msg;
    }
    GetRawData() {
        var ms = new MemoryStream();
        var writer = new BinaryWriter(ms);
        this.Serialize(writer);
        var arr = ms.toArray();
        var msg = new Uint8Array(arr, 0, arr.byteLength);
        return msg;
    }
    AddWitness(signdata, pubkey, addrs) {
        {
            var msg = this.GetMessage();
            var bsign = Helper.VerifySignature(msg, signdata, pubkey);
            if (bsign == false)
                throw new Error("wrong sign");
            var addr = Helper.GetAddressFromPublicKey(pubkey);
            if (addr != addrs)
                throw new Error("wrong script");
        }
        var vscript = Helper.GetAddressCheckScriptFromPublicKey(pubkey);
        var sb = new ScriptBuilder();
        sb.EmitPushBytes(signdata);
        var iscript = sb.ToArray();
        this.AddWitnessScript(vscript, iscript);
    }
    AddWitnessScript(vscript, iscript) {
        var scripthash = Helper.GetScriptHashFromScript(vscript);
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
    }
    GetHash() {
        var msg = this.GetMessage();
        var data = Sha256.computeHash(msg);
        data = Sha256.computeHash(data);
        return new Uint8Array(data, 0, data.byteLength);
    }
}
//# sourceMappingURL=TransAction.js.map