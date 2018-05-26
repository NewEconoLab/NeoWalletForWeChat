import { Nep6, Neo, ThinNeo, Helper } from '../lib/neo-ts/index'
import * as Const from './const'
import { Account } from '../lib/neo-ts/Helper';
import Transfer from './transaction';
import { Asset } from './entity';
import { getSecureRandom } from './random';
import { Https } from '.';
import Wallet from './wallet';
import { Fixed8 } from '../lib/neo-ts/neo';
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
        let scriptHash: Uint8Array = Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address);
        let tran: ThinNeo.Transaction = null;
        {
            let script: Uint8Array = null;
            var sb = new ThinNeo.ScriptBuilder()
            {
                sb.EmitParamJson(["(bytes)" + Helper.toHexString(scriptHash), "(str)refund"]);//参数倒序入
                sb.EmitAppCall(Const.DAPP_SGAS);//nep5脚本
                script = sb.ToArray();
            }
            Transfer.contractInvokeTrans(Wallet.account.address, script, GAS, amount, 150000);
        }

        //sign and broadcast
    }

}