import { Helper, Neo, ThinNeo } from '../lib/neo-ts/index'
import Tips from './tip'
import Wallet from './wallet'
import Https from './Https'
import { Asset, Pay, Claim, History } from './entity';
import Coin from './coin';
import { getSecureRandom } from './random'
import { formatTime } from './time';
import { Context } from './context';
export default class Transfer {

    static formId = [];
    static TXs = [];
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
        console.log(Helper.toHexString(tran.GetRawData()));

        const res = await Https.rpc_postRawTransaction(tran.GetRawData());
        Tips.loaded();

        return res;
    }
    // 116f776e65725f5365745265736f6c76657267954f285a93eed7b4aed9396a7806a5812f1a5950
    // 116f776e65725f5365745265736f6c76657267dffbdd534a41dd4c56ba5ccba9dfaaf4f84e1362
    // 146bcc17c5628de5fc05a80cd87add35f0f3f1b0ab2002a985c667aef4b24b7b3bf24327e77b980db413802b74676c7e1b353accd27c14598498dec91ccc87c971793f8c34f50d1874c09a53c1116f776e65725f5365745265736f6c7665726750591a2f81a506786a39d9aeb4d7ee935a284f95
    // 146bcc17c5628de5fc05a80cd87add35f0f3f1b0ab2002a985c667aef4b24b7b3bf24327e77b980db413802b74676c7e1b353accd27c14598498dec91ccc87c971793f8c34f50d1874c09a53c1116f776e65725f5365745265736f6c7665726750591a2f81a506786a39d9aeb4d7ee935a284f95
    // d10027116f776e65725f5365745265736f6c7665726762134ef8f4aadfa9cb5cba564cdd414a53ddfbdf0120598498dec91ccc87c971793f8c34f50d1874c09a00000141409c7d82ce2c3d76a3465d6d0b4d93f449fe3d6791431abafe09bd1c3f6ff7ad0839cf8d1298f37bb8b1f596f51e263056d89f141724f3d4e3e5952b125418c66e232102feb7a6a75a4cec043790479c17f934e7cbe379fd33e0c50043197733879dbb1fac
    // d10027116f776e65725f5365745265736f6c7665726762134ef8f4aadfa9cb5cba564cdd414a53ddfbdf0120598498dec91ccc87c971793f8c34f50d1874c09a0000014140eee9cd276c54ae99b9ef92a2e5839720bc86d391b0e7fcda356ed945e8809ee66f83a0288d0ffac46f2f0fae9d85ed619f7b7f160ee2429950834e109960740b232102feb7a6a75a4cec043790479c17f934e7cbe379fd33e0c50043197733879dbb1fac
    // d10074146bcc17c5628de5fc05a80cd87add35f0f3f1b0ab2002a985c667aef4b24b7b3bf24327e77b980db413802b74676c7e1b353accd27c14598498dec91ccc87c971793f8c34f50d1874c09a53c1116f776e65725f5365745265736f6c7665726750591a2f81a506786a39d9aeb4d7ee935a284f950001465de3f2c2f30a9b948909c8da665468443ffc9ab43716ab5e2c575be5c5347a000001e72d286979ee6cb1b7e65dfddfb2e384100b8d148e7758de42e4168b71792c60803f2b38e1000000598498dec91ccc87c971793f8c34f50d1874c09a014140dbe95107747ce9b573cf2ec32514ef7ce54b36e23b0abe146c52ff09e8a3d49d0a5c401bdf7109a091dba47bfc2509e23e459e588ca6cb315fee2ee7c05fb0e3232102feb7a6a75a4cec043790479c17f934e7cbe379fd33e0c50043197733879dbb1fac
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
        // tran.extdata = null;
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

        if (pay.sum.compareTo(sendcount) >= 0 && targetaddr != null)//输入大于等于输出
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
     * 领取GAS
     * @param claims cliams 的UTXO
     * @param sum 领取总量
     */
    static async claimGas(claims: Claim[], sum: string) {
        var tran = new ThinNeo.Transaction();
        //交易类型为合约交易
        tran.type = ThinNeo.TransactionType.ClaimTransaction;
        tran.version = 0;//0 or 1
        tran.extdata = new ThinNeo.ClaimTransData(); //JSON.parse(JSON.stringify(claims));
        (tran.extdata as ThinNeo.ClaimTransData).claims = []
        tran.attributes = [];
        tran.inputs = [];
        for (let i in claims) {
            let claim = (claims[i] as Claim);
            var input = new ThinNeo.TransactionInput();
            input.hash = Helper.hexToBytes(claim.txid).reverse();
            input.index = claim.n;
            input["_addr"] = claim.addr;
            (tran.extdata as ThinNeo.ClaimTransData).claims.push(input);
        }
        var output = new ThinNeo.TransactionOutput();
        output.assetId = Helper.hexToBytes(Coin.id_GAS).reverse();
        output.toAddress = Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address);
        output.value = Neo.Fixed8.parse(sum);
        tran.outputs = [];
        tran.outputs.push(output);
        let randomStr = await getSecureRandom(256);

        const prikey = Helper.hexToBytes(Wallet.account.nep2key);
        const pubkey = Helper.hexToBytes(Wallet.account.publickey);
        return await Transfer.setTran(tran, prikey, pubkey, randomStr);
    }


    /**
     * nep5转账
     * @param address 自己的地址
     * @param tatgeraddr 转账的地址
     * @param asset nep5资产id
     * @param amount 转账数额
     */
    static async nep5Transaction(tatgeraddr, asset: string, amount: string) {
        let res = await Https.getNep5Asset(asset);
        var decimals = res["decimals"] as number;
        var numarr = amount.split(".");
        decimals -= (numarr.length == 1 ? 0 : numarr[1].length);

        const address = Wallet.account.address;
        var v = 1;
        for (var i = 0; i < decimals; i++)
            v *= 10;
        var bnum = new Neo.BigInteger(amount.replace(".", ""));
        var intv = bnum.multiply(v).toString();

        var sb = new ThinNeo.ScriptBuilder();
        var scriptaddress = Helper.hexToBytes(asset).reverse();
        sb.EmitParamJson(["(address)" + address, "(address)" + tatgeraddr, "(integer)" + intv]);//第二个参数是个数组
        sb.EmitPushString("transfer");//第一个参数
        sb.EmitAppCall(scriptaddress);  //资产合约
        var result = await Transfer.contractInvoke_attributes(sb.ToArray())
        return result;
    }


    /**
     * invokeTrans 方式调用合约塞入attributes
     * @param script 合约的script
     */
    static async contractInvoke_attributes(script: Uint8Array) {
        var addr = Wallet.account.address;
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

        let randomStr = await getSecureRandom(256);

        const prikey = Helper.hexToBytes(Wallet.account.nep2key);
        const pubkey = Helper.hexToBytes(Wallet.account.publickey);
        return await Transfer.setTran(tran, prikey, pubkey, randomStr);
    }

    /**
     * invokeTrans 方式调用合约塞入attributes
     * @param script 合约的script
     */
    static async contractInvokeTrans(script: Uint8Array)
    {
        var addr = Wallet.account.address;
        //let _count = Neo.Fixed8.Zero;   //十个gas内都不要钱滴
        let tran = Transfer.makeTran(null, Context.Assets['GAS'], Neo.Fixed8.Zero,Context.Height);

        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        tran.extdata = new ThinNeo.InvokeTransData();
        //塞入脚本
        (tran.extdata as ThinNeo.InvokeTransData).script = script;
        // (tran.extdata as ThinNeo.InvokeTransData).gas = Neo.Fixed8.fromNumber(1.0);

        let randomStr = await getSecureRandom(256);

        const prikey = Helper.hexToBytes(Wallet.account.nep2key);
        const pubkey = Helper.hexToBytes(Wallet.account.publickey);
        return await Transfer.setTran(tran, prikey, pubkey, randomStr);
    }

    static async history() {
        console.log(Wallet.account.address);

        var res = await Https.gettransbyaddress(Wallet.account.address, 20, 1);
        console.log('交易');

        console.log(res);

        res = res ? res : []; //将空值转为长度0的数组
        if (res.length > 0) {
            Transfer.TXs = [];
            for (let index = 0; index < res.length; index++) {
                const tx = res[index];
                let txid = tx["txid"];
                let vins = tx["vin"];
                let vouts = tx["vout"];
                let value = tx["value"];
                let txtype = tx["type"];
                let assetType = tx["assetType"]
                let blockindex = tx["blockindex"];
                let time = JSON.parse(tx["blocktime"])["$date"];
                time = formatTime(
                    time,
                    'yyyy-MM-dd hh:mm:ss'
                );
                if (txtype == "out") {
                    if (vins && vins.length == 1) {
                        const vin = vins[0];
                        let address = vin["address"];
                        let amount = vin["value"];
                        let asset = vin["asset"];
                        let assetname = "";
                        if (assetType == "utxo")
                            assetname = Coin.assetID2name[asset];
                        else {
                            let nep5 = await Https.getNep5Asset(asset);
                            assetname = nep5["name"];
                        }
                        var history = new History();
                        history.time = time;
                        history.txid = txid;
                        history.assetname = assetname;
                        history.address = address;
                        history.value = value[asset];
                        history.txtype = txtype;
                        Transfer.TXs.push(history);
                    }
                }
                else {
                    var arr = {}
                    for (const index in vouts) {
                        let i = parseInt(index);
                        const out = vouts[i];
                        let address = out["address"];
                        let amount = out["value"];
                        let asset = out["asset"];
                        if (assetType === "utxo")
                            asset = Coin.assetID2name[asset];
                        else {
                            let nep5 = await Https.getNep5Asset(asset);
                            asset = nep5["name"];
                        }
                        let n = out["n"];
                        if (address !== Wallet.account.address) {
                            if (arr[address] && arr[address][asset]) {
                                arr[address][asset] += amount;
                            } else {
                                var assets = {}
                                assets[asset] = amount;
                                arr[address] = assets;
                            }
                        }
                    }
                    for (const address in arr) {
                        if (arr.hasOwnProperty(address)) {
                            const value = arr[address];
                            for (const asset in value) {
                                if (value.hasOwnProperty(asset)) {
                                    const amount = value[asset];
                                    var history = new History();
                                    history.time = time;
                                    history.txid = txid;
                                    history.assetname = asset;
                                    history.address = address;
                                    history.value = amount;
                                    history.txtype = txtype;
                                    Transfer.TXs.push(history);
                                }
                            }
                        }
                    }
                }
            }
        }

    }
}