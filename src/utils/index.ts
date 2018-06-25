import Coin from './coin';
import * as Const from './const';
import Https from './Https';
import NNS from './nns';
import * as Random from './random';
import { Context } from './context';
import * as Time from './time';
import Tips from './tip';
import Transfer from './transaction';
import Cache from './cache';
import Wallet from './wallet';
import { Nep6, Helper, Neo } from '../lib/neo-ts/index';
import User from './user'
import Auction from './auctioin';
import { Asset } from './entity';
import NNSSell from './nnssell';

export { Https }

export default {
    show: {
        loading: Tips.loading,
        success: Tips.success,
        confirm: Tips.confirm,
        toast: Tips.toast,
        alert: Tips.alert,
        error: Tips.error,
        share: Tips.share
    },
    hide: {
        loading: Tips.loaded
    },
    send: {
        transfer: (prikey: string, targetaddr: string, asset: string, sendcount: number) => {
            let coin: Asset = Context.Assets[asset] as Asset;
            Transfer.contactTransaction(prikey, targetaddr, coin, sendcount);
        },
        // invoke: Transfer.nep5Transaction,
        claim: Transfer.claimGas,
    },
    auction: NNSSell,
    get: {
        random: Random.getSecureRandom,
        cache: Cache.get,
        height: () => { return Context.Height },
        account: () => { return Wallet.account },
        nep2: Wallet.getAccount, //获取用户账户
        assets: () => { return Context.Assets },
        userInfo: async () => { return await Context.getUser() },
        TXs: Context.OnGetTXs,
        prikey: (wif: string): string => { return Wallet.wif2prikey(wif) },
        total: () => { return Context.total },
        claim: () => { return Context.claim },
        sendCoin: () => { return Transfer.coin },
        addrByDomain: async (domain: string) => { return await NNS.verifyDomain(domain) },
        //addrByDomain2: async (domain: string) => { return await NNS.resolveData2(domain) },
        wantBy: Auction.wantBy,
        domainByAddr: NNS.getDomainsByAddr,
        wif: Wallet.prikey2Wif
    },
    set: {
        cache: Cache.put,
        account: Wallet.setAccount,
        account_json: Wallet.importAccount,
        openid: Context.openid,
        formid: (formid: string) => { Transfer.formId.push(formid); },
        sendCoin: (coin: Asset) => { Transfer.coin = coin }
    },
    delete: {
        account: Wallet.removeWallet
    },
    delegate: {
        asset: (delegate: Function) => Context.assetDelegate = delegate,
        tx: (delegate: Function) => Context.txDelegate = delegate
    },
    const: Const,
    init: {
        asset: Coin.initAllAsset,
        context: Context.init,
        nns: NNS.initRootDomain
        // NNS.nnsRegister('jinghui')
        //NNS.getDomainsByAddr();
    },
    service: {
        start: Context.init,
        update: Context.OnTimeOut,
    },
    reg: {
        domain: NNS.nnsRegister,
        test: () => {
            console.log('[[[[[[[[[[[[[[[[[[[[[[[');

            console.log(Helper.hexToBytes(Const.DAPP_SGAS.toString()));

            console.log(Const.DAPP_SGAS.toString());
            console.log(new Uint8Array(Const.DAPP_SGAS.bits.buffer))
            console.log(Const.DAPP_SGAS.toArray());

            console.log('[[[[[[[[[[[[[[[[[[[[[[[[');

        }
    }
}