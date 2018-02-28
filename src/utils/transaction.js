import * as NEL from '../lib/neo-ts/index'
import { WWW } from './API';
import { WalletHelper } from './wallet'
import { UTXO } from '../utils/UTXO';

export class TransactionTool {
    constructor() {
        let assets  //: { [id: string]: entity.UTXO[] }
        let tran   //: ThinNeo.Transaction;
    }

    /**
     * construct transaction
     * @param {ThinNeo.Transaction} tran 
     * @param {string} randomStr
     */
    static async setTran(tran, randomStr) {
        this.tran = tran;
        let type = NEL.thinneo.TransAction.TransactionType[tran.type].toString();
        let version = tran.version.toString();

        tran.witnesses = [];

        let txid = NEL.helper.StringHelper.toHexString(NEL.helper.UintHelper.clone(tran.GetHash()).reverse())
        var msg = tran.GetMessage();
        WalletHelper.decode('1234561', UTXO.wallet, async (prikey, pubkey) => {
            var signdata = NEL.helper.Helper.Sign(msg, prikey, randomStr);
            console.log('signdata= '+ signdata)
            tran.AddWitness(signdata, pubkey, UTXO.wallet.address);
            console.log(NEL.helper.StringHelper.toHexString(tran.GetRawData()))
            var result = await WWW.rpc_postRawTransaction(tran.GetRawData());
            console.log('>><<<<>>>')
            console.log(result);
            if (result == true) {
                tip.alert("txid=" + txid);
            }
        })


    }
}