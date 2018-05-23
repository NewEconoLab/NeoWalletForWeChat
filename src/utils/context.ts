import { Nep6, Neo, ThinNeo } from '../lib/neo-ts/index'
import { Asset, Utxo, Nep5, Claim, Claims } from './entity';
import Https from './Https';
import Coin from './coin';
import { formatTime } from './time'
import Wallet from './wallet';
import Transfer from './transaction';
/**
 * 记录当前系统运行状态
 * 包括 当前账户 刷新等等
 */
export class Context {

    //记录币的对象 
    static Assets = {};

    //可领取的gas
    static Claims = {};

    //当前区块高度
    static Height: number = 0;

    //未确认交易
    static unconfirm = {};

    // 交易历史刷新代理
    static txDelegate: Function = null;

    // 资产刷新代理
    static assetDelegate: Function = null;

    static lock = false; // use lock to prevent muti request competition

    static openid: string;

    static total: number = 0;

    static claim: Claims;

    static async init(account: Nep6.nep6account) {
        // 暂时不加载历史记录
        this.txDelegate = null;
        Wallet.setAccount(account);
        let neo = new Asset('NEO', '');
        let gas = new Asset('GAS', '');

        Context.Assets['NEO'] = neo;
        Context.Assets['GAS'] = gas;

        await Coin.initAllAsset();
        Context.OnGetHeight();
        Context.OnTimeOut();
    }

    /**
     * 定时触发
     */
    static async OnTimeOut() {
        console.log('onTimeOut');

        if (Context.assetDelegate === null) {
            return;
        }
        Context.OnGetAssets();
        Context.OnGetPrice();
        Context.OnGetTXs(1);
        Context.OnGetHeight();
        Context.OnGetClaims();
    }

    /**
     * 加载区块链高度
     */
    static async OnGetHeight() {
        const height = await Https.api_getHeight();
        if (height === -1)
            return;
        Context.Height = height;
    }

    /**
     * 获取账户资产信息 UTXO
     */
    static async OnGetAssets() {

        if (Context.assetDelegate === null)
            return;
        for (let key in Context.Assets) {
            (Context.Assets[key] as Asset).amount = '0.00';
        }
        let that = this;

        //加锁，避免多个网络请求导致的刷新竞争
        if (this.lock === true) return;
        //加锁
        this.lock = true;
        let nep5s = await Https.api_getnep5Balance(Context.getAccount().address);

        for (var i in nep5s) {
            for (var i in nep5s) {
                var item = nep5s[i];
                let nep5: Nep5 = new Nep5(item);
                // let type = Coin.assetID2name[nep5.id];
                if (Context.Assets[nep5.name] === undefined) {
                    Context.Assets[nep5.name] = new Asset(nep5.name, nep5.id, nep5.count);
                }
            }
        }
        var utxos = await Https.api_getUTXO(Context.getAccount().address);
        for (var i in utxos) {
            var item = utxos[i];
            let utxo: Utxo = new Utxo(item);
            let type = Coin.assetID2name[utxo.asset];
            if (Context.Assets[type] === undefined) {
                Context.Assets[type] = new Asset(type, utxo.asset);
            }

            if (Context.Assets[type] !== null)
                (Context.Assets[type] as Asset).addUTXO(utxo, Context.Height);
        }

        //解锁
        this.lock = false;
        let assets = JSON.parse(JSON.stringify(Context.Assets));
        Context.assetDelegate(assets);
    }

    /**
     * 获取市场价格
     */
    static async OnGetPrice() {
        if (Context.assetDelegate === null)
            return;
        let that = this;
        let total: number = 0;
        for (let key in Context.Assets) {

            const coin = await Https.api_getCoinPrice((Context.Assets[key] as Asset).name);
            try {
                // 更新价格
                (Context.Assets[key] as Asset).price = parseFloat(coin[0]['price_cny']).toFixed(2);
                let sum = (parseFloat((Context.Assets[key] as Asset).amount.toString())) *
                    parseFloat(coin[0]['price_cny']);
                total += sum;
                // 更新资产
                (Context.Assets[key] as Asset).total =
                    sum.toFixed(2);
                // 更新币市走向
                if (coin[0]['percent_change_1h'][0] !== '-') (Context.Assets[key] as Asset).rise = true;
                else (Context.Assets[key] as Asset).rise = false;
            } catch (err) {
                console.log('NET_ERR');
                console.log(err);
            }
        }
        Context.total = total;

        let assets = JSON.parse(JSON.stringify(Context.Assets));
        Context.assetDelegate(assets);
    }

    /**
     * 获取历史交易
     */
    static async OnGetTXs(page: number) {
        if (Context.txDelegate === null)
            return;

        await Transfer.history();
        Context.txDelegate(Transfer.TXs);
        return Transfer.TXs;
    }

    static async OnGetClaims() {

        let res = await Https.api_getclaimgas(Wallet.account.address, 0);

        console.log(res);
        let claims = [];
        for (let i in res['claims']) {
            let claim = new Claim(res.claims[i]);
            claims.push(claim);
        }

        let a = res['gas'].toFixed(8);

        Context.claim = new Claims(claims, a);
    }

    static getAccount(): Nep6.nep6account {
        return Wallet.account;
    }

    static setAccount(account: Nep6.nep6account) {
        Wallet.account = account;
    }

}