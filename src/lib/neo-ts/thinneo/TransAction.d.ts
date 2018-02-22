import { Fixed8 } from '../neo/Fixed8';
import { BinaryWriter } from '../neo/IO/BinaryWriter';
import { BinaryReader } from '../neo/IO/BinaryReader';
export declare enum TransactionType {
    MinerTransaction = 0,
    IssueTransaction = 1,
    ClaimTransaction = 2,
    EnrollmentTransaction = 32,
    RegisterTransaction = 64,
    ContractTransaction = 128,
    PublishTransaction = 208,
    InvocationTransaction = 209,
}
export declare enum TransactionAttributeUsage {
    ContractHash = 0,
    ECDH02 = 2,
    ECDH03 = 3,
    Script = 32,
    Vote = 48,
    DescriptionUrl = 129,
    Description = 144,
    Hash1 = 161,
    Hash2 = 162,
    Hash3 = 163,
    Hash4 = 164,
    Hash5 = 165,
    Hash6 = 166,
    Hash7 = 167,
    Hash8 = 168,
    Hash9 = 169,
    Hash10 = 170,
    Hash11 = 171,
    Hash12 = 172,
    Hash13 = 173,
    Hash14 = 174,
    Hash15 = 175,
    Remark = 240,
    Remark1 = 241,
    Remark2 = 242,
    Remark3 = 243,
    Remark4 = 244,
    Remark5 = 245,
    Remark6 = 246,
    Remark7 = 247,
    Remark8 = 248,
    Remark9 = 249,
    Remark10 = 250,
    Remark11 = 251,
    Remark12 = 252,
    Remark13 = 253,
    Remark14 = 254,
    Remark15 = 255,
}
export declare class Attribute {
    usage: TransactionAttributeUsage;
    data: Uint8Array;
}
export declare class TransactionOutput {
    assetId: Uint8Array;
    value: Fixed8;
    toAddress: Uint8Array;
}
export declare class TransactionInput {
    hash: Uint8Array;
    index: number;
}
export declare class Witness {
    InvocationScript: Uint8Array;
    VerificationScript: Uint8Array;
    readonly Address: string;
}
export interface IExtData {
    Serialize(trans: Transaction, writer: BinaryWriter): void;
    Deserialize(trans: Transaction, reader: BinaryReader): void;
}
export declare class InvokeTransData implements IExtData {
    script: Uint8Array;
    gas: Fixed8;
    Serialize(trans: Transaction, writer: BinaryWriter): void;
    Deserialize(trans: Transaction, reader: BinaryReader): void;
}
export declare class Transaction {
    type: TransactionType;
    version: number;
    attributes: Attribute[];
    inputs: TransactionInput[];
    outputs: TransactionOutput[];
    witnesses: Witness[];
    SerializeUnsigned(writer: BinaryWriter): void;
    Serialize(writer: BinaryWriter): void;
    extdata: IExtData;
    Deserialize(ms: BinaryReader): void;
    GetMessage(): Uint8Array;
    GetRawData(): Uint8Array;
    AddWitness(signdata: Uint8Array, pubkey: Uint8Array, addrs: string): void;
    AddWitnessScript(vscript: Uint8Array, iscript: Uint8Array): void;
    GetHash(): Uint8Array;
}
