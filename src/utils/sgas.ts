import { Nep6, Neo, ThinNeo, Helper } from '../lib/neo-ts/index'
import * as Const from './const'
import { Account } from '../lib/neo-ts/Helper';
import Transfer from './transaction';
import { Asset } from './entity';
import { getSecureRandom } from './random';
import { Https } from '.';
export default class SGAS {

    constructor() { }

    /**
     * GAS => SGAS
     */
    public static mintTokens(): Uint8Array {

        let data: Uint8Array = null;
        var sb = new ThinNeo.ScriptBuilder()
        {
            sb.EmitParamJson([
                "(str)mintTokens"
            ]);//参数倒序入
            sb.EmitAppCall(Const.DAPP_SGAS);//nep5脚本
            data = sb.ToArray();
        }
        return data;
    }


    /**
     * SGAS => GAS
     * @param amount 退回数量
     */
    public static refund(amount: number, GAS: Asset) {
        let sgas_address: string = Account.GetAddressFromScriptHash(Const.DAPP_SGAS);

        //检查sgas地址拥有的gas的utxo是否有被标记过
        for (var i = GAS.utxos.Length - 1; i >= 0; i--) {
            let script: Uint8Array = null;
            var sb = new ThinNeo.ScriptBuilder()
            {
                sb.EmitParamJson(["(hex256)" + GAS.utxos[i].txid.ToString(),"(str)getRefundTarget"]);
                sb.EmitAppCall(Const.DAPP_SGAS);//nep5脚本
                script = sb.ToArray();
            }

            if (GAS.utxos[i].n > 0)
                continue;

            var urlCheckUTXO = await Https.rpc_getInvokescript(script);

            // var jsonCU = JSON.parse(resultCheckUTXO);
            // var stack = jsonCU.AsDict()["result"].AsList()[0].AsDict()["stack"].AsList()[0].AsDict();
            // var value = stack["value"].AsString();
            // if (value.Length > 0)//已经标记的UTXO，不能使用
            // {
            //     newlist.RemoveAt(i);
            // }
        }


        ThinNeo.Transaction tran = null;
        {
            byte[] script = null;
            using(var sb = new ThinNeo.ScriptBuilder())
                {
                    var array = new MyJson.JsonNode_Array();
            array.AddArrayValue("(bytes)" + ThinNeo.Helper.Bytes2HexString(scriptHash));
            sb.EmitParamJson(array);//参数倒序入
            sb.EmitParamJson(new MyJson.JsonNode_ValueString("(str)refund"));//参数倒序入
            var shash = Config.dapp_sgas;
            sb.EmitAppCall(shash);//nep5脚本
            script = sb.ToArray();
        }

        //sgas 自己给自己转账   用来生成一个utxo  合约会把这个utxo标记给发起的地址使用
        tran = Helper.makeTran(newlist, sgas_address, new ThinNeo.Hash256(Config.id_GAS), amount);
        tran.type = ThinNeo.TransactionType.InvocationTransaction;
        var idata = new ThinNeo.InvokeTransData();
        tran.extdata = idata;
        idata.script = script;

        //附加鉴证
        tran.attributes = new ThinNeo.Attribute[1];
        tran.attributes[0] = new ThinNeo.Attribute();
        tran.attributes[0].usage = ThinNeo.TransactionAttributeUsage.Script;
        tran.attributes[0].data = scriptHash;
    }

        //sign and broadcast
        {//做智能合约的签名
    byte[] sgasScript = null;
    {
        var urlgetscript = Helper.MakeRpcUrl(Config.api, "getcontractstate", new MyJson.JsonNode_ValueString(Config.dapp_sgas.ToString()));
        var resultgetscript = await Helper.HttpGet(urlgetscript);
        var _json = MyJson.Parse(resultgetscript).AsDict();
        var _resultv = _json["result"].AsList()[0].AsDict();
        sgasScript = ThinNeo.Helper.HexString2Bytes(_resultv["script"].AsString());
    }
    byte[] iscript = null;
    using(var sb = new ThinNeo.ScriptBuilder())
        {
            sb.EmitPushString("whatever");
    sb.EmitPushNumber(250);
    iscript = sb.ToArray();
}
tran.AddWitnessScript(sgasScript, iscript);
        }
{//做提款人的签名
    var signdata = ThinNeo.Helper.Sign(tran.GetMessage(), prikey);
    tran.AddWitness(signdata, pubkey, address);
}
var trandata = tran.GetRawData();
var strtrandata = ThinNeo.Helper.Bytes2HexString(trandata);

byte[] postdata;
var url = Helper.MakeRpcUrlPost(Config.api, "sendrawtransaction", out postdata, new MyJson.JsonNode_ValueString(strtrandata));

var result = await Helper.HttpPost(url, postdata);
subPrintLine("得到的结果是：" + result);
var json = MyJson.Parse(result).AsDict();
if (json.ContainsKey("result")) {
    bool bSucc = false;
    if (json["result"].type == MyJson.jsontype.Value_Number) {
        bSucc = json["result"].AsBool();
        subPrintLine("cli=" + json["result"].ToString());
    }
    else {
        var resultv = json["result"].AsList()[0].AsDict();
        var txid = resultv["txid"].AsString();
        bSucc = txid.Length > 0;
    }
    if (bSucc) {
        Hash256 txid = tran.GetHash();
        url = Helper.MakeRpcUrlPost(Config.api, "getrawtransaction", out postdata, new MyJson.JsonNode_ValueString(txid.ToString()));
        while (true) {
            subPrintLine("正在等待交易验证，请稍后。。。。");
            result = await Helper.HttpPost(url, postdata);
            json = MyJson.Parse(result).AsDict();
            if (json.ContainsKey("result")) {
                //tx的第一个utxo就是给自己的
                Utxo utxo = new Utxo(address, txid, Config.id_GAS, amount, 0);
                //把这个txid里的utxo[0]的value转给自己
                TranGas(new List<Utxo>() { utxo }, amount);
                break;
            }
            await Task.Delay(5000);
        }
    }
    else {
    }
}
    }

}