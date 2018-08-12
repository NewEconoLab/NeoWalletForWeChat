import { DomainInfo, SellDomainInfo, NNSResult, ResultItem, DataType, Asset, MyAuction, RootDomainInfo, DomainState } from "./entity";
import { Neo, Helper, ThinNeo } from "../lib/neo-ts/index";
import Common from "./common";
import NNS from './nns'
import Https from "./Https";
import Wallet from "./wallet";
import { DAPP_SGAS, DAPP_NNS, id_GAS } from "./const";
import Transfer from "./transaction";
import { formatTime } from './time'
export default class NNSSell {

  /**
   * 获得竞拍域名详情
   * @param domain 域名
   */
  static async getSellingStateByDomain(domain: string) {
    var domainarr: string[] = domain.split('.');
    var nnshash: Neo.Uint256 = Common.nameHashArray(domainarr);
    const root = await NNS.getRoot() as RootDomainInfo
    var scriptaddress = root.register;

    let data = Common.buildScript(scriptaddress, "getSellingStateByFullhash", ["(hex256)" + nnshash.toString()]);
    let result = await Https.rpc_getInvokescript(data);
    let domainInfo: DomainInfo = await NNS.getOwnerInfo(nnshash, DAPP_NNS);

    let info = new SellDomainInfo();
    try {
      info.copyDomainInfoToThis(domainInfo);
      var state = result.state as string;
      if (state.includes("FAULT, BREAK")) {
        throw "FAULT, BREAK";
      }
      let rest = new NNSResult();
      rest.textInfo = result;
      var stackarr = result["stack"] as any[];
      let stack = ResultItem.FromJson(DataType.Array, stackarr).subItem[0].subItem
      info.id = stack[0].AsHash256();
      let parenthash = stack[1].AsHash256();
      info.domain = stack[2].AsString();
      info.ttl = stack[3].AsInteger().toString();
      info.startBlockSelling = stack[4].AsInteger();
      info.endBlock = stack[5].AsInteger();
      info.maxPrice = stack[6].AsInteger();
      info.maxBuyer = stack[7].AsHash160();
      info.lastBlock = stack[8].AsInteger();
      if (!!info.id) {   //竞拍id不为空则查询域名下的余额
        info.balanceOfSelling = await NNSSell.getBalanceOfBid(info.id);
      }
      return info;
    }
    catch (e) {
      console.error(e);
    }
    return null;
  }

  /**d
 * 获得
 * @param id 竞拍id
 */
  static async getBalanceOfBid(id: Neo.Uint256): Promise<Neo.BigInteger> {
    let who = new Neo.Uint160(Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address).buffer);
    const root = await NNS.getRoot() as RootDomainInfo
    var scriptaddress = root.register;
    let res = await Common.contractInvokeScript(
      scriptaddress,
      "balanceOfBid",
      "(hex160)" + who.toString(),
      "(hex256)" + id.toString()
    );
    var stackarr = res["stack"] as any[];
    let stack = ResultItem.FromJson(DataType.Array, stackarr).subItem[0];
    let balance = stack.AsInteger();
    return balance;
  }

  static async getBidList(): Promise<Array<MyAuction>> {
    //获得加价列表
    let res = await Https.api_getBidListByAddress(Wallet.account.address);
    console.log('bidlist:')
    console.log(res);
    if (res === null) {
      return [];
    }

    let arr = new Array<MyAuction>();
    let list = res ? res[0]["list"] as Array<MyAuction> : [];
    let ids = list.map(auction => {
      return auction.id;
    });
    let amounts = await NNSSell.getBalanceOfSelingArray(ids);
    for (let i in list) {
      const element = list[i];
      element.receivedState = 0;
      //根据余额和所有者判断当前账户是否领取过了域名或退币
      if (element.auctionState == '0') {
        //获得当前账户该域名下的余额
        let balanceOfSelling = amounts[element.id]
        if (element.maxBuyer === Wallet.account.address) {
          //  判断所有者是不是自己并且余额为0
          element.receivedState = (balanceOfSelling.compareTo(Neo.BigInteger.Zero) === 0 && element.owner === Wallet.account.address) ? 1 : 0;
        } else {
          element.receivedState = balanceOfSelling.compareTo(Neo.BigInteger.Zero) == 0 ? 2 : 0;//2 随机期 0 结束
        }
      }
      //开始时间日期格式化
      element.startAuctionTime = formatTime(element.startAuctionTime, 'Y/M/D h:m:s'); // formatTime("yyyy/MM/dd hh:mm:ss", new Date(element.startAuctionTime * 1000));

      element.endedState = 0;
      element.auctionState = '3';
      element.maxBuyer = null;
      element.maxPrice = '0';
      let info = await NNSSell.getSellingStateByDomain(element.domain);
      if (info.startBlockSelling.compareTo(Neo.BigInteger.Zero) > 0 && info.maxPrice.compareTo(Neo.BigInteger.Zero) > 0) {

        element.maxBuyer = Helper.Account.GetAddressFromScriptHash(info.maxBuyer);
        element.maxPrice = accDiv(parseInt(info.maxPrice.toString()), 100000000).toString();
        // element.auctionState = '1'; //确定期
      }
      arr.push(element);
    }

    console.log('bidlist');
    console.log(arr)
    return arr
  }


  /**
   * 获得
   * @param id 竞拍id
   */
  static async getBalanceOfSelingArray(ids: string[]) {
    let addr = Wallet.account.address
    let who = new Neo.Uint160(Helper.Account.GetPublicKeyScriptHash_FromAddress(addr).buffer);
    var sb = new ThinNeo.ScriptBuilder();
    const root = await NNS.getRoot() as RootDomainInfo
    var scriptaddress = root.register;
    for (const index in ids) {
      if (ids.hasOwnProperty(index)) {
        const id = ids[index];
        sb.EmitParamJson([
          "(hex160)" + who.toString(),
          "(hex256)" + id
        ]);//第二个参数是个数组
        sb.EmitPushString("balanceOfSelling");
        sb.EmitAppCall(scriptaddress);
      }
    }
    let res = await Https.rpc_getInvokescript(sb.ToArray());
    var stackarr = res["stack"] as any[];
    let stack = ResultItem.FromJson(DataType.Array, stackarr);
    let obj = {};
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      obj[id] = stack.subItem[i].AsInteger();
    }
    return obj;

    // let balance = stack.AsInteger();
    // return balance;
  }

  static async gasToRecharge(transcount: number, asset: Asset) {
    let script = Common.buildScript(DAPP_SGAS, "mintTokens", []);

    //获得sgas的合约地址
    var sgasaddr = Helper.Account.GetAddressFromScriptHash(DAPP_SGAS);
    try {
      let data1 = await Common.buildInvokeTransData(script, sgasaddr, asset, transcount);
      let data2 = await NNSSell.rechargeReg(transcount.toFixed(8));
      let res = await Https.rechargeandtransfer(data1.data, data2);
      if (res['errCode'] == '0000') {
        let txid = res['txid'];
        return txid;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * 注册器充值
   * @param amount 充值金额
   */
  static async rechargeReg(amount: string) {
    const root = await NNS.getRoot() as RootDomainInfo
    var v = 1;
    for (var i = 0; i < 8; i++)
      v *= 10;
    var bnum = new Neo.BigInteger(amount.replace(".", ""));
    var intv = bnum.multiply(v).toString();

    let addressto = Helper.Account.GetAddressFromScriptHash(root.register);

    let sb = new ThinNeo.ScriptBuilder()

    sb.EmitParamJson([
      "(addr)" + Wallet.account.address,//from
      "(addr)" + addressto,//to
      "(int)" + intv//value
    ]);//参数倒序入
    sb.EmitPushString("transfer");//参数倒序入
    sb.EmitAppCall(DAPP_SGAS);//nep5脚本

    ////这个方法是为了在同一笔交易中转账并充值
    ////当然你也可以分为两笔交易
    ////插入下述两条语句，能得到txid
    sb.EmitSysCall("System.ExecutionEngine.GetScriptContainer");
    sb.EmitSysCall("Neo.Transaction.GetHash");
    //把TXID包进Array里
    sb.EmitPushNumber(Neo.BigInteger.fromString("1"));
    sb.Emit(ThinNeo.OpCode.PACK);
    sb.EmitPushString("setmoneyin");
    sb.EmitAppCall(root.register);
    let script = sb.ToArray();
    let res = await Transfer.contractInvoke_attributes(script)
    // // console.log(res);
    return res;
  }

  /**
   * 欲购买
   */
  static async wantbuy(subname: string, prikey: string) {
    try {
      const root = await NNS.getRoot() as RootDomainInfo
      let who = new Neo.Uint160(Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address).buffer);
      console.log(who)
      console.log('subname =' + subname)

      let param = [
        '(hex160)' + who.toString(),
        "(hex256)" + root.roothash.toString(),
        "(str)" + subname
      ];
      let data = Common.buildScript(root.register, "wantBuy", param);
      let res = await Transfer.contractInvoke_attributes(data);
      return res
    } catch (error) {
      throw error;
    }

  }

  /**
   * 竞标加价
   * @param domain 域名
   */
  static async addprice(domain: string, amount: number, prikey: string) {
    const root = await NNS.getRoot() as RootDomainInfo
    let info = await this.getSellingStateByDomain(domain);
    let who = new Neo.Uint160(
      Helper.Account.GetPublicKeyScriptHash_FromAddress
        (
        Wallet.account.address
        ).buffer
    );

    let data = Common.buildScript(
      root.register,
      "addPrice",
      ["(hex160)" + who.toString(), "(hex256)" + info.id.toString(), "(int)" + amount]
    );
    let res = await Transfer.contractInvoke_attributes(data);
    return res;
  }

  /**
    * 
    * @param time 
    * @returns state(0:正在竞拍，1:随机时间,2:竞拍结束)
    */
  static compareTime(time: number) {
    let currentTime = new Date().getTime();
    let res = currentTime - time
    let state: number = res > 1500000 ? 0 : res < 900000 ? 1 : 2;
    return state;
  }


  /**
   * 结束竞拍
   * @param domain 域名
   */
  static async endSelling(id: string) {
    const root = await NNS.getRoot() as RootDomainInfo
    let who = new Neo.Uint160(Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address).buffer);
    let script = Common.buildScript(
      root.register,
      "endSelling",
      [
        "(hex160)" + who.toString(),
        "(hex256)" + id
      ]
    );

    let res = Common.buildInvokeTransData_attributes(script);
    return res;
  }

  /**
   * 获得领取域名
   * @param domain 域名
   */
  static async getsellingdomain(id: string) {
    const root = await NNS.getRoot() as RootDomainInfo
    let who = new Neo.Uint160(Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address).buffer);
    let script = Common.buildScript(
      root.register,
      "getSellingDomain",
      [
        "(hex160)" + who.toString(),
        "(hex256)" + id
      ]
    );
    let res = Common.buildInvokeTransData_attributes(script);
    return res;
  }

  static async getMySellingDomain(domain) {
    const root = await NNS.getRoot() as RootDomainInfo
    let info = await NNSSell.getSellingStateByDomain(domain);
    if (info.endBlock.compareTo(Neo.BigInteger.Zero)) {
      let data1 = NNSSell.endSelling(domain);
    }
    let who = new Neo.Uint160(Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address).buffer);
    let script = Common.buildScript(
      root.register,
      "getSellingDomain",
      [
        "(hex160)" + who.toString(),
        "(hex256)" + info.id.toString()
      ]
    );
    let res = Common.contractInvokeTrans_attributes(script);
    return res;
  }

  static async getBalanceOf() {
    const root = await NNS.getRoot() as RootDomainInfo
    let who = new Neo.Uint160(Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address).buffer);
    let info = await Common.contractInvokeScript(
      root.register, "balanceOf", "(hex160)" + who.toString()
    );

    var stackarr = info["stack"] as any[];
    let stack = ResultItem.FromJson(DataType.Array, stackarr);
    let num = stack.subItem[0].AsInteger();
    let res = parseFloat(num.toString()) / 100000000;
    // let res = num.divide(100000000).toString();
    // new Neo.Fixed8(num)
    // let number = (Neo.Fixed8.parse(num.toString()).getData().toNumber()) / 100000000;
    // // console.log(res);
    return res.toString();
  }

  /**
   * 取回存储器下的sgas
   */
  static async getMoneyBack(amount: number) {
    const root = await NNS.getRoot() as RootDomainInfo
    let transcount = amount.toFixed(8).replace(".", "");
    let data = Common.buildScript(
      root.register,
      "getmoneyback",
      ["(addr)" + Wallet.account.address, "(int)" + transcount]
    )
    let res = await Common.contractInvokeTrans_attributes(data)
    return res;
  }

  /**
  * 判断域名状态
  * @param info 域名详情
  */
  static async getMyAuctionState(info: SellDomainInfo): Promise<MyAuction> {
    let myauction = new MyAuction();
    if (!info.id) {
      console.log("---------------id 为空----------------");
      console.log(myauction);
      return myauction;
    }
    myauction.id = info.id.toString();
    myauction.domain = info.domain;
    myauction.endBlock = parseInt(info.endBlock.toString());
    myauction.maxBuyer = !info.maxBuyer ? "" : Helper.Account.GetAddressFromScriptHash(info.maxBuyer);
    myauction.maxPrice = !info.maxPrice ? "" : accDiv(info.maxPrice.toString(), 100000000).toString();
    myauction.owner = info.owner ? Helper.Account.GetAddressFromScriptHash(info.owner) : "";
    let startTime = await Https.api_getBlockInfo(parseInt(info.startBlockSelling.toString()));
    myauction.startAuctionTime = startTime * 1000;
    myauction.startTimeStr = formatTime(startTime, 'Y/M/D h:m:s');

    //是否开始域名竞拍 0:未开始竞拍
    let sellstate = (info.startBlockSelling.compareTo(Neo.BigInteger.Zero));
    if (sellstate == 0) {
      myauction.domainstate = DomainState.open;
      return myauction;
    }
    //根据开标的区块高度获得开标的时间
    let currentTime = new Date().getTime();
    let dtime = currentTime - startTime * 1000; //时间差值;
    //如果超过随机期
    if (dtime > 109500000)
      myauction.expire = true;
    else
      myauction.expire = false;
    if (dtime > 900000) {   //最大金额为0，无人加价，流拍数据，或者域名到期，都可以重新开标
      if (info.maxPrice.compareTo(Neo.BigInteger.Zero) == 0) {
        myauction.domainstate = DomainState.pass;
        return myauction;
      }

      //先判断最后出价时间是否大于第三天
      let lastTime = await Https.api_getBlockInfo(parseInt(info.lastBlock.toString()));
      let dlast = lastTime - startTime;
      if (dlast < 600)    //最后一次出价时间是在开标后两天内 也就是第三天 无出价且开标时间大于三天 状态为结束
      {
        myauction.domainstate = DomainState.end2;
        myauction.endTime = accAdd(accMul(startTime, 1000), 900000);
        myauction.auctionState = "0";
        return myauction;
      }

      //判断是否已有结束竞拍的区块高度。如果结束区块大于零则状态为结束
      if (info.endBlock.compareTo(Neo.BigInteger.Zero) > 0) {
        let time = await Https.api_getBlockInfo(parseInt(info.endBlock.toString()));
        let subtime = time - startTime;
        myauction.endTime = subtime < 1500 ? accMul(time, 1000) : accAdd(accMul(startTime, 1000), 1500000);
        myauction.domainstate = DomainState.end1;
        myauction.auctionState = "0";
        return myauction;
      }
      if (dtime < 1500000)    //当前时间小于开标后五天且第三天有出价 状态为随机期
      {
        myauction.domainstate = DomainState.random;
        myauction.auctionState = "2";
        return myauction;
      } else {
        myauction.domainstate = DomainState.end1;
        myauction.endTime = accAdd(accMul(startTime, 1000), 1500000);
        myauction.auctionState = "0";
        return myauction;
      }
    } else {
      myauction.domainstate = DomainState.fixed;
      myauction.auctionState = "1";
      return myauction;
    }
  }
}