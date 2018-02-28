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
     */
    static async setTran(tran) {
        this.tran = tran;
        let type = NEL.thinneo.TransAction.TransactionType[tran.type].toString();
        let version = tran.version.toString();

        tran.witnesses = [];

        let txid =  NEL.helper.StringHelper.toHexString(NEL.helper.UintHelper.clone(tran.GetHash()).reverse())
        var msg = tran.GetMessage();
        WalletHelper.decode('1234561', UTXO.wallet, async (prikey, pubkey) => {
            var signdata = NEL.helper.Helper.Sign(msg, prikey);
            tran.AddWitness(signdata, pubkey, address);

            var result = await WWW.rpc_postRawTransaction(tran.GetRawData());

            if (result == true) {
                tip.alert("txid=" + txid);
            }
        })


    }
}