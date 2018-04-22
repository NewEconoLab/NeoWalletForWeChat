import { Nep6, Neo, ThinNeo } from '../lib/neo-ts/index'
import { Asset, Utxo } from './entity';
import Https from './Https';
import Coin from './coin';
import { formatTime } from './time'
import Wallet from './wallet';
/**
 * 记录当前系统运行状态
 * 包括 当前账户 刷新等等
 */
export class Context {

    //记录币的对象 
    static Assets = {};

    //当前区块高度
    static Height: number = 0;

    //未确认交易
    static unconfirm = {};

    static isLoadTXs: boolean = false;
    static isLoadAsset: boolean = true;

    // 交易历史代理
    static txDelegate: Function = null;

    // 资产代理
    static assetDelegate: Function = null;

    static lock = false; // use lock to prevent muti request competition

    static openid:string;


    static init(addr: string) {
        // 暂时不加载历史记录
        this.txDelegate = null;
        this.isLoadTXs = false;

        let neo = new Asset('NEO');
        let gas = new Asset('GAS');

        this.Assets = {
            'NEO': neo, 'GAS': gas
        };
    }

    /**
     * 定时触发
     */
    static async OnTimeOut() {
        console.log('onTimeOut');

        Context.OnGetAssets();
        Context.OnGetPrice();

        if (Context.isLoadTXs) {
            Context.OnGetTXs(1);
        }

        Context.OnGetHeight();
    }

    /**
     * 加载区块链高度
     */
    static async OnGetHeight() {
        const height = await Https.api_getHeight();
        Context.Height = height;
    }

    /**
     * 获取账户资产信息 UTXO
     */
    static async OnGetAssets() {
        let that = this;

        //加锁，避免多个网络请求导致的刷新竞争
        if (this.lock === true) return;
        //加锁
        this.lock = true;

        var utxos = await Https.api_getUTXO(Context.getAccount().address);

        for (var i in utxos) {
            var item = utxos[i];
            let utxo: Utxo = new Utxo(item);
            let type = Coin.assetID2name[utxo.asset];

            if (this.Assets[type] === undefined) {
                this.Assets[type] = [];
            }

            (this.Assets[type] as Asset).addUTXO(utxo, this.Height);
        }

        //解锁
        this.lock = false;

        // 回调coin资产
        if (Context.assetDelegate !== null) {
            //这里为了避免因为刷新导致的数据闪烁问题，使用深复制
            // let assets = {};
            // for (let key in this.Assets) {
            //     const element = this.Assets[key];
            //     assets[key] = new Asset(key);
            // }
            Context.assetDelegate(Context.Assets);
        }

    }

    /**
     * 获取市场价格
     */
    static async OnGetPrice() {
        let that = this;
        for (let key in Context.Assets) {
            let asset = (Context.Assets[key] as Asset);
            const coin = await Https.api_getCoinPrice(asset.name);
            try {
                // 更新价格
                asset.price = parseFloat(coin[0]['price_cny']).toFixed(2);
                // 更新资产
                asset.total =
                    ((parseFloat(asset.amount.toString())) *
                        parseFloat(coin[0]['price_cny'])).toFixed(2);
                // 更新币市走向
                if (coin[0]['percent_change_1h'][0] !== '-') asset.rise = true;
                else asset.rise = false;
            } catch (err) {
                console.log('NET_ERR');
                console.log(err);
            }
        }
        // 回调法币资产
        if (Context.assetDelegate !== null)
            Context.assetDelegate(Context.Assets);
    }

    /**
     * 获取历史交易
     */
    static async OnGetTXs(page: number) {
        const txs = await Https.rpc_getAddressTXs(Context.getAccount().address, 20, page);
        console.log(txs);
        if (txs === undefined) {
            return;
        }

        for (let index in txs) {
            try {
                const date = txs[index].blocktime['$date'];
                txs[index].blocktime['$date'] = formatTime(
                    date,
                    'Y/M/D h:m:s'
                );
            } catch (err) {
                console.log('NET_Date_ERR');
                console.log(err);
            }
            txs[index].blockindex =
                parseInt((Context.Height - (txs[index].blockindex as number) + 1).toString());
        }
        if (Context.txDelegate !== null)
            Context.txDelegate(txs);
    }

    static getAccount(): Nep6.nep6account {
        return Wallet.account;
    }

    static setAccount(account: Nep6.nep6account) {
        Wallet.account = account;
    }
    
}