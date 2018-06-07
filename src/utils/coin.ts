import Https from './Https';
import {id_GAS, id_NEO} from './const'
export default class Coin {
    static assetID2name = {};
    static name2assetID = {};
    static async initAllAsset() {
        var allassets = await Https.api_getAllAssets();
        for (var a in allassets) {
            var asset = allassets[a];
            var names = asset.name;
            var id = asset.id;
            var name = "";

            if (id === id_GAS) {
                name = 'GAS';
            }
            else if (id === id_NEO) {
                name = 'NEO';
            }
            else {
                for (var i in names) {
                    name = names[i].name;
                    if (names[i].lang === "en")
                        break;
                }
            }
            Coin.assetID2name[id] = name;
            Coin.name2assetID[name] = id;
        }
    }
}