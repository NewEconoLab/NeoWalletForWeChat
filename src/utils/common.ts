import { Helper, Neo, ThinNeo } from "../lib/neo-ts/index";
import Wallet from "./wallet";
import { id_GAS } from "./const";
import { getSecureRandom } from './random'
import Transfer from "./transaction";
import { Asset } from "./entity";
import Https from "./Https";
export default class Common {
    constructor() { }

    static buildScript(appCall: Neo.Uint160, method: string, param: string[]): Uint8Array {
        console.log('buildScript')
        console.log(appCall.toString())
        console.log(method)
        console.log(param)
        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson(param);//第二个参数是个数组
        sb.EmitPushString(method);
        sb.EmitAppCall(appCall);
        return sb.ToArray();
    }

    /**
     * 域名转hash
     * @param domain 域名
     */
    static nameHash(domain: string): Neo.Uint256 {
        var domain_bytes = Helper.Account.String2Bytes(domain);
        var hashd = Neo.Cryptography.Sha256.computeHash(domain_bytes);
        return new Neo.Uint256(hashd);
    }

    /**
     * 子域名转hash
     * @param roothash  根域名hash
     * @param subdomain 子域名
     */
    static nameHashSub(roothash: Neo.Uint256, subdomain: string): Neo.Uint256 {
        var bs: Uint8Array = Helper.Account.String2Bytes(subdomain);
        if (bs.length == 0)
            return roothash;

        var domain = Neo.Cryptography.Sha256.computeHash(bs);
        var domain_bytes = new Uint8Array(domain);
        var domainUint8arry = Helper.concat(domain_bytes, new Uint8Array(roothash.bits.buffer));

        var sub = Neo.Cryptography.Sha256.computeHash(domainUint8arry);
        return new Neo.Uint256(sub);
    }

    /**
     * 返回一组域名的最终hash
     * @param domainarray 域名倒叙的数组
     */
    static nameHashArray(domainarray: string[]): Neo.Uint256 {
        domainarray.reverse();
        var hash: Neo.Uint256 = Common.nameHash(domainarray[0]);
        for (var i = 1; i < domainarray.length; i++) {
            hash = Common.nameHashSub(hash, domainarray[i]);
        }
        return hash;
    }


    static async buildInvokeTransData_attributes(script: Uint8Array): Promise<Uint8Array> {
        var addr = Wallet.account.address
        var tran: ThinNeo.Transaction = new ThinNeo.Transaction();
        //合约类型
        tran.inputs = [];
        tran.outputs = [];
        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        tran.extdata = new ThinNeo.InvokeTransData();
        //塞入脚本
        (tran.extdata as ThinNeo.InvokeTransData).script = script;
        tran.attributes = new Array<ThinNeo.Attribute>(1);
        tran.attributes[0] = new ThinNeo.Attribute();
        tran.attributes[0].usage = ThinNeo.TransactionAttributeUsage.Script;
        tran.attributes[0].data = Helper.Account.GetPublicKeyScriptHash_FromAddress(addr);

        if (tran.witnesses == null)
            tran.witnesses = [];
        var msg = tran.GetMessage();
        var pubkey = Helper.hexToBytes(Wallet.account.publickey);
        let randomStr = await getSecureRandom(256);
        const prikey = await Wallet.getPrikey();
        var signdata = Helper.Account.Sign(msg, Helper.hexToBytes(prikey), randomStr);
        tran.AddWitness(signdata, pubkey, addr);
        var data: Uint8Array = tran.GetRawData();
        return data
    }

    /**
     * 允许转账的合约调用
     * @param script 交易脚本
     * @param target 对方账户
     * @param asset 资产
     * @param amount 数量
     */
    static async buildInvokeTransData(script: Uint8Array, target: string, asset: Asset, amount: number) {
        //获得utxo,构造交易
        let tran = Transfer.makeTran(target, asset, amount);

        //Parameter inversion 
        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        tran.extdata = new ThinNeo.InvokeTransData();
        //塞入脚本
        (tran.extdata as ThinNeo.InvokeTransData).script = script;
        (tran.extdata as ThinNeo.InvokeTransData).gas = Neo.Fixed8.fromNumber(1.0);

        var msg = tran.GetMessage();
        let randomStr = await getSecureRandom(256);
        const prikey = await Wallet.getPrikey();
        var signdata = Helper.Account.Sign(msg, Helper.hexToBytes(prikey), randomStr);
        tran.AddWitness(signdata, Helper.hexToBytes(Wallet.account.publickey), Wallet.account.address);
        var data = tran.GetRawData();
        return { data, tran };
    }

    static async contractInvokeScript(appCall: Neo.Uint160, method: string, ...param: string[]) {
        let data = this.buildScript(appCall, method, param);
        return await Https.rpc_getInvokescript(data);
    }

    /**
     * invokeTrans 方式调用合约塞入attributes
     * @param script 合约的script
     */
    static async contractInvokeTrans_attributes(script: Uint8Array) {
        var tran: ThinNeo.Transaction = new ThinNeo.Transaction();
        //合约类型
        tran.inputs = [];
        tran.outputs = [];
        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        tran.extdata = new ThinNeo.InvokeTransData();
        //塞入脚本
        (tran.extdata as ThinNeo.InvokeTransData).script = script;
        tran.attributes = new Array<ThinNeo.Attribute>(1);
        tran.attributes[0] = new ThinNeo.Attribute();
        tran.attributes[0].usage = ThinNeo.TransactionAttributeUsage.Script;
        tran.attributes[0].data = Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address);

        if (tran.witnesses == null)
            tran.witnesses = [];
        var msg = tran.GetMessage();
        let randomStr = await getSecureRandom(256);
        const prikey = await Wallet.getPrikey();
        var signdata = Helper.Account.Sign(msg, Helper.hexToBytes(prikey), randomStr);
        tran.AddWitness(signdata, Helper.hexToBytes(Wallet.account.publickey), Wallet.account.address);
        var data: Uint8Array = tran.GetRawData();

        var result = await Https.rpc_postRawTransaction(data);

        return {
            err: !result["sendrawtransactionresult"],
            info: result["txid"]
        };
    }

    /**
     * invokeTrans 调用合约，允许转账
     * @param param[0]:script
     * @param param[1]:address
     * @param param[2]:assetid
     * @param param[3]:count
     */
    static async contractInvokeTrans(script: Uint8Array, target: string, asset: Asset, amount: number) {
        //获得utxo,构造交易
        let tran = Transfer.makeTran(target, asset, amount);
        //Parameter inversion 
        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        tran.extdata = new ThinNeo.InvokeTransData();
        //塞入脚本
        (tran.extdata as ThinNeo.InvokeTransData).script = script;
        (tran.extdata as ThinNeo.InvokeTransData).gas = Neo.Fixed8.fromNumber(1.0);

        var msg = tran.GetMessage();
        let randomStr = await getSecureRandom(256);
        const prikey = await Wallet.getPrikey();
        var signdata = Helper.Account.Sign(msg, Helper.hexToBytes(prikey), randomStr);
        tran.AddWitness(signdata, Helper.hexToBytes(Wallet.account.publickey), Wallet.account.address);
        var data: Uint8Array = tran.GetRawData();

        var result = await Https.rpc_postRawTransaction(data);

        if (result["sendrawtransactionresult"]) {
            return result["txid"];
        } else {
            throw "Transaction send failure";
        }
    }


    static isDomain(domain): boolean {
        //check domain valid
        var reg = /^([a-zA-Z0-9]{2,32})(.+\.)(test|TEST|[a-z][a-z])$/;
        if (!reg.test(domain) && !Common.isNeoDomain(domain)) {
            return false;
        }
        else {
            return true;
        }
    }

    static isAddress(addr): boolean {
        var reg = /^[a-zA-Z0-9]{34,34}$/
        if (!reg.test(addr)) {
            return false;
        }
        else {
            return true;
        }
    }

    static isNeoDomain(domain) {
        //check domain valid
        var reg = /^([a-zA-Z0-9]{2,32})(.+\.)(neo|Neo)$/;
        if (!reg.test(domain)) {
            return false;
        }
        else {
            return true;
        }
    }

}