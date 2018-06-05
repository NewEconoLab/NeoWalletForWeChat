import { Account } from '../Helper/AccountHelper'
import { ScriptBuilder } from './ScriptBuilder'
import { Fixed8 } from '../neo/Fixed8'
import { BinaryWriter } from '../neo/IO/BinaryWriter'
import { BinaryReader } from '../neo/IO/BinaryReader'
import { Sha256 } from '../neo/Cryptography/Sha256'
import { MemoryStream } from '../neo/IO/MemoryStream'
export enum TransactionType {
    /// <summary>
    /// 用于分配字节费的特殊交易
    /// </summary>
    MinerTransaction = 0x00,
    /// <summary>
    /// 用于分发资产的特殊交易
    /// </summary>
    IssueTransaction = 0x01,
    /// <summary>
    /// 用于分配小蚁币的特殊交易
    /// </summary>
    ClaimTransaction = 0x02,
    /// <summary>
    /// 用于报名成为记账候选人的特殊交易
    /// </summary>
    EnrollmentTransaction = 0x20,
    /// <summary>
    /// 用于资产登记的特殊交易
    /// </summary>
    RegisterTransaction = 0x40,
    /// <summary>
    /// 合约交易，这是最常用的一种交易
    /// </summary>
    ContractTransaction = 0x80,
    /// <summary>
    /// Publish scripts to the blockchain for being invoked later.
    /// </summary>
    PublishTransaction = 0xd0,
    InvocationTransaction = 0xd1
}
export enum TransactionAttributeUsage {
    /// <summary>
    /// 外部合同的散列值
    /// </summary>
    ContractHash = 0x00,

    /// <summary>
    /// 用于ECDH密钥交换的公钥，该公钥的第一个字节为0x02
    /// </summary>
    ECDH02 = 0x02,
    /// <summary>
    /// 用于ECDH密钥交换的公钥，该公钥的第一个字节为0x03
    /// </summary>
    ECDH03 = 0x03,

    /// <summary>
    /// 用于对交易进行额外的验证
    /// </summary>
    Script = 0x20,

    Vote = 0x30,

    DescriptionUrl = 0x81,
    Description = 0x90,

    Hash1 = 0xa1,
    Hash2 = 0xa2,
    Hash3 = 0xa3,
    Hash4 = 0xa4,
    Hash5 = 0xa5,
    Hash6 = 0xa6,
    Hash7 = 0xa7,
    Hash8 = 0xa8,
    Hash9 = 0xa9,
    Hash10 = 0xaa,
    Hash11 = 0xab,
    Hash12 = 0xac,
    Hash13 = 0xad,
    Hash14 = 0xae,
    Hash15 = 0xaf,

    /// <summary>
    /// 备注
    /// </summary>
    Remark = 0xf0,
    Remark1 = 0xf1,
    Remark2 = 0xf2,
    Remark3 = 0xf3,
    Remark4 = 0xf4,
    Remark5 = 0xf5,
    Remark6 = 0xf6,
    Remark7 = 0xf7,
    Remark8 = 0xf8,
    Remark9 = 0xf9,
    Remark10 = 0xfa,
    Remark11 = 0xfb,
    Remark12 = 0xfc,
    Remark13 = 0xfd,
    Remark14 = 0xfe,
    Remark15 = 0xff
}
export class Attribute {
    public usage: TransactionAttributeUsage;
    public data: Uint8Array;
}
export class TransactionOutput {
    public assetId: Uint8Array;
    public value: Fixed8;
    public toAddress: Uint8Array;
}
export class TransactionInput {
    public hash: Uint8Array;
    public index: number;
}
export class Witness {
    public InvocationScript: Uint8Array;//设置参数脚本，通常是吧signdata push进去
    public VerificationScript: Uint8Array;//校验脚本，通常是 push 公钥, CheckSig 两条指令   验证的东西就是未签名的交易
    //这个就是地址的脚本
    public get Address(): string {
        var hash = Account.GetScriptHashFromScript(this.VerificationScript);
        return Account.GetAddressFromScriptHash(hash);
    }
}



export interface IExtData {
    Serialize(trans: Transaction, writer: BinaryWriter): void;
    Deserialize(trans: Transaction, reader: BinaryReader): void;
}

export class InvokeTransData implements IExtData {
    public script: Uint8Array;
    public gas: Fixed8;
    public Serialize(trans: Transaction, writer: BinaryWriter): void {
        writer.writeVarBytes(this.script.buffer);
        if (trans.version >= 1) {
            writer.writeUint64(this.gas.getData());
        }
    }
    public Deserialize(trans: Transaction, reader: BinaryReader): void {
        var buf = reader.readVarBytes(10000000);
        this.script = new Uint8Array(buf, 0, buf.byteLength);
        if (trans.version >= 1) {
            this.gas = new Fixed8(reader.readUint64());
        }
    }

}

export class ClaimTransData implements IExtData {
    public claims: TransactionInput[];
    public Serialize(trans: Transaction, writer: BinaryWriter): void {
        writer.writeVarInt(this.claims.length);
        for (var i = 0; i < this.claims.length; i++) {
            writer.write(this.claims[i].hash.buffer, 0, 32);
            writer.writeUint16(this.claims[i].index);
        }
    }
    public Deserialize(trans: Transaction, reader: BinaryReader): void {
        var countClaims = reader.readVarInt();
        this.claims = [];//new TransactionInput[countInputs];
        for (var i = 0; i < countClaims; i++) {
            this.claims.push(new TransactionInput());
            //this.inputs[i] = new TransactionInput();
            var arr = reader.readBytes(32);
            this.claims[i].hash = new Uint8Array(arr, 0, arr.byteLength);
            this.claims[i].index = reader.readUint16();
        }
    }
}
export class MinerTransData implements IExtData {
    public nonce: number;
    public Serialize(trans: Transaction, writer: BinaryWriter): void {
        writer.writeUint32(this.nonce);

    }
    public Deserialize(trans: Transaction, reader: BinaryReader): void {
        this.nonce = reader.readUint32();
    }
}


export class Transaction {
    public type: TransactionType;
    public version: number;
    public attributes: Attribute[];
    public inputs: TransactionInput[];
    public outputs: TransactionOutput[];
    public witnesses: Witness[];//见证人
    public SerializeUnsigned(writer: BinaryWriter): void {
        //write type
        writer.writeByte(this.type as number);
        //write version
        writer.writeByte(this.version);
        //SerializeExclusiveData(writer);
        if (this.type == TransactionType.ContractTransaction ||
            this.type == TransactionType.IssueTransaction)//每个交易类型有一些自己独特的处理

        {
            //ContractTransaction 就是最常见的转账交易
            //他没有自己的独特处理
        }
        else if (this.type == TransactionType.InvocationTransaction) {
            this.extdata.Serialize(this, writer);
        }
        else if (this.type == TransactionType.ClaimTransaction) {
            this.extdata.Serialize(this, writer);
        }
        else if (this.type == TransactionType.MinerTransaction) {
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
            writer.writeByte(Usage as number);
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
            writer.write(this.inputs[i].hash.buffer, 0, 32);
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
    }
    public Serialize(writer: BinaryWriter): void {
        this.SerializeUnsigned(writer);

        var witnesscount = this.witnesses.length;
        writer.writeVarInt(witnesscount);
        for (var i = 0; i < witnesscount; i++) {
            var _witness = this.witnesses[i];
            writer.writeVarBytes(_witness.InvocationScript.buffer);
            writer.writeVarBytes(_witness.VerificationScript.buffer);
        }
    }
    public extdata: IExtData;

    public Deserialize(ms: BinaryReader): void {
        //参考源码来自
        //      https://github.com/neo-project/neo
        //      Transaction.cs
        //      源码采用c#序列化技术

        //参考源码2
        //      https://github.com/AntSharesSDK/antshares-ts
        //      Transaction.ts
        //      采用typescript开发

        this.type = ms.readByte() as TransactionType;//读一个字节，交易类型
        this.version = ms.readByte();
        if (this.type == TransactionType.ContractTransaction
            || this.type == TransactionType.IssueTransaction)//每个交易类型有一些自己独特的处理
        {
            //ContractTransaction 就是最常见的合约交易，
            //他没有自己的独特处理
            this.extdata = null;
        }
        else if (this.type == TransactionType.InvocationTransaction) {
            this.extdata = new InvokeTransData();
        }
        else if (this.type == TransactionType.ClaimTransaction) {
            this.extdata = new ClaimTransData();
        }
        else if (this.type == TransactionType.MinerTransaction) {
            this.extdata = new MinerTransData();
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
            var attributeData: Uint8Array = null;
            var Usage = ms.readByte() as TransactionAttributeUsage;
            if (Usage == TransactionAttributeUsage.ContractHash || Usage == TransactionAttributeUsage.Vote || (Usage >= TransactionAttributeUsage.Hash1 && Usage <= TransactionAttributeUsage.Hash15)) {
                var arr = ms.readBytes(32);
                attributeData = new Uint8Array(arr, 0, arr.byteLength);
            }
            else if (Usage == TransactionAttributeUsage.ECDH02 || Usage == TransactionAttributeUsage.ECDH03) {
                var arr = ms.readBytes(32);
                var data = new Uint8Array(arr, 0, arr.byteLength);
                attributeData = new Uint8Array(33);
                attributeData[0] = Usage as number;
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
            var value = new Fixed8(ms.readUint64());
            //资产数量

            var arr = ms.readBytes(20);
            var scripthash = new Uint8Array(arr, 0, arr.byteLength);
            outp.assetId = assetid;
            outp.value = value;
            outp.toAddress = scripthash;

            this.outputs[i] = outp;

        }
    }


    public GetMessage(): Uint8Array {

        var ms = new MemoryStream();
        var writer = new BinaryWriter(ms);
        this.SerializeUnsigned(writer);
        var arr = ms.toArray();
        var msg = new Uint8Array(arr, 0, arr.byteLength);
        return msg;
    }
    public GetRawData(): Uint8Array {
        var ms = new MemoryStream();
        var writer = new BinaryWriter(ms);
        this.Serialize(writer);
        var arr = ms.toArray();
        var msg = new Uint8Array(arr, 0, arr.byteLength);
        return msg;
    }
    //增加个人账户见证人（就是用这个人的私钥对交易签个名，signdata传进来）
    public AddWitness(signdata: Uint8Array, pubkey: Uint8Array, addrs: string): void {
        {//额外的验证
            var msg = this.GetMessage();
            var bsign = Account.VerifySignature(msg, signdata, pubkey);
            if (bsign == false)
                throw new Error("wrong sign");
            var addr = Account.GetAddressFromPublicKey(pubkey);
            if (addr != addrs)
                throw new Error("wrong script");
        }
        var vscript = Account.GetAddressCheckScriptFromPublicKey(pubkey);
        //iscript 对个人账户见证人他是一条pushbytes 指令
        var sb = new ScriptBuilder();
        sb.EmitPushBytes(signdata);

        var iscript = sb.ToArray();

        this.AddWitnessScript(vscript, iscript);
    }

    //增加智能合约见证人
    public AddWitnessScript(vscript: Uint8Array, iscript: Uint8Array): void {
        var scripthash = Account.GetScriptHashFromScript(vscript);
        if (this.witnesses == null)
            this.witnesses = [];
        var newwit = new Witness();
        newwit.VerificationScript = vscript;
        newwit.InvocationScript = iscript;

        for (var i = 0; i < this.witnesses.length; i++) {
            if (this.witnesses[i].Address == newwit.Address)
                throw new Error("alread have this witness");
        }

        var _witnesses;
        console.log('...444444444444444444');

        if (this.witnesses)
            _witnesses = this.witnesses;
        else
            _witnesses = [];
        console.log('Transaction 461');

        _witnesses.push(newwit);
        _witnesses.sort((a, b) => {
            var hash_a = Account.GetScriptHashFromScript(a.VerificationScript);
            var hash_b = Account.GetScriptHashFromScript(b.VerificationScript);
            for (let i = (hash_a.length - 1); i >= 0; i--) {
                if (hash_a[i] > hash_b[i])
                    return 1;
                if (hash_a[i] < hash_b[i])
                    return -1;
            }
            return 0;
        });
        console.log('4444444444444444444444');

        this.witnesses = _witnesses;
    }

    //TXID
    public GetHash(): Uint8Array {
        var msg = this.GetMessage();
        var data = Sha256.computeHash(msg);
        data = Sha256.computeHash(data);
        return new Uint8Array(data, 0, data.byteLength);

    }
}
