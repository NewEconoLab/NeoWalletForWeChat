import Common from "./common";
import { DOMAIN_ROOT } from "./const";
import Https from "./Https";
import { Helper, Neo } from "../lib/neo-ts/index";
import Wallet from "./wallet";
import { DomainState, SellDomainInfo, ResultItem, DataType, RootDomainInfo } from "./entity";
import NNSSell from "./nnssell";
import NNS from "./nns";
import { formatTime } from './time'
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

    console.log('domain state')
    console.log(info)
    if (info === null) {
      info = new SellDomainInfo();
      info.state = DomainState.Avaliable
      return info;
    }
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




  /**
 * 获得
 * @param id 竞拍id
 */
  static async getBalanceOfSeling(id: Neo.Uint256) {
    let who = new Neo.Uint160(Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address).buffer);
    const root = await NNS.getRoot() as RootDomainInfo
    let res = await Common.contractInvokeScript(
      root.register,
      "balanceOfSelling",
      "(hex160)" + who.toString(),
      "(hex256)" + id.toString()
    );
    var stackarr = res["stack"] as any[];
    let stack = ResultItem.FromJson(DataType.Array, stackarr).subItem[0];
    let balance = stack.AsInteger();
    return balance;
  }

  /**
   * 时间轴列表
   * @param domain 域名
   * @param currentpage 当前地址
   * @param pagesize 分页条数
   */
  static async getBidDetail(domain, currentpage = 0, pagesize = 5) {
    let res = await Https.api_getBidDetail(domain+'.'+DOMAIN_ROOT, currentpage, pagesize);
    console.log(res)
    let ret = [];
    if (res) {
     
      for (let i in res[0].list) {
        res[0].list[i].addPriceTime = formatTime(res[0].list[i].addPriceTime, 'Y/M/D h:m:s');
        ret.push(res[0].list[i]);
      }

      return ret;
    } else {
      return null;
    }
  }
}