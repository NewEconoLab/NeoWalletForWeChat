import Coin from './coin';
import * as Const from './const';
import NNS from './nns';
import * as Random from './random';
import { Context } from './context';
import Tips from './tip';
import Transfer from './transaction';
import Cache from './cache';
import Wallet from './wallet';
import Auction from './auctioin';
import { Asset, WatchOnlyAccount } from './entity';
import NNSSell from './nnssell';
import Emitter from './Emitter';
import MyDomains from './mydomain';
import WatchOnlyManager from './watchonly';

export default {
    auction: NNSSell,
    wallet: Wallet,
    Emitter: Emitter,
    const: Const,
    myDomain: MyDomains,
    watchOnly: WatchOnlyManager,
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
        transfer: async (targetaddr: string, asset: string, sendcount: number) => {
            let coin: Asset = Context.Assets[asset] as Asset;
            return await Transfer.contactTransaction(targetaddr, coin, sendcount);
        },
        // invoke: Transfer.nep5Transaction,
        claim: Transfer.claimGas,
    },
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
        sendAddr: () => { return Transfer.address },
        addrByDomain: async (domain: string) => { return await NNS.verifyDomain(domain) },
        domainByAddr: NNS.getDomainsByAddr,
        wif: Wallet.prikey2Wif,
        domainState: Auction.queryDomainState,
        root: async () => { NNS.getRoot() },
        myDomain: MyDomains.getAllNeoName,
        bidInfo: Auction.getBidDetail,
        watchonly: WatchOnlyManager.getAll
    },
    set: {
        cache: Cache.put,
        account: Wallet.setAccount,
        account_json: Wallet.importAccount,
        openid: Context.openid,
        formid: (formid: string) => { Transfer.formId.push(formid); },
        sendCoin: (coin: Asset) => { Transfer.coin = coin },
        setAddr: (addr: WatchOnlyAccount) => { Transfer.address = addr }
    },
    delete: {
        account: Wallet.removeWallet,
        watchonly:WatchOnlyManager.delete
    },

    init: {
        asset: Coin.initAllAsset,
        context: Context.init,
        nns: NNS.initRootDomain,
        notity: Context.notity
    },
    service: {
        start: Context.init,
        update: Context.OnTimeOut,
    },
    reg: {
        domain: NNS.nnsRegister,
        test: () => {
            // // console.log('[[[[[[[[[[[[[[[[[[[[[[[');

            // // console.log(Helper.hexToBytes(Const.DAPP_SGAS.toString()));

            // // console.log(Const.DAPP_SGAS.toString());
            // // console.log(new Uint8Array(Const.DAPP_SGAS.bits.buffer))
            // // console.log(Const.DAPP_SGAS.toArray());

            // // console.log('[[[[[[[[[[[[[[[[[[[[[[[[');

        }
    }
}