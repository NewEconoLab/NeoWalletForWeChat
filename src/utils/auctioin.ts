import Common from "./common";
import { DOMAIN_ROOT } from "./const";
import Https from "./Https";
import { Helper, Neo } from "../lib/neo-ts/index";
import Wallet from "./wallet";
import { DomainState, SellDomainInfo, ResultItem, DataType, RootDomainInfo, MyAuction } from "./entity";
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
    let dm = domain + '.' + DOMAIN_ROOT;
    dm = dm.trim();
    if (!Common.isDomain(dm)) {
      info.state = DomainState.invalid;
      return info;
    }

    info = await NNSSell.getSellingStateByDomain(dm);
    if (info === null) {
      info = new SellDomainInfo();
      info.state = DomainState.open
      return info;
    }

    //是否开始域名竞拍 0:未开始竞拍
    let sellstate = (info.startBlockSelling.compareTo(Neo.BigInteger.Zero));
    if (sellstate > 0) {   // 判断是否已有结束竞拍的区块高度。如果结束区块大于零则状态为结束
      if (info.endBlock.compareTo(Neo.BigInteger.Zero) > 0) {
        info.state = info.maxPrice.compareTo(Neo.BigInteger.Zero) > 0 ? DomainState.end2 : DomainState.open;
        return info;
      }

      //根据开标的区块高度获得开标的时间
      let startTime = await Https.api_getBlockInfo(parseInt(info.startBlockSelling.toString()));
      let state = NNSSell.compareTime(startTime * 1000);   //对比时间获得状态 0:竞拍结束，1：正在竞拍，2:随机时间

      switch (state) {
        case 0:
          info.state = info.maxPrice.compareTo(Neo.BigInteger.Zero) > 0 ? DomainState.end2 : DomainState.open;
        default:
          info.state = DomainState.fixed;
          break;
      }
    } else {
      info.state = DomainState.open;
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
   * @param id 竞拍id
   * @param currentpage 当前地址
   * @param pagesize 分页条数
   */
  static async getBidDetail(id: string, currentpage = 0, pagesize = 5) {
    let res = await Https.api_getBidDetail(id, currentpage, pagesize);
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

  /**
   * 初始化竞拍域名的详情状态信息
   */
  static async initAuctionInfo(domain: string): Promise<MyAuction> {
    let info = await NNSSell.getSellingStateByDomain(domain);
    //获取状态
    let myauction: MyAuction = await NNSSell.getMyAuctionState(info);
    let balance = await NNSSell.getBalanceOfBid(info.id);
    myauction.balanceOfSelling = accDiv(balance.toString(), 100000000).toString();
    // this.myBidPrice =myauction.balanceOfSelling;

    //判断竞拍是否结束
    if (myauction.auctionState == "0") {
      let stateMsg = undefined;
      try {
        let stateMsg = await Https.getDomainState(Wallet.account.address, "0x" + myauction.id);
        // this.myBidPrice = stateMsg[ "mybidprice" ];
      } catch (error) {
        // this.myBidPrice = "0";
      }

      // 判断在该域名下的竞拍金额是否大于零
      let compare = Neo.Fixed8.parse(myauction.balanceOfSelling).compareTo(Neo.Fixed8.Zero);
      myauction.receivedState = compare < 0 ? 0 : 1;
      // this.state_getDomain = 0;
      // this.state_recover = 0;
      if (compare === 0 && myauction.owner === Wallet.account.address) {
        // this.state_getDomain = 2;
        // this.state_recover = 2;
      }
    }

    // let mybidprice = !!this.myBidPrice && this.myBidPrice != '' ? this.myBidPrice : 0;
    // this.updatePrice = mybidprice.toString();
  }

}