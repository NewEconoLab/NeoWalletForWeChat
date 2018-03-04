import { WWW } from './API';
import * as NEL from '../lib/neo-ts/index';
import { ID_GAS, ID_NEO } from './constant'
export class UTXO {
    static assets = {}  //{ [id: string]: UTXO[] }
    static history = []
    static balance = {}
    constructor() {
    }
    static async GetAssets(addr) {
        let that = this
        UTXO.history.splice(0, UTXO.history.length);
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
            let type = ''
            switch (asset) {
                case ID_GAS:
                this.history.push({ asset: 'GAS', txid: txid, count: count })
                    break
                case ID_NEO:
                this.history.push({ asset: 'NEO', txid: txid, count: count })
                    break
                default:
                    break;
            }
            
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