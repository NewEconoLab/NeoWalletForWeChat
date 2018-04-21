import {ThinNeo,Neo,Helper} from '../lib/neo-ts/index'
import { Https } from './Https';
export class Coin {
    static id_GAS = "0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
    static id_NEO = "0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";

    static assetID2name = {};
    static name2assetID = {};
    static async initAllAsset() {
        var allassets = await Https.api_getAllAssets();
        for (var a in allassets) {
            var asset = allassets[a];
            var names = asset.name;
            var id = asset.id;
            var name = "";
            
            if (id === Coin.id_GAS) {
                name = 'GAS';
            }
            else if (id === Coin.id_NEO) {
                name = 'NEO';
            }
            else {
                for (var i in names) {
                    name = names[i].name;
                    if (names[i].lang === "en")
                        break;
                }
            }
            Coin.assetID2name[id] = name;
            Coin.name2assetID[name] = id;
        }
    }

    /** 
     *  Create new transation
     * @param utxos  { [id: string]: UTXO[] }
     * @param targetaddr  string
     * @param assetid string
     * @param sendcount Neo.Fixed8
     * @return ThinNeo.Transaction
     */
    static makeTran(utxos, targetaddr, assetid, sendcount) {
        //新建交易对象
        var tran = new ThinNeo.Transaction();
        //交易类型为合约交易
        tran.type = ThinNeo.TransactionType.ContractTransaction;
        tran.version = 0;//0 or 1
        tran.extdata = null;
        tran.attributes = [];
        tran.inputs = [];

        var scraddr = "";
        let asset = utxos[assetid];
        //对output排序
        asset.sort((a, b) => {
            return a.count.compareTo(b.count);
        });
        var us = utxos[assetid];
        var count = Neo.Fixed8.Zero;
        //交易输入
        for (var i = 0; i < us.length; i++) {
            //构造新的input
            var input = new ThinNeo.TransactionInput();
            input.hash = Helper.hexToBytes(us[i].txid).reverse();
            input.index = us[i].n;
            input["_addr"] = us[i].addr;
            tran.inputs.push(input);
            count = count.add(us[i].count);
            scraddr = us[i].addr;
            if (count.compareTo(sendcount) > 0) {
                break;
            }
        }
        if (count.compareTo(sendcount) >= 0)//输入大于等于输出
        {
            tran.outputs = [];
            //输出
            if (sendcount.compareTo(Neo.Fixed8.Zero) > 0) {
                var output = new ThinNeo.TransactionOutput();
                //资产类型
                output.assetId = Helper.hexToBytes(assetid).reverse();
                //交易金额
                output.value = sendcount;
                //目的账户
                output.toAddress = Helper.Account.GetPublicKeyScriptHash_FromAddress(targetaddr);
                //添加转账交易
                tran.outputs.push(output);
            }

            //找零
            var change = count.subtract(sendcount); //计算找零的额度
            if (change.compareTo(Neo.Fixed8.Zero) > 0) {
                var outputchange = new ThinNeo.TransactionOutput();
                //找零地址设置为自己
                outputchange.toAddress = Helper.Account.GetPublicKeyScriptHash_FromAddress(scraddr);
                //设置找零额度
                outputchange.value = change;
                //找零资产类型
                outputchange.assetId = Helper.hexToBytes(assetid).reverse();
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
    static async nep5Transaction(address, tatgeraddr, asset, amount)
    {
        let res = await Https.getNep5Asset(asset);

        var decimals = res[ "decimals" ];// as number;
        var numarr = amount.split(".");
        decimals -= (numarr.length == 1 ? 0 : numarr[ 1 ].length);

        var v = 1;
        for (var i = 0; i < decimals; i++)
        {
            v *= 10;
        }

        var bnum = new Neo.BigInteger(amount.replace(".", ""));
        var intv = bnum.multiply(v).toString();

        var sb = new ThinNeo.ScriptBuilder();
        var scriptaddress = Helper.hexToBytes(asset).reverse();
        sb.EmitParamJson([ "(address)" + address, "(address)" + tatgeraddr, "(integer)" + intv ]);//第二个参数是个数组
        sb.EmitPushString("transfer");//第一个参数
        sb.EmitAppCall(scriptaddress);  //资产合约
        
        //交易脚本构造完成
        //接下来构造交易
        return sb.ToArray();
    }

}