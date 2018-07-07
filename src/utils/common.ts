import { Helper, Neo, ThinNeo } from "../lib/neo-ts/index";
import Wallet from "./wallet";
import { id_GAS } from "./const";

export default class Common {
    constructor() { }

    static buildScript(appCall: Neo.Uint160, method: string, param: string[]): Uint8Array {
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
        // var sub_bytes = new Uint8Array(sub);
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


    static buildInvokeTransData_attributes(script: Uint8Array, prikey: Uint8Array, random: string): Uint8Array {
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
        var signdata = Helper.Account.Sign(msg, prikey, random);
        tran.AddWitness(signdata, pubkey, addr);
        var data: Uint8Array = tran.GetRawData();
        return data
    }

    /**
     * invokeTrans 调用合约，允许转账
     * @param param[0]:script
     * @param param[1]:address
     * @param param[2]:assetid
     * @param param[3]:count
     */
    static async buildInvokeTransData(...param: any[]) {
        let script = param[0];
        let have: boolean = param.length > 1;
        //地址，资产id，交易数量。如果有指则用传值没有值则用默认值
        let addr = have ? param[1] : Wallet.account.address;
        let assetid = have ? param[2] : id_GAS;
        let count = have ? param[3] : Neo.Fixed8.Zero;
        //获得utxo,构造交易
        var utxos = await tools.coinTool.getassets();
        let tranmsg = tools.coinTool.makeTran(utxos, addr, assetid, count);
        let tran: ThinNeo.Transaction = tranmsg.info['tran'];
        //Parameter inversion 
        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        tran.extdata = new ThinNeo.InvokeTransData();
        //塞入脚本
        (tran.extdata as ThinNeo.InvokeTransData).script = script;
        (tran.extdata as ThinNeo.InvokeTransData).gas = Neo.Fixed8.fromNumber(1.0);

        var msg = tran.GetMessage();
        var signdata = ThinNeo.Helper.Sign(msg, current.prikey);
        tran.AddWitness(signdata, current.pubkey, current.address);
        var data = tran.GetRawData();
        return { data, tranmsg };
    }

    static async contractInvokeScript(appCall: Neo.Uint160, method: string, ...param: string[]) {
        let data = this.buildScript(appCall, method, param);
        return await tools.wwwtool.rpc_getInvokescript(data);
    }

    /**
     * invokeTrans 方式调用合约塞入attributes
     * @param script 合约的script
     */
    static async contractInvokeTrans_attributes(script: Uint8Array) {
        // let script = this.buildScript(appCall, method, param);
        let current: LoginInfo = LoginInfo.getCurrentLogin();
        var addr = current.address;
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
        tran.attributes[0].data = ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(addr);

        if (tran.witnesses == null)
            tran.witnesses = [];
        var msg = tran.GetMessage().clone();
        var pubkey = current.pubkey.clone();
        var prekey = current.prikey.clone();
        var signdata = ThinNeo.Helper.Sign(msg, prekey);
        tran.AddWitness(signdata, pubkey, addr);
        var data: Uint8Array = tran.GetRawData();

        var res: Result = new Result();
        var result = await tools.wwwtool.api_postRawTransaction(data);
        res.err = !result["sendrawtransactionresult"];
        res.info = result["txid"];
        return res;
    }

    /**
     * invokeTrans 调用合约，允许转账
     * @param param[0]:script
     * @param param[1]:address
     * @param param[2]:assetid
     * @param param[3]:count
     */
    static async contractInvokeTrans(...param: any[]) {
        let current = LoginInfo.getCurrentLogin();
        let script = param[0];
        let have: boolean = param.length > 1;
        //地址，资产id，交易数量。如果有指则用传值没有值则用默认值
        let addr = have ? param[1] : current.address;
        let assetid = have ? param[2] : tools.coinTool.id_GAS;
        let count = have ? param[3] : Neo.Fixed8.Zero;
        //获得utxo,构造交易
        var utxos = await tools.coinTool.getassets();
        let tranmsg = tools.coinTool.makeTran(utxos, addr, assetid, count);
        let tran: ThinNeo.Transaction = tranmsg.info['tran'];
        //Parameter inversion 
        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        tran.extdata = new ThinNeo.InvokeTransData();
        //塞入脚本
        (tran.extdata as ThinNeo.InvokeTransData).script = script;
        (tran.extdata as ThinNeo.InvokeTransData).gas = Neo.Fixed8.fromNumber(1.0);

        var msg = tran.GetMessage();
        var signdata = ThinNeo.Helper.Sign(msg, current.prikey);
        tran.AddWitness(signdata, current.pubkey, current.address);
        var data = tran.GetRawData();
        var height = await tools.wwwtool.api_getHeight();
        var result = await tools.wwwtool.api_postRawTransaction(data);

        if (result["sendrawtransactionresult"]) {
            let olds = tranmsg.info['oldarr'] as OldUTXO[];
            olds.map(old => old.height = height);
            OldUTXO.oldutxosPush(olds);
            return result["txid"];
        } else {
            throw "Transaction send failure";

        }
    }

}