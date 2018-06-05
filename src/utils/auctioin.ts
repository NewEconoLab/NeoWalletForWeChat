import Common from "./common";
import { DOMAIN_ROOT, DAPP_NNS } from "./const";
import Https from "./Https";
import Transfer from "./transaction";
import { Helper } from "../lib/neo-ts/index";
import Wallet from "./wallet";
import { Asset } from "./entity";

export default class Auction {
    constructor() { }

    public static async wantBy(domain: string, asset: Asset) {
        var roothash = Helper.toHexString(Common.nameHash(DOMAIN_ROOT).reverse());

        //得到注册器
        var sb = Common.buildScript(DAPP_NNS, "getOwnerInfo", new Array("(hex256)" + roothash));

        var res = await Https.rpc_getInvokescript(sb);
        var reg_sc = res['stack'][0]['value'][1]['value'];

        console.log(reg_sc);
        console.log(Helper.hexToBytes(reg_sc));
        
        var who = Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address);
        let script = Common.buildScript(Helper.hexToBytes(reg_sc), 'wantBuy', new Array("(hex160)" + Helper.toHexString(who.reverse()),
            "(hex256)" + roothash,
            "(str)" + domain));

        res = await Transfer.contractInvokeTrans(null, script, asset, 0, 1000000);
    }

    

}