import Https from './Https';
export default class Coin {
    static id_GAS = "0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
    static id_NEO = "0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";

    static assetID2name = {};
    static name2assetID = {};
    static async initAllAsset() {
        var allassets = await Https.api_getAllAssets();
        for (var a in allassets) {
            var asset = allassets[a];
            var names = asset.name;
            var id = asset.id;
            var name = "";

            if (id === Coin.id_GAS) {
                name = 'GAS';
            }
            else if (id === Coin.id_NEO) {
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