import { WWW } from './API';
import * as NEL from '../lib/neo-ts/index';
import { CoinTool } from './Coin'
export class UTXO {
    static assets = {}  //{ [id: string]: UTXO[] }
    static utxo = []
    static balance = {}
    constructor() {
    }
    static async GetAssets(addr) {
        let that = this
        UTXO.utxo.splice(0, UTXO.utxo.length);
        UTXO.assets = {}
        UTXO.balance = {}
        var utxos = await WWW.api_getUTXO(addr);
        this.assets = {};
        for (var i in utxos) {
            var item = utxos[i];
            var txid = item.txid;
            var n = item.n;
            var asset = item.asset;
            var count = item.value;
            if (this.assets[asset] == undefined) {
                this.assets[asset] = [];
            }
            var utxo = new Utxo();
            utxo.addr = item.addr;
            utxo.asset = asset;
            utxo.n = n;
            utxo.txid = txid;
            utxo.count = NEL.neo.Fixed8.parse(count);
            let type = CoinTool.assetID2name[asset];
            this.utxo.push({ asset: type, txid: txid, count: count })
            this.assets[asset].push(utxo);
        }
    }
}

export class Utxo {
    addr = '';
    txid = '';
    n = -1;
    asset = '';
    count = 0;
}