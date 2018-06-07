import { Neo, Helper } from '../lib/neo-ts/index';

export class UserInfo {
    public avatarUrl: string;
    public nickName: string;
}
export class Asset {
    id: string;      // asset id
    public amount: string = '0';  // 货币持有量
    claim: string;    // 如果是gas 需要有claim量
    price: string = '0.00';   // 价格
    total: string = '0.00';   // 持有的总价值
    name: string;    // 币名
    utxos: any;       // utxo 
    rise: boolean;     //币价走向
    isnep5: boolean = false;
    constructor(name: string, id: string, count: number = -1) {
        this.name = name;
        this.id = id;
        this.utxos = {};
        if (count !== -1) {
            this.isnep5 = true;
            this.amount = count + '';
        }
    }
    /**
     * 每轮刷新的时候 总资产，总价值都需要重新计算
     */
    public init() {
        this.amount = '0';
        if (!this.isnep5) {
            this.total = '0.00';
        }
    }

    /**
     * 添加UTXO
     *  检查下这个UTXO是否在已花费的列表中，如果有，而且高度已经超过了两个，那么就从spent移除，添加到utxo
     * @param utxo 新的UTXO
     * @param height 当前区块高度
     */
    public addUTXO(utxo: Utxo, height: number) {
        //已存在且已花费
        if ((this.utxos[utxo.txid] as Utxo) !== undefined && (this.utxos[utxo.txid] as Utxo).isSpent) {
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
    public ss() {
        console.log('====');
    }
    /**
     * 获取支付用的utxo
     * @param amount 需要的总金额
     * @param height 当前区块高度
     */
    public pay(amount: Neo.Fixed8): any {
        let count: Neo.Fixed8 = Neo.Fixed8.Zero;
        let outputs: Utxo[] = [];
        for (let key in this.utxos) {
            let utxo = this.utxos[key];
            // 总额未够且 未花费
            if (count.compareTo(amount) < 0 && !utxo.spent) {
                count.add(Neo.Fixed8.parse(utxo.count));
                // (this.utxos[key] as Utxo).spent = height;
                // (this.utxos[key] as Utxo).isSpent = true;
                outputs.push(utxo);
            }
        }
        let pay = new Pay(this.id, outputs, count)
        return { utxos: outputs, sum: count };
    }
}

export class Pay {
    assetid: string;
    utxos: Utxo[];
    sum: Neo.Fixed8;
    constructor(id: string, utxos: Utxo[], sum: Neo.Fixed8) {
        this.assetid = id;
        this.utxos = utxos;
        this.sum = sum;
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
export class Nep5 {
    id: string = ''; //资产id
    name: string = '';// 资产名
    count: number = 0; //资产数量

    constructor(nep5: any) {
        this.id = nep5.assetid;
        this.name = nep5.symbol;
        this.count = parseFloat(nep5.balance)
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


export class Consts {
    static baseContract = Neo.Uint160.parse("954f285a93eed7b4aed9396a7806a5812f1a5950");
    static registerContract =  Neo.Uint160.parse("d6a5e965f67b0c3e5bec1f04f028edb9cb9e3f7c");
}

export class DomainInfo {
    owner: Neo.Uint160//所有者
    register: Neo.Uint256//注册器
    resolver: Neo.Uint256//解析器
    ttl: string//到期时间
}

export class RootDomainInfo extends DomainInfo {
    rootname: string;
    roothash: Neo.Uint256;
    constructor() {
        super();
    }
}

export class Domainmsg {
    domainname: string;
    resolver: string;
    mapping: string;
    time: string;
    isExpiration: boolean;
    await_resolver: boolean;
    await_mapping: boolean;
    await_register: boolean;
}

export class DomainStatus {
    domainname: string;
    resolver: string;
    mapping: string;
    await_mapping: boolean;
    await_register: boolean;
    await_resolver: boolean;

    static setStatus(domain: DomainStatus) {
        // var arr = {};
        // if (str) {
        //     arr = JSON.parse(str);
        //     let msg = arr[domain.domainname] as DomainStatus;
        //     msg ? msg : msg = new DomainStatus();
        //     domain.await_mapping ? msg["await_mapping"] = domain.await_mapping : "";
        //     domain.await_register ? msg["await_register"] = domain.await_register : "";
        //     domain.await_resolver ? msg["await_resolver"] = domain.await_resolver : "";
        //     domain.mapping ? msg["mapping"] = domain.mapping : "";
        //     domain.resolver ? msg["resolver"] = domain.resolver.replace("0x", "") : "";
        //     arr[domain.domainname] = msg;
        // } else {
        //     arr[domain.domainname] = domain;
        // }
        // sessionStorage.setItem("domain-status", JSON.stringify(arr));
    }
    static getStatus() {
        // let str = sessionStorage.getItem("domain-status");
        let obj = {};
        // str ? obj = JSON.parse(sessionStorage.getItem("domain-status")) : {};
        return obj;
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
    n: number;
    asset: string;
    value: string;
    address: string;
    assetname: string;
    txtype: string;
    type: string;
    time: string;
    txid: string;
    vin: any;
    vout: any;
    block: number;
}

export class Claim {
    addr: string;//"ALfnhLg7rUyL6Jr98bzzoxz5J7m64fbR4s"
    asset: string;//"0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b"
    claimed: boolean;//""
    createHeight: number;//1365554
    n: number;//0
    txid: string;//"0x90800a9dde3f00b61e16a387aa4a2ea15e4c7a4711a51aa9751da224d9178c64"
    useHeight: number;//1373557
    used: string;//"0x47bf58edae75796b1ba4fd5085e5012c3661109e2e82ad9b84666740e561c795"
    value: number;//"1"

    constructor(json: {}) {
        this.addr = json['addr'];
        this.asset = json['asset'];
        this.claimed = json['claimed'];
        this.createHeight = json['createHeight'];
        this.n = json['n'];
        this.txid = json['txid'];
        this.useHeight = json['useHeight'];
        this.used = json['used'];
        this.value = json['value'];
    }
}

export class Claims {
    claims: Claim[];
    total: string;

    constructor(claims: Claim[], total: string) {
        this.claims = claims;
        this.total = total;
    }
}

export class WatchOnlyAccount {
    public nns: string;
    public address: string;
    public label: string;

    constructor(label: string, address: string, nns: string = null) {
        this.nns = nns;
        this.label = label;
        if (nns !== null)
            this.nns = nns;

    }
}