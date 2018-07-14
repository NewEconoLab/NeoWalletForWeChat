import Common from "./common";
import { DOMAIN_ROOT, DAPP_NNS } from "./const";
import Https from "./Https";
import Transfer from "./transaction";
import { Helper, ThinNeo, Neo } from "../lib/neo-ts/index";
import Wallet from "./wallet";
import { Asset, DomainState, SellDomainInfo } from "./entity";
import NNSSell from "./nnssell";

export default class Auction {
    constructor() { }

    /**
     * 查询域名状态
     */
    public static async queryDomainState(domain: string): Promise<SellDomainInfo> {
        let info: SellDomainInfo = new SellDomainInfo();
        domain = domain.trim();
        let verify = /^[a-zA-Z0-9]{1,32}$/;
        if (!verify.test(domain)) {
            info.state = DomainState.Invalid;
            return info;
        }

        info = await NNSSell.getSellingStateByDomain(domain + '.' + DOMAIN_ROOT);

        //是否开始域名竞拍 0:未开始竞拍
        let sellstate = (info.startBlockSelling.compareTo(Neo.BigInteger.Zero));
        if (sellstate > 0) {   // 判断是否已有结束竞拍的区块高度。如果结束区块大于零则状态为结束
            if (info.endBlock.compareTo(Neo.BigInteger.Zero) > 0) {
                info.state = info.maxPrice.compareTo(Neo.BigInteger.Zero) > 0 ? DomainState.Taken : DomainState.Avaliable;
                return info;
            }

            //根据开标的区块高度获得开标的时间
            let startTime = await Https.api_getBlockInfo(parseInt(info.startBlockSelling.toString()));
            let state = NNSSell.compareTime(startTime * 1000);   //对比时间获得状态 0:竞拍结束，1：正在竞拍，2:随机时间

            switch (state) {
                case 0:
                    info.state = info.maxPrice.compareTo(Neo.BigInteger.Zero) > 0 ? DomainState.Taken : DomainState.Avaliable;
                default:
                    info.state = DomainState.Bidding;
                    break;
            }
        } else {
            info.state = DomainState.Avaliable;
        }

        return info;
    }
}