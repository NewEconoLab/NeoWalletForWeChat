import { WWW } from './API';
import {Neo} from '../lib/neo-ts/index';
import { CoinTool } from './Coin'
export class UTXOTool {
    static assets:{ [id: string]: Utxo[] } = {} 
    static utxo = []
    static balance = {}
    static lock = false; // use lock to prevent muti request competition
    constructor() {
    }
    static async GetAssets(addr) {
        if (this.lock === true) {
            return;
        }
        this.lock = true;
        UTXOTool.utxo.splice(0, UTXOTool.utxo.length);
        UTXOTool.assets = {}
        UTXOTool.balance = {}
        var utxos = await WWW.api_getUTXO(addr);
        this.assets = {};
        for (var i in utxos) {
            var item = utxos[i];
            var txid = item.txid;
            var n = item.n;
            var asset = item.asset;
            var count = item.value;
            if (this.assets[asset] === undefined) {
                this.assets[asset] = [];
            }
            var utxo = new Utxo();
            utxo.addr = item.addr;
            utxo.asset = asset;
            utxo.n = n;
            utxo.txid = txid;
            utxo.count = Neo.Fixed8.parse(count);
            let type = CoinTool.assetID2name[asset];
            this.utxo.push({ asset: type, txid: txid, count: count })
            this.assets[asset].push(utxo);
        }
        this.lock = false;
    }

}

export class Utxo {
    addr:string = '';
    txid:string = '';
    n:number = -1;
    asset:string = '';
    count:Neo.Fixed8 = Neo.Fixed8.Zero;
}