import * as NEL from '../lib/neo-ts/index'
import { WWW } from './API';
export class CoinTool {
    static id_GAS = "0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
    // asset neo id
    static id_NEO = "0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
    static assetID2name = {};
    static name2assetID = {};
    static async initAllAsset() {
        var allassets = await WWW.api_getAllAssets();
        for (var a in allassets) {
            var asset = allassets[a];
            var names = asset.name;
            var id = asset.id;
            var name = "";
            
            if (id === CoinTool.id_GAS) {
                name = "GAS";
            }
            else if (id === CoinTool.id_NEO) {
                name = "NEO";
            }
            else {
                for (var i in names) {
                    name = names[i].name;
                    if (names[i].lang == "en")
                        break;
                }
            }
            CoinTool.assetID2name[id] = name;
            CoinTool.name2assetID[name] = id;
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
        var tran = new NEL.thinneo.TransAction.Transaction();
        //交易类型为合约交易
        tran.type = NEL.thinneo.TransAction.TransactionType.ContractTransaction;
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
        var count = NEL.neo.Fixed8.Zero;
        //交易输入
        for (var i = 0; i < us.length; i++) {
            //构造新的input
            var input = new NEL.thinneo.TransAction.TransactionInput();
            input.hash = NEL.helper.UintHelper.hexToBytes(us[i].txid).reverse();
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
            if (sendcount.compareTo(NEL.neo.Fixed8.Zero) > 0) {
                var output = new NEL.thinneo.TransAction.TransactionOutput();
                //资产类型
                output.assetId = NEL.helper.UintHelper.hexToBytes(assetid).reverse();
                //交易金额
                output.value = sendcount;
                //目的账户
                output.toAddress = NEL.helper.Helper.GetPublicKeyScriptHash_FromAddress(targetaddr);
                //添加转账交易
                tran.outputs.push(output);
            }

            //找零
            var change = count.subtract(sendcount); //计算找零的额度
            if (change.compareTo(NEL.neo.Fixed8.Zero) > 0) {
                var outputchange = new NEL.thinneo.TransAction.TransactionOutput();
                //找零地址设置为自己
                outputchange.toAddress = NEL.helper.Helper.GetPublicKeyScriptHash_FromAddress(scraddr);
                //设置找零额度
                outputchange.value = change;
                //找零资产类型
                outputchange.assetId = NEL.helper.UintHelper.hexToBytes(assetid).reverse();
                //添加找零交易
                tran.outputs.push(outputchange);
            }
        }
        else {
            throw new Error("no enough money.");
        }
        return tran;
    }

}