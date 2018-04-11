import { WWW } from './API';
import { UTXO } from './UTXO';
import { Wallet } from './wallet';
import * as TimeHelper from './time';

export class Service {

    static isLoadTXs = false;
    static isLoadAsset = true;
    //交易历史代理
    static txDelegate = null;
    //资产代理
    static assetDelegate = null;

    static address = '';
    static temp_assets = {
        'NEO': {
            amount: 0,
            price: 0,
            total: 0,
            type: 'NEO'
        }, 'GAS': {
            amount: 0,
            price: 0,
            total: 0,
            type: 'GAS'
        }
    };

    static init(addr) {
        this.address = addr;

        //暂时不加载历史记录
        this.txDelegate = null;
        this.isLoadTXs = false;
        
        this.temp_assets = {
            'NEO': {
                amount: 0,
                price: 0,
                total: 0,
                type: 'NEO'
            }, 'GAS': {
                amount: 0,
                price: 0,
                total: 0,
                type: 'GAS'
            }
        };
    }
    /**
    * 定时触发
    */
    static async OnTimeOut() {
        Service.OnGetAssets();
        Service.OnGetPrice();
        if (Service.isLoadTXs) {
            Service.OnGetTXs(1);
        }
        Service.OnGetHeight();
    }

    /**
     * 加载区块链高度
     */
    static async OnGetHeight() {
        const height = await WWW.api_getHeight();
        Wallet.height = height;
    }

    /**
     * 获取账户资产信息 UTXO
     */
    static async OnGetAssets() {
        let that = this;

        for (let key in that.temp_assets) {
            that.temp_assets[key].amount = 0;
        }

        await UTXO.GetAssets(Service.address);
        for (let item of UTXO.utxo) {
            if (that.temp_assets[item.asset] === undefined)
                that.temp_assets[item.asset] = {
                    amount: 0,
                    price: 0,
                    total: 0,
                    type: item.asset
                };

            if (item.asset === 'NEO')
                that.temp_assets[item.asset].amount = parseInt(that.temp_assets[item.asset].amount) + parseInt(item.count);
            else {
                that.temp_assets[item.asset].amount = parseFloat(that.temp_assets[item.asset].amount) + parseFloat(item.count);
                that.temp_assets[item.asset].amount = parseFloat(that.temp_assets[item.asset].amount).toFixed(8);
            }

        }
        UTXO.balance = that.temp_assets;
        UTXO.utxo.reverse();
        //回调coin资产
        Service.assetDelegate(that.temp_assets);
    }

    /**
     * 获取市场价格
     */
    static async OnGetPrice() {
        let that = this;
        for (let key in that.temp_assets) {
            const coin = await WWW.api_getCoinPrice(key);
            that.temp_assets[key].price = parseFloat(coin[0]['price_cny']).toFixed(2);
            that.temp_assets[key].total =
                parseFloat(that.temp_assets[key].amount) *
                parseFloat(coin[0]['price_cny']).toFixed(2);
            that.temp_assets[key].total = parseFloat(that.temp_assets[key].total).toFixed(2);
            if (coin[0]['percent_change_1h'][0] !== '-') that.temp_assets[key].rise = true;
            else that.temp_assets[key].rise = false;
        }
        //回调法币资产
        Service.assetDelegate(that.temp_assets);
    }
    /**
     * 获取历史交易
     */
    static async OnGetTXs(page) {
        console.log(Service.address);

        const txs = await WWW.rpc_getAddressTXs(Service.address, 20, page);
        console.log(txs);

        for (let index in txs) {
            const date = txs[index].blocktime['$date'];
            txs[index].blocktime['$date'] = TimeHelper.formatTime(
                date,
                'Y/M/D h:m:s'
            );
            txs[index].blockindex =
                parseInt(Wallet.height) - parseInt(txs[index].blockindex) + 1;
        }
        if (Service.txDelegate !== null)
            Service.txDelegate(txs);
    }
}