import { Neo, Helper } from '../lib/neo-ts/index';

export class Asset {
    id: string;      // asset id
    amount: string = '0';  // 货币持有量
    claim: string;    // 如果是gas 需要有claim量
    price: string = '0.00';   // 价格
    total: string = '0.00';   // 持有的总价值
    name: string;    // 币名
    utxos: any;       // utxo 只有NEO和GAS才有
    rise:boolean;     //币价走向
    
    constructor(name) {
        this.name = name;
    }

    /**
     * 每轮刷新的时候 总资产，总价值都需要重新计算
     */
    init() {
        this.amount = '0';
        this.total = '0.00';
    }
    /**
     * 添加UTXO
     *  检查下这个UTXO是否在已花费的列表中，如果有，而且高度已经超过了两个，那么就从spent移除，添加到utxo
     * @param utxo 新的UTXO
     * @param height 当前区块高度
     */
    addUTXO(utxo: Utxo, height: number) {
        //已存在且已花费
        if (this.utxos[utxo.txid] !== undefined && (this.utxos[utxo.txid] as Utxo).isSpent) {
            //判断交易高度是否已经超过两个 判断交易失败，spent状态取消
            if (height - (this.utxos[utxo.txid] as Utxo).spent >= 2) {
                (this.utxos[utxo.txid] as Utxo).isSpent = false;
                (this.utxos[utxo.txid] as Utxo).spent = 0;
            }
        } else { //新的UTXO
            this.utxos[utxo.txid] = utxo;
        }
        this.amount = (parseFloat(this.amount) + utxo.count).toFixed(8);
    }

    /**
     * 获取支付用的utxo
     * @param amount 需要的总金额
     * @param height 当前区块高度
     */
    pay(amount: Neo.Fixed8, height: number): any {
        let count: Neo.Fixed8 = Neo.Fixed8.Zero;
        let outputs = [];
        for (let key in this.utxos) {
            let utxo = this.utxos[key];
            // 总额未够且 未花费
            if (count.compareTo(amount) < 0 && !utxo.spent) {
                count.add(Neo.Fixed8.parse(utxo.count));
                (this.utxos[key] as Utxo).spent = height;
                (this.utxos[key] as Utxo).isSpent = true;
                outputs.push(utxo);
            }
        }
        return outputs;
    }
}

export class Utxo {
    //目的地址
    addr: string = '';
    //输出id
    txid: string = '';
    n: number = -1;
    //资产id
    asset: string = '';
    //资产数量
    count: number = 0;
    //花费高度
    spent: number = 0;
    //花费状态
    isSpent: boolean = false;

    constructor(utxo: any) {
        this.txid = utxo.txid;
        this.n = utxo.n;
        this.asset = utxo.asset;
        this.addr = utxo.addr;
        this.count = parseFloat(utxo.value);
    }
}

export class Result {
    err: boolean;
    info: any;
}

export enum AssetEnum {
    NEO = '0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b',
    GAS = '0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7',
}

export class NeoAsset {
    neo: number;
    gas: number;
    claim: number;
}

export class UTXO {
    addr: string;
    txid: string;
    n: number;
    asset: string;
    count: Neo.Fixed8;

    static ArrayToString(utxos: UTXO[]): Array<any> {
        var str = "";
        var obj = [];
        for (var i = 0; i < utxos.length; i++) {
            obj.push({});
            obj[i].n = utxos[i].n;
            obj[i].addr = utxos[i].addr;
            obj[i].txid = utxos[i].txid;
            obj[i].asset = utxos[i].asset;
            obj[i].count = utxos[i].count.toString();
        }
        return obj
    }
    static StringToArray(obj: Array<any>): UTXO[] {
        var utxos: Array<UTXO> = new Array<UTXO>();
        for (var i = 0; i < obj.length; i++) {
            utxos.push(new UTXO);
            var str: string = obj[i].count;
            utxos[i].n = obj[i].n;
            utxos[i].addr = obj[i].addr;
            utxos[i].txid = obj[i].txid;
            utxos[i].asset = obj[i].asset;
            utxos[i].count = Neo.Fixed8.parse(str);
        }
        return utxos;
    }

    static setAssets(assets: { [id: string]: UTXO[] }) {
        var obj = {}
        for (var asset in assets) {
            let arr = UTXO.ArrayToString(assets[asset]);
            obj[asset] = arr;
        }
        sessionStorage.setItem("current-assets-utxos", JSON.stringify(obj));
    }
    static getAssets() {
        let assets = null;
        var str = sessionStorage.getItem("current-assets-utxos");
        if (str !== null && str != undefined && str != '') {
            assets = JSON.parse(str);
            for (const asset in assets) {
                assets[asset] = UTXO.StringToArray(assets[asset]);
            }
        }
        return assets;
    }
}

export class Consts {
    static baseContract = "0xdffbdd534a41dd4c56ba5ccba9dfaaf4f84e1362";
    static registerContract = "d6a5e965f67b0c3e5bec1f04f028edb9cb9e3f7c";
}

export class DomainInfo {
    owner: Uint8Array//所有者
    register: Uint8Array//注册器
    resolver: Uint8Array//解析器
    ttl: Neo.BigInteger//到期时间
}

export class RootDomainInfo extends DomainInfo {
    rootname: string;
    roothash: Uint8Array;
    constructor() {
        super();
    }
}

export class Transactionforaddr {
    addr: string;
    blockindex: number;
    blocktime: { $date: number }
    txid: string;
}
export interface Transaction {
    txid: string;
    type: string;
    vin: { txid: string, vout: number }[];
    vout: { n: number, asset: string, value: string, address: string }[];
}

export class History {
    n: number; asset: string; value: string; address: string; assetname: string;
    time: string; txid: string;
}