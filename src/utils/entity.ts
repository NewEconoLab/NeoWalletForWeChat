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
    /**
     * 构造器
     * @param name 资产名
     * @param id 资产id
     * @param count 仅nep5需要
     */
    constructor(name: string, id: string, count: number = -1) {
        this.name = name;
        this.id = id;
        this.utxos = {};

        // 只有nep5才可以在初始化的时候就知道余额
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
    public addUTXO(utxo: Utxo) {
        // // console.log(this.utxos[utxo.txid] as Utxo);

        //已存在且已花费
        if ((this.utxos[utxo.txid] as Utxo) === undefined) {
            //判断交易高度是否已经超过两个 判断交易失败，spent状态取消
            this.utxos[utxo.txid] = utxo;
        }
        this.amount = ((parseFloat(this.amount) + utxo.count) as number).toFixed(8);
    }

    /**
     * 获取支付用的utxo
     * @param amount 需要的总金额
     * @param height 当前区块高度
     */
    public pay(amount: number): Pay {
        let count: number = 0.0;
        let outputs: Utxo[] = [];
        // console.log('amount');
        // console.log(amount.toString());

        for (let key in this.utxos) {

            let utxo = this.utxos[key];
            // console.log('sum')
            // console.log(utxo)
            // 总额未够且 未花费
            if (count < amount) {
                // console.log('add');
                // console.log(Neo.Fixed8.parse(utxo.count + '').toString());
                // console.log(count.toString());

                count += utxo.count;
                // (this.utxos[key] as Utxo).spent = height;
                // (this.utxos[key] as Utxo).isSpent = true;
                outputs.push(utxo);
            }
        }
        // console.log(this)
        let pay = new Pay(this.id, outputs, count)
        return pay
    }
}

export class Pay {
    assetid: string;
    utxos: Utxo[];
    sum: number;
    constructor(id: string, utxos: Utxo[], sum: number) {
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

/**
 * 需要从服务器更新的任务
 * 由区块高度变化触发
 */
export class Task {
    height: number = -1;//任务部署高度
    confirmBlocks: number = 0;//任务确认周期
    type: TaskType = TaskType.asset; //任务类型 默认资产更新
    txid?: string = '';// 如果是交易确认任务则有
    callback?: Function = null; // 回调

    constructor(height: number,
        confirm: number = 0,
        type: TaskType = TaskType.asset,
        txid?: string,  // 可null
        callback?: Function) {

        this.height = height;
        this.confirmBlocks = confirm;
        this.txid = txid;
        this.callback = callback;

    }
}

/**
 * 任务管理类
 */
export class TaskManager {
    static tasks = null;

    // 更新任务
    static update(height: number) {
        if (TaskManager.tasks === null)
            return;
        console.log(TaskManager.tasks)
        for (let index in TaskManager.tasks) {
            let task = TaskManager.tasks[index] as Task;
            console.log(task);

            if (task.height + task.confirmBlocks <= height) {
                //达到确认高度，触发回调
                task.callback();
                delete TaskManager.tasks[index];
            }
        }
    }

    //添加新任务
    static addTask(task: Task) {
        if (TaskManager.tasks === null)
            TaskManager.tasks = [];

        if (task !== null) {
            TaskManager.tasks.push(task);
        }
    }
}

/**
 * 任务类型
 */
export enum TaskType {
    tx = 'tx',// 交易确认 需要签名的任务，涉及资产变动
    asset = 'asset',// 资产更新 在tx交易成功后添加资产更新任务，资产更新立即执行
    history = 'history', //更新历史记录
    price = 'price',
    claim  = 'claim',
    height='height'
}

/**
 * 竞拍模型
 */
export class MyAuction {
    id: string;
    auctionSpentTime: string;
    auctionState: string;
    endedState: number;
    blockindex: string;
    domain: string;
    maxBuyer: string;
    maxPrice: string;
    owner: string;
    startAuctionTime: number;
    balanceOfSelling: string;
    bidListSession: Object;
    receivedState: number;
}

export class DomainInfo {
    status: DomainState = null;     // 域名状态
    owner: Neo.Uint160 = null;      // 所有者
    register: Neo.Uint256 = null;   // 注册器
    resolver: Neo.Uint256 = null;   // 解析器
    ttl: string = null;             // 到期时间
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

export class DataType {
    public static Array = 'Array';
    public static ByteArray = 'ByteArray';
    public static Integer = 'Integer';
    public static Boolean = 'Boolean';
    public static String = 'String';
}
export enum DomainState {
    // 有owner 有ttl且没过期
    Taken = 'taken',
    // 竞拍中 没owner 有ttl
    Bidding = 'bidding',
    // 已过期 不是自己的 有owner ttl过期
    Avaliable = 'avaliable',
    //格式错误域名
    Invalid = 'invalid',
    // 已过期 是自己的 
    Renew = 'renew',
}

export class ResultItem {
    public data: Uint8Array;
    public subItem: ResultItem[];

    public static FromJson(type: string, value: any): ResultItem {
        let item: ResultItem = new ResultItem();
        if (type === DataType.Array) {
            item.subItem = []//new ResultItem[(value as Array<any>).length];
            for (let i = 0; i < (value as any[]).length; i++) {
                let subjson = ((value as any)[i] as Map<string, any>);
                let subtype = (subjson["type"] as string);
                item.subItem.push(ResultItem.FromJson(subtype, subjson["value"]));
            }
        }
        else if (type === DataType.ByteArray) {
            item.data = Helper.hexToBytes(value as string)
        }
        else if (type === DataType.Integer) {
            item.data = Neo.BigInteger.parse(value as string).toUint8Array();
        }
        else if (type === DataType.Boolean) {
            if ((value as number) != 0)
                item.data = new Uint8Array(0x01);
            else
                item.data = new Uint8Array(0x00);
        }
        else if (type === DataType.String) {
            item.data = new Buffer(value as string);
        }
        else {
            // console.log("not support type:" + type);
        }
        return item;
    }


    public AsHexString(): string {
        return Helper.toHexString(this.data);
    }
    public AsHashString(): string {
        return "0x" + Helper.toHexString(this.data.reverse());
    }
    public AsString(): string {
        return String.fromCharCode.apply(null, this.data);
    }
    public AsHash160(): Neo.Uint160 {
        if (this.data.length === 0)
            return null;
        return new Neo.Uint160(this.data.buffer);
    }

    public AsHash256(): Neo.Uint256 {
        if (this.data.length === 0)
            return null;
        return new Neo.Uint256(this.data.buffer)
    }
    public AsBoolean(): boolean {
        if (this.data.length === 0 || this.data[0] === 0)
            return false;
        return true;
    }

    public AsInteger(): Neo.BigInteger {
        return new Neo.BigInteger(this.data);
    }
}
export class NNSResult {
    public textInfo: string;
    public value: any; //不管什么类型统一转byte[]
}

/**
 * 竞拍合约域名
 * @param startBlockSelling 开始竞标高度
 * @param endBlock 拍卖结束
 * @param lastBlock 最后出价高度
 * @param maxPrice 最大出价
 * @param maxBuyer 最大出价者(地址)
 */
export class SellDomainInfo extends DomainInfo {
    state: DomainState;
    domain: string;
    id: Neo.Uint256;
    startBlockSelling: Neo.BigInteger;
    endBlock: Neo.BigInteger;
    maxPrice: Neo.BigInteger;
    lastBlock: Neo.BigInteger;
    maxBuyer: Neo.Uint160;
    balanceOf: Neo.BigInteger;
    balanceOfSelling: Neo.BigInteger;
    constructor() {
        super();
    }
    copyDomainInfoToThis(info: DomainInfo) {
        this.owner = info.owner;
        this.ttl = info.ttl;
        this.register = info.register;
        this.resolver = info.resolver;
    }
}

export class WatchOnly {
    nns: string;
    name: string;
    addr: string;

    constructor(name: string, addr: string, nns: string = null) {
        this.name = name;
        this.addr = addr;
        if (nns !== null)
            this.nns = nns;
    }

    public static parse(json: {}) {
        return new WatchOnly(json['name'], json['addr'], json['nns'])
    }
    public toJson() {
        return {
            name: this.name,
            addr: this.addr,
            nns: this.nns
        }
    }
}