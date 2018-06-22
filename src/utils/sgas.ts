import { Nep6, Neo, ThinNeo, Helper } from '../lib/neo-ts/index'
import * as Const from './const'
import Transfer from './transaction';
import { Asset, Utxo, Result, ResultItem } from './entity';
import Wallet from './wallet';
import Common from './common';
import Https from './Https';
import { getSecureRandom } from './random'
export default class SGAS {

    constructor() { }

    /**
     * gas兑换sgas
     * @param asset gas
     * @param amount 兑换额度
     */
    public static async mintTokens(asset: Asset, amount: number) {
        let script = Common.buildScript(Const.DAPP_SGAS, 'mintTokens', ['(str)mintTokens']);
        let sgasAddr = Helper.Account.GetAddressFromScriptHash(Const.DAPP_SGAS);
        return await Transfer.contractInvokeTrans(sgasAddr, script, asset, amount);
    }




    /**
     * sgas -> gas
     * @param transcount 兑换数量
     */
    static async makeRefundTransaction(prikey: string, transcount: number) {

        let utxos = await SGAS.getsgasAssets();
        let gas = new Asset('GAS', Const.id_GAS)
        //接口等待提供
        //检查sgas地址拥有的gas的utxo是否有被标记过
        for (var i = utxos.length - 1; i >= 0; i--) {

            let script = Common.buildScript(Const.DAPP_SGAS, "getRefundTarget", ["(hex256)" + utxos[i].txid.toString()]);
            var r = await Https.rpc_getInvokescript(script);
            if (r) {
                var stack = r['stack'];
                var value = stack[0]["value"].toString();
                if (value.length > 0) {
                    gas.addUTXO(utxos[i]);
                }
            }
        }

        //sgas 自己给自己转账   用来生成一个utxo  合约会把这个utxo标记给发起的地址使用
        let nepAddress = Helper.Account.GetAddressFromScriptHash(Const.DAPP_SGAS);
        let tran: ThinNeo.Transaction = Transfer.makeTran(nepAddress, gas, transcount);

        var r = await Https.api_getcontractstate(Const.DAPP_SGAS.toString())
        if (r && r['script']) {
            var sgasScript = r['script'].hexToBytes();
            var scriptHash = Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address)

            tran.type = ThinNeo.TransactionType.InvocationTransaction;
            tran.extdata = new ThinNeo.InvokeTransData();
            (tran.extdata as ThinNeo.InvokeTransData).script = Common.buildScript(Const.DAPP_SGAS, "refund", ["(bytes)" + Helper.toHexString(scriptHash)]);

            //附加鉴证
            tran.attributes = new Array<ThinNeo.Attribute>(1);
            tran.attributes[0] = new ThinNeo.Attribute();
            tran.attributes[0].usage = ThinNeo.TransactionAttributeUsage.Script;
            tran.attributes[0].data = scriptHash; // ThinNeo.Helper.GetPublicKeyScriptHash_FromAddress(addr);

            let sb = new ThinNeo.ScriptBuilder();
            sb.EmitPushString("whatever")
            sb.EmitPushNumber(new Neo.BigInteger(250));
            tran.AddWitnessScript(sgasScript, sb.ToArray());

            //做提款人的签名
            let randomStr = await getSecureRandom(256);
            var signdata = Helper.Account.Sign(tran.GetMessage(), Helper.hexToBytes(prikey), randomStr);
            tran.AddWitness(signdata, Helper.hexToBytes(Wallet.account.publickey), Wallet.account.address);
            var trandata = tran.GetRawData();

            // 发送交易请求
            r = await Https.rpc_postRawTransaction(trandata);

            if (!!r && r["txid"]) {
                return r["txid"];
            }
            else {
                throw "Transaction send failed";
            }
        }
        else {
            throw "Contract acquisition failure";
        }
    }

    /**
     * 
     * @param utxo 兑换gas的utxo
     * @param transcount 兑换的数量
     */
    static async makeRefundTransaction_tranGas(utxo, transcount) {
        // 生成转换请求

        let gas = new Asset('GAS', Const.id_GAS)
        for (let index in utxo)
            gas.addUTXO(utxo[index]);
        var tran: ThinNeo.Transaction = Transfer.makeTran(Wallet.account.address, gas, transcount);

        tran.type = ThinNeo.TransactionType.ContractTransaction;
        tran.version = 0;

        //sign and broadcast
        //做智能合约的签名
        var r = await Https.api_getcontractstate(Const.id_GAS.toString())

        if (r && r['script']) {
            var sgasScript = r['script'].hexToBytes();

            var sb = new ThinNeo.ScriptBuilder();
            sb.EmitPushNumber(new Neo.BigInteger(0));
            sb.EmitPushNumber(new Neo.BigInteger(0));
            tran.AddWitnessScript(sgasScript, sb.ToArray());
            var trandata = tran.GetRawData();

            // 发送转换请求
            r = await Https.rpc_postRawTransaction(trandata);
            if (!!r && !!r["txid"]) {
                // this.makeRefundTransaction_info(7)
                let list = ''
                let tranlist = localStorage.getItem('exchangelist');
                tranlist = tranlist.replace('[', '').replace(']', '');
                let tranObj = JSON.stringify({ 'trancount': transcount, 'txid': r.txid, 'trantype': 'SGas' });
                list = '[' + tranlist + ',' + tranObj + ']';
                localStorage.setItem('exchangelist', list);
            }
            else {
                // this.makeRefundTransaction_error("发送转换请求失败！")
            }
        }
        else {
            // this.makeRefundTransaction_error("获取转换合约失败！")
        }

    }

    static async canClaimCount() {

        let who = new Neo.Uint160(
            Helper.Account.GetPublicKeyScriptHash_FromAddress
                (
                Wallet.account.address
                ).buffer
        );

        let data = Common.buildScript(Const.DAPP_NNC, "canClaimCount", ["(hex160)" + who.toString()]);
        let res = await Https.rpc_getInvokescript(data);
        let stack = res["stack"][0]
        let amount = ResultItem.FromJson(stack["type"], stack["value"]);
        //console.log(amount.AsInteger().toString());

        return amount.AsInteger().toString();
    }

    static async claim(prikey: string) {
        let who = new Neo.Uint160(
            Helper.Account.GetPublicKeyScriptHash_FromAddress
                (
                Wallet.account.address
                ).buffer
        );
        let data = Common.buildScript(Const.DAPP_NNC, "claim", ["(hex160)" + who.toString()]);
        let res = await Transfer.contractInvoke_attributes(data, prikey);
        console.log(res);
        //prikey,Config.dapp_nnc, "claim", "(bytes)" + strhash
    }


    /**
     * @method 获得Sgas账户下的utxo
     */
    static async getsgasAssets(): Promise<Utxo[]> {
        //获得高度
        var height = await Https.api_getHeight();
        var scriptHash = Helper.Account.GetAddressFromScriptHash(Const.DAPP_SGAS);
        var utxos = await Https.api_getUTXO(scriptHash);   //获得utxo
        let res = [];
        for (var i in utxos) {
            var item = utxos[i];
            if (item.asset === Const.id_GAS) {
                let utxo = new Utxo(item);
                res.push(utxo);
            }
        }
        return res;
    }

}