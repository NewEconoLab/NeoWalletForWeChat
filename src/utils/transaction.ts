import { Helper, Neo, ThinNeo } from '../lib/neo-ts/index'
import Tips from './tip'
import Wallet from './wallet'
import Https from './Https'
import { Asset, Pay, Claim, History } from './entity';
import Coin from './coin';
import { getSecureRandom } from './random'
import { formatTime } from './time';
export default class Transfer {

    static formId = [];
    static TXs = [];
    static coin: Asset;
    constructor() { };



    /**
     * 构造并发送交易
     * @param {ThinNeo.Transaction} tran 
     * @param {string} randomStr
     */
    static async signAndSend(tran: ThinNeo.Transaction) {

        const prikey = Helper.hexToBytes(Wallet.account.nep2key);
        const pubkey = Helper.hexToBytes(Wallet.account.publickey);

        tran.witnesses = [];

        Tips.loading('获取交易哈希');
        let txid = Helper.toHexString(Helper.clone(tran.GetHash()).reverse())
        var msg = tran.GetMessage();
        let randomStr = await getSecureRandom(256);
        Tips.loading('签名中');
        var signdata = Helper.Account.Sign(msg, prikey, randomStr);

        tran.AddWitness(signdata, pubkey, Wallet.account.address);

        Tips.loading('交易发送中');
        console.log(Helper.toHexString(tran.GetRawData()));

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

        return await Transfer.signAndSend(tran);
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

        return await Transfer.signAndSend(tran);
    }

    /**
     * invokeTrans 方式调用合约塞入attributes
     * @param script 合约的script
     */
    static async contractInvokeTrans(script: Uint8Array, asset: Asset, height: number) {
        var addr = Wallet.account.address;
        //let _count = Neo.Fixed8.Zero;   //十个gas内都不要钱滴
        let tran = Transfer.makeTran(null, asset/*Context.Assets['GAS']*/, Neo.Fixed8.Zero, height);

        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        tran.extdata = new ThinNeo.InvokeTransData();
        //塞入脚本
        (tran.extdata as ThinNeo.InvokeTransData).script = script;
        // (tran.extdata as ThinNeo.InvokeTransData).gas = Neo.Fixed8.fromNumber(1.0);

        return await Transfer.signAndSend(tran);
    }

    /**
     * 交易历史
     */
    static async history() {

        var currentAddress = Wallet.account.address;
        var res = await Https.gettransbyaddress(currentAddress, 20, 1);
        if (res.length > 0) {
            this.TXs = [];
            for (let index = 0; index < res.length; index++) {
                const tx = res[index];
                let txid = tx["txid"] as string;
                txid = txid.replace('0x', '');
                let vins = tx["vin"];
                let type = tx["type"];
                let vouts = tx["vout"];
                let value = tx["value"];
                let txtype = tx["txType"];
                if (txtype.search("Transaction") != -1) {
                    txtype = txtype.replace('Transaction', '');
                }
                if (txtype === 'nep5')
                    txtype = 'Invocation'
                let assetType = tx["assetType"]
                let blockindex = tx["blockindex"];
                let time: string = tx["blocktime"].includes("$date") ? JSON.parse(tx["blocktime"])["$date"] : tx["blocktime"] + "000";
                let date: string = formatTime(parseInt(time), 'Y/M/D h:m:s');

                if (type == "out") {
                    if (vins && vins.length == 1) {
                        let assetname = "";
                        const vin = vins[0];
                        let asset = vin["asset"];
                        let amount = value[asset];
                        let address = vin["address"];
                        if (assetType == "utxo") {
                            assetname = Coin.assetID2name[asset];
                        }
                        else {
                            let nep5 = await Https.getNep5Asset(asset);
                            console.log(nep5);

                            assetname = 'jjj'//nep5["name"];
                        }
                        var history = new History();
                        history.time = date;
                        history.txid = txid;
                        history.assetname = assetname;
                        history.address = address;
                        history.value = parseFloat(amount).toString();
                        history.txtype = txtype;
                        history.type = type;
                        history.vin = vins;
                        history.vout = vouts;
                        history.block = blockindex;
                        Transfer.TXs.push(history);
                    }
                }
                else {
                    var arr = {}
                    let currcount = 0;
                    for (const index in vouts) {
                        let i = parseInt(index);
                        const out = vouts[i];
                        let address = out["address"];
                        let amount = out["value"];
                        let asset = out["asset"];
                        let assetname = "";

                        if (address != currentAddress) {
                            if (assetType == "utxo")
                                assetname = Coin.assetID2name[asset];
                            else {
                                let nep5 = await Https.getNep5Asset(asset);
                                assetname = 'kkk'//nep5["name"];
                            }
                            let n = out["n"];
                            if (arr[address] && arr[address][assetname]) {
                                arr[address][assetname] += amount;
                            } else {
                                var assets = {}
                                assets[assetname] = amount;
                                arr[address] = assets;
                            }
                        } else { currcount++ }
                    }
                    if (currcount == vouts.length) {
                        for (const asset in value) {
                            if (value.hasOwnProperty(asset)) {
                                const amount = value[asset];

                                let assetname = "";
                                if (assetType == "utxo")
                                    assetname = Coin.assetID2name[asset];
                                else {
                                    let nep5 = await Https.getNep5Asset(asset);
                                    assetname = nep5["name"];
                                }

                                var assets = {}
                                assets[assetname] = amount;
                                arr[currentAddress] = assets;
                            }
                        }
                    }
                    for (const address in arr) {
                        if (arr.hasOwnProperty(address)) {
                            const data = arr[address];
                            for (const asset in data) {
                                if (data.hasOwnProperty(asset)) {
                                    const amount = data[asset];
                                    var history = new History();
                                    history.time = date;
                                    history.txid = txid;
                                    history.assetname = asset;
                                    history.address = address;
                                    history.value = parseFloat(amount).toString();
                                    history.txtype = txtype;
                                    history.type = type;
                                    history.vin = vins;
                                    history.vout = vouts;
                                    history.block = blockindex;
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