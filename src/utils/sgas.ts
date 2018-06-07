import { Nep6, Neo, ThinNeo, Helper } from '../lib/neo-ts/index'
import * as Const from './const'
import Transfer from './transaction';
import { Asset, Utxo } from './entity';
import Wallet from './wallet';
import Common from './common';
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
     * 申请兑换gas
     * @param asset sgas合约账户的gas
     * @param amount 兑换额度
     */
    public static async applyGas(asset: Asset, amount: number) {
        let sgasAddr = Helper.Account.GetAddressFromScriptHash(Const.DAPP_SGAS);
        let GAS = await Wallet.getUTXO_GAS(sgasAddr);
        for (let index = 0; index < GAS.utxos.length; index++) {
            let utxo = GAS.utxos[index];
            let res = await SGAS.getRefundTarget(utxo.txid);
            if ((res['stack'][0]['value'] as string).length > 0)
                GAS.utxos.splice(index, 1);
        }

        SGAS.refund(amount, GAS, sgasAddr);
    }

    /**
     * SGAS => GAS
     *  本步骤需要分两步，第一步申请兑换，申请成功之后，领取gas
     * @param amount 退回数量
     */
    public static async refund(amount: number, GAS: Asset, target: string) {
        let scriptHash: Uint8Array = Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address);
        let script = Common.buildScript(Const.DAPP_SGAS, '(str)refund', ['(addr)' + Wallet.account.address])
        
        await Transfer.contractInvokeTrans(target, script, GAS, amount);

        //sign and broadcast
    }

    public static async getRefundTarget(txid: string) {
        let script = Common.buildScript(Const.DAPP_SGAS, 'getRefundTarget', ['(hex256)' + txid]);
        return await Transfer.invoketionTransaction(script);
    }

}