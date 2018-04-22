import Coin from './coin';
import * as Config from './config';
import * as Entity from './entity';
import Https from './Https';
import NNS from './nns';
import * as Random from './random';
import { Context } from './context';
import * as Time from './time';
import Tips from './tip';
import Transfer from './transaction';
import Cache from './cache';
import Wallet from './wallet';
import { Nep6 } from '../lib/neo-ts';

export { Https }

export default {
    util: {
        Https: Https,
        Context: Context,
        Time: Time,
        NNS: NNS,
    },
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
    Send: {
        transfer: Transfer.makeTran,
        invoke: Transfer.nep5Transaction,
        // claim:Transfer.
    },
    get: {
        random: Random.getSecureRandom,
        cache: Cache.get,
        height: Context.Height,
        account: Wallet.account,
        nep2:Wallet.importAccount,
        assets: Context.Assets,
        rootName: NNS.getRootName,
        rootNameHash: NNS.getRootNameHash,
        userInfo: Wallet.getUserInfo,
        TXs: Context.OnGetTXs,
        prikey:(wif:string):string=>{return Wallet.wif2prikey(wif)},
        
    },
    set: {
        cache: Cache.put,
        account:Wallet.setAccount,
        openid: Context.openid,
    },
    delegate: {
        asset: Context.assetDelegate,
        tx: Context.txDelegate
    },
    config: Config,
    init: {
        asset: Coin.initAllAsset,
        context: Context.init
    },
    service: {
        start: () => { Context.OnGetHeight(); Context.OnTimeOut() }
    }
}