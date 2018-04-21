import { Https } from './Https';
import {Neo} from '../lib/neo-ts/index';
import { Coin } from './Coin'
export class UTXO {
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
        UTXO.utxo.splice(0, UTXO.utxo.length);
        UTXO.assets = {}
        UTXO.balance = {}
       
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
            let type = Coin.assetID2name[asset];
            this.utxo.push({ asset: type, txid: txid, count: count })
            this.assets[asset].push(utxo);
        }
        this.lock = false;
    }

}

