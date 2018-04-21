import {Helper,Neo, ThinNeo} from '../lib/neo-ts/index'
import { Https } from './Https';
import { Wallet } from './wallet'
import tip from './tip';
import wepy from 'wepy'
export class Transfer {
    static formId = [];
    static unconfirmed = []

    constructor() {
    }


    /**
     * 构造并发送交易
     * @param {ThinNeo.Transaction} tran 
     * @param {string} randomStr
     */
    static async setTran(tran:ThinNeo.Transaction, prikey:Uint8Array, pubkey, randomStr:string) {
        tran.witnesses = [];
        wepy.showLoading({ title: '获取交易哈希' });
        let txid = Helper.toHexString(Helper.clone(tran.GetHash()).reverse())
        var msg = tran.GetMessage();

        wepy.showLoading({ title: '签名中' });
        var signdata = Helper.Account.Sign(msg, prikey, randomStr);
        
        tran.AddWitness(signdata, pubkey, Wallet.account.address);
        
        wepy.showLoading({ title: '交易发送中' });

        const res = await Https.rpc_postRawTransaction(tran.GetRawData());
        wepy.hideLoading();
        
        return res;
    }

    /**
     *  合约调用交易
     * @param {Uint8Array} script 
     */
    static async contractInvokeTrans(script:Uint8Array)
    {
        // let current: LoginInfo = LoginInfo.getCurrentLogin();
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
        tran.attributes[ 0 ] = new ThinNeo.Attribute();
        tran.attributes[ 0 ].usage = ThinNeo.TransactionAttributeUsage.Script;
        tran.attributes[ 0 ].data = Helper.Account.GetPublicKeyScriptHash_FromAddress(addr);
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