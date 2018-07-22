import { Nep6, Neo, ThinNeo } from '../lib/neo-ts/index'
import { Asset, Utxo, Nep5, Claim, Claims, UserInfo, TaskManager, Task, TaskType } from './entity';
import Https from './Https';
import Coin from './coin';
import { formatTime } from './time'
import Wallet from './wallet';
import Transfer from './transaction';
import NNS from './nns';
import User from './user';
import Emitter from './Emitter';
import { DAPP_SGAS, DAPP_NNC, id_NEO, id_GAS } from './const';
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

    static lock = false; // use lock to prevent muti request competition

    static openid: string;

    static total: number = 0;

    static claim: Claims;

    static user: UserInfo = null;

    static notity() {
        //注册监听事件
        Emitter.register(TaskType.asset, (observer) => {
            // 获取资产之后立即进行价格的更新
            Context.OnGetAssets(observer);
        }, this);

        Emitter.register(TaskType.tx, (task: Task) => {
            TaskManager.addTask(task);
        }, this);

        Emitter.register(TaskType.history, (observer) => {
            Context.OnGetTXs(1, observer);
        }, this);

        Emitter.register(TaskType.claim, (observer) => {
            Context.OnGetClaims(observer);
        }, this)

        Emitter.register(TaskType.height, () => {
            Context.OnGetHeight();
        }, this)

        // 提前注册好重要的资产，避免测试网络或者主网里出现同名的
        let neo = new Asset('NEO', id_NEO);
        let gas = new Asset('GAS', id_GAS);
        let sgas = new Asset('SGAS', DAPP_SGAS.toString(), 0);
        let nnc = new Asset('NNC', DAPP_NNC.toString(), 0);

        Context.Assets['NEO'] = neo;
        Context.Assets['GAS'] = gas;
        Context.Assets['SGAS'] = sgas;
        Context.Assets['NNC'] = nnc;
        console.log(Context.Assets)

        // 获取链上所有资产
        Coin.initAllAsset();

    }

    static async init(account: Nep6.nep6account) {
        Wallet.setAccount(account);
        Context.OnGetHeight();
    }

    /**
     * 定时触发
     */
    static async OnTimeOut() {
        //周期更新高度
        Context.OnGetHeight();
    }

    /**
     * 加载区块链高度
     */
    static async OnGetHeight() {
        const height = await Https.api_getHeight();
        if (height === -1)
            return;

        //当新的高度与以前高度不同时，触发任务更新
        if (Context.Height < height) {
            //第一次更新高度，用于添加任务 不触发任务更新
            if (Context.Height !== 0)
                TaskManager.update(height as number);
            Context.Height = height;
        }
        return height;
    }

    /**
     * 获取账户资产信息 UTXO
     */
    static async OnGetAssets(observer: Function) {
        let that = this;
        //加锁，避免多个网络请求导致的刷新竞争
        if (this.lock === true) return;
        //加锁
        this.lock = true;
        try {
            let nep5s = await Https.api_getnep5Balance(Context.getAccount().address);

            for (let key in Context.Assets) {
                (Context.Assets[key] as Asset).amount = '0.00';
            }

            for (var i in nep5s) {
                var item = nep5s[i];
                let nep5: Nep5 = new Nep5(item);
                // let type = Coin.assetID2name[nep5.id];

                if (Context.Assets[nep5.name] === undefined) {
                    Context.Assets[nep5.name] = new Asset(nep5.name, nep5.id, nep5.count);
                } else if ((Context.Assets[nep5.name] as Asset).id === nep5.id) {
                    (Context.Assets[nep5.name] as Asset).amount = nep5.count + '';
                }
            }
        } catch (error) {
            console.error(error);
            this.lock = false;
            return
        }

        try {
            var utxos = await Https.api_getUTXO(Context.getAccount().address);
            for (var i in utxos) {
                var item = utxos[i];
                let utxo: Utxo = new Utxo(item);
                let type = Coin.assetID2name[utxo.asset];
                if (Context.Assets[type] === undefined) {
                    Context.Assets[type] = new Asset(type, utxo.asset);
                }
                if (Context.Assets[type] !== null)
                    (Context.Assets[type] as Asset).addUTXO(utxo);
            }
        } catch (error) {
            console.error(error);
            this.lock = false;
            return
        }

        //解锁
        this.lock = false;
        let assets = JSON.parse(JSON.stringify(Context.Assets));

        //设置默认转账币种
        Transfer.coin = assets['NEO'];
        console.log(assets)
        observer(assets);
        // Context.OnGetPrice(observer);
    }

    /**
     * 获取市场价格
     */
    static async OnGetPrice(observer: Function) {

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
            }
            observer(Context.Assets);
        }
    }

    /**
     * 获取历史交易
     */
    static async OnGetTXs(page: number, observer) {
        await Transfer.history();
        observer(Transfer.TXs);
        return Transfer.TXs;
    }

    static async OnGetClaims(observer) {

        let res = await Https.api_getclaimgas(Wallet.account.address, 0);
        let claims = [];
        if (res === null)
            return;
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

    static async getUser() {
        if (Context.user === undefined || Context.user === null) {
            let a = (await User.getUser() as UserInfo);
            let user = new UserInfo();
            user.avatarUrl = a.avatarUrl;
            user.nickName = a.nickName;
            Context.user = user;
        }

        return Context.user;
    }
}