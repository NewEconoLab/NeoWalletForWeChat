import * as NEL from '../lib/neo-ts/index'
import { WWW } from './API';
import { Wallet } from './wallet'
import tip from './tip';
import wepy from 'wepy'
export class TransactionTool {
    static unconfirm = []

    constructor() {
    }

    /**
     * construct transaction
     * @param {ThinNeo.Transaction} tran 
     * @param {string} randomStr
     */
    static async setTran(tran, prikey, pubkey, randomStr) {
        let type = NEL.thinneo.TransAction.TransactionType[tran.type].toString();
        let version = tran.version.toString();

        tran.witnesses = [];
        wepy.showLoading({ title: '获取交易哈希' });
        let txid = NEL.helper.StringHelper.toHexString(NEL.helper.UintHelper.clone(tran.GetHash()).reverse())
        var msg = tran.GetMessage();

        wepy.showLoading({ title: '签名中' });
        var signdata = NEL.helper.Helper.Sign(msg, prikey, randomStr);
        // console.log('signdata= ' + signdata)
        tran.AddWitness(signdata, pubkey, Wallet.account.address);
        // console.log(NEL.helper.StringHelper.toHexString(tran.GetRawData()))
        wepy.showLoading({ title: '交易发送中' });
        var result = await WWW.rpc_postRawTransaction(tran.GetRawData());
        wepy.hideLoading();
        // console.log(result);
        if (result[0]['sendrawtransactionresult'] === true) {
            return result[0]['txid'];
        }
        return 'failed'

    }
}