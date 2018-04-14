import * as NEL from '../lib/neo-ts/index'
import { WWW } from './API';
import { Wallet } from './wallet'
import tip from './tip';
import wepy from 'wepy'
export class TransactionTool {
    static formId = [];
    static unconfirmed = []

    constructor() {
    }

    /**
     * 构造并发送交易
     * @param {ThinNeo.Transaction} tran 
     * @param {string} randomStr
     */
    static async setTran(tran, prikey, pubkey, randomStr) {
        let version = tran.version.toString();

        tran.witnesses = [];
        wepy.showLoading({ title: '获取交易哈希' });
        let txid = NEL.helper.StringHelper.toHexString(NEL.helper.UintHelper.clone(tran.GetHash()).reverse())
        var msg = tran.GetMessage();

        wepy.showLoading({ title: '签名中' });
        var signdata = NEL.helper.Helper.Sign(msg, prikey, randomStr);
        
        tran.AddWitness(signdata, pubkey, Wallet.account.address);
        
        wepy.showLoading({ title: '交易发送中' });

        const res = await WWW.rpc_postRawTransaction(tran.GetRawData());
        wepy.hideLoading();
        return res;
    }

    // static async setNep5Tran(tran, prikey, pubkey, randomStr, assetid) {
    //     tran.type = NEL.thinneo.TransAction.TransactionType.InvocationTransaction;
    //     tran.extdata = new NEL.thinneo.InvokeTransData();
    //     let script = null;
    //     var sb = new NEL.thinneo.ScriptBuilder();
    //     var scriptaddress = NEL.helper.UintHelper.hexToBytes(assetid).reverse();
    //     sb.EmitPushString(inputName.value);
    //     sb.EmitPushBytes(this.main.panelLoadKey.pubkey);
    //     sb.EmitAppCall(scriptaddress);
    //     tran.extdata.script = sb.ToArray();
    //     tran.extdata.gas =  NEL.neo.Fixed8.fromNumber(1.0);
    //     this.main.panelTransaction.setTran(tran);
    // }
}