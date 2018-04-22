import { Helper, Neo, ThinNeo } from '../lib/neo-ts/index'
import Tips from './tip'
import Wallet from './wallet'
import Https from './Https'
import { Asset, Pay } from './entity';

export default class Transfer {

    static formId = [];
    constructor() {
    }


    /**
     * 构造并发送交易
     * @param {ThinNeo.Transaction} tran 
     * @param {string} randomStr
     */
    static async setTran(tran: ThinNeo.Transaction, prikey: Uint8Array, pubkey, randomStr: string) {
        tran.witnesses = [];

        Tips.loading('获取交易哈希');
        let txid = Helper.toHexString(Helper.clone(tran.GetHash()).reverse())
        var msg = tran.GetMessage();

        Tips.loading('签名中');
        var signdata = Helper.Account.Sign(msg, prikey, randomStr);

        tran.AddWitness(signdata, pubkey, Wallet.account.address);

        Tips.loading('交易发送中');

        const res = await Https.rpc_postRawTransaction(tran.GetRawData());
        Tips.loaded();

        return res;
    }


    /**
     * 发送utxo交易
     * @param targetaddr 目的地址
     * @param asset 资产对象
     * @param sendcount 转账金额
     * @param height 区块高度 -- 用于管理已花费的utxo
     */
    static makeTran(targetaddr, asset: Asset, sendcount: Neo.Fixed8, height: number): ThinNeo.Transaction {
        //新建交易对象
        var tran = new ThinNeo.Transaction();
        //交易类型为合约交易
        tran.type = ThinNeo.TransactionType.ContractTransaction;
        tran.version = 0;//0 or 1
        tran.extdata = null;
        tran.attributes = [];
        tran.inputs = [];

        var pay: Pay = asset.pay(sendcount, height);

        //交易输入
        for (var i = 0; i < pay.utxos.length; i++) {
            let utxo = pay.utxos[i];
            //构造新的input
            var input = new ThinNeo.TransactionInput();
            input.hash = Helper.hexToBytes(utxo.txid).reverse();
            input.index = utxo.n;
            input["_addr"] = utxo.addr;
            tran.inputs.push(input);
        }

        if (pay.sum.compareTo(sendcount) >= 0)//输入大于等于输出
        {
            tran.outputs = [];
            //输出
            if (sendcount.compareTo(Neo.Fixed8.Zero) > 0) {
                var output = new ThinNeo.TransactionOutput();
                //资产类型
                output.assetId = Helper.hexToBytes(pay.assetid).reverse();
                //交易金额
                output.value = sendcount;
                //目的账户
                output.toAddress = Helper.Account.GetPublicKeyScriptHash_FromAddress(targetaddr);
                //添加转账交易
                tran.outputs.push(output);
            }

            //找零
            var change = pay.sum.subtract(sendcount); //计算找零的额度
            if (change.compareTo(Neo.Fixed8.Zero) > 0) {
                var outputchange = new ThinNeo.TransactionOutput();
                //找零地址设置为自己
                outputchange.toAddress = Helper.Account.GetPublicKeyScriptHash_FromAddress(pay.utxos[0].addr);
                //设置找零额度
                outputchange.value = change;
                //找零资产类型
                outputchange.assetId = Helper.hexToBytes(pay.assetid).reverse();
                //添加找零交易
                tran.outputs.push(outputchange);
            }
        }
        else {
            throw new Error("no enough money.");
        }
        return tran;
    }

    /**
     *  nep5交易
     * @param {string} address 
     * @param {string} tatgeraddr 
     * @param {string} asset 
     * @param {string} amount 
     */
    static async nep5Transaction(address, tatgeraddr, asset, amount) {
        let res = await Https.getNep5Asset(asset);

        var decimals = res["decimals"];// as number;
        var numarr = amount.split(".");
        decimals -= (numarr.length == 1 ? 0 : numarr[1].length);

        var v = 1;
        for (var i = 0; i < decimals; i++) {
            v *= 10;
        }

        var bnum = new Neo.BigInteger(amount.replace(".", ""));
        var intv = bnum.multiply(v).toString();

        var sb = new ThinNeo.ScriptBuilder();
        var scriptaddress = Helper.hexToBytes(asset).reverse();
        sb.EmitParamJson(["(address)" + address, "(address)" + tatgeraddr, "(integer)" + intv]);//第二个参数是个数组
        sb.EmitPushString("transfer");//第一个参数
        sb.EmitAppCall(scriptaddress);  //资产合约

        //交易脚本构造完成
        //接下来构造交易
        return sb.ToArray();
    }

    /**
     *  合约调用交易
     * @param {Uint8Array} script 
     */
    static async contractInvokeTrans(script: Uint8Array) {
        var addr = current.address;
        var tran = new ThinNeo.Transaction();
        //合约类型
        tran.inputs = [];
        tran.outputs = [];
        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        tran.extdata = new ThinNeo.InvokeTransData();

        //塞入脚本
        tran.extdata.script = script;
        tran.attributes = [];
        tran.attributes[0] = new ThinNeo.Attribute();
        tran.attributes[0].usage = ThinNeo.TransactionAttributeUsage.Script;
        tran.attributes[0].data = Helper.Account.GetPublicKeyScriptHash_FromAddress(addr);
        if (tran.witnesses == null)
            tran.witnesses = [];

        var msg = tran.GetMessage();
        var pubkey = current.pubkey;
        var prekey = current.prikey;
        var signdata = Helper.Account.Sign(msg, prekey);

        //添加见证人
        tran.AddWitness(signdata, pubkey, addr);
        var data = tran.GetRawData();//: Uint8Array

        var res = new Result();
        var result = await Https.rpc_postRawTransaction(data);
        res.err = !result;
        res.info = "成功";
        return res;
    }


}