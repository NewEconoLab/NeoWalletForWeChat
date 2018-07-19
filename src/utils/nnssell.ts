import { Domainmsg, DomainInfo, SellDomainInfo, NNSResult, ResultItem, DataType, Asset, MyAuction, RootDomainInfo } from "./entity";
import { Neo, Helper, ThinNeo } from "../lib/neo-ts/index";
import Common from "./common";
import NNS from './nns'
import Https from "./Https";
import Wallet from "./wallet";
import { DAPP_SGAS, DAPP_NNS, id_GAS } from "./const";
import Transfer from "./transaction";
import { getSecureRandom } from './random'
import { formatTime } from './time'
import Auction from "./auctioin";
export default class NNSSell {

    /**
     * 获得竞拍域名详情
     * @param domain 域名
     */
    /**
   * 获得竞拍域名详情
   * @param domain 域名
   */
    static async getSellingStateByDomain(domain: string) {
        // tools.nnstool.initRootDomain(domainarr.reverse[ 0 ]);
        var domainarr: string[] = domain.split('.');
        var nnshash: Neo.Uint256 = Common.nameHashArray(domainarr);
        let data = Common.buildScript(NNS.root.register, "getSellingStateByFullhash", ["(hex256)" + nnshash.toString()]);
        let result = await Https.rpc_getInvokescript(data);
        let domainInfo: DomainInfo = await NNS.getOwnerInfo(nnshash, DAPP_NNS);
        let info = new SellDomainInfo();
        info.copyDomainInfoToThis(domainInfo);
        try {
            var state = result.state as string;
            // info2.textContent = "";
            if (state.includes("FAULT, BREAK")) {
                throw "FAULT, BREAK";
            }
            let rest = new NNSResult();
            rest.textInfo = result;
            var stackarr = result["stack"] as any[];
            let stack = ResultItem.FromJson(DataType.Array, stackarr).subItem[0].subItem
            info.id = stack[0].AsHash256();
            let parenthash = stack[1].AsHash256();
            let domain = stack[2].AsString();
            info.ttl = stack[3].AsInteger().toString();
            info.startBlockSelling = stack[4].AsInteger();
            info.endBlock = stack[5].AsInteger();
            info.maxPrice = stack[6].AsInteger();
            info.maxBuyer = stack[7].AsHash160();
            info.lastBlock = stack[8].AsInteger();

            return info;
        }
        catch (e) {
            console.error(e);
        }
        return null;
    }

    static async getBidList(): Promise<Array<MyAuction>> {
        //获得加价列表
        let res = await Https.api_getBidListByAddress(Wallet.account.address);
        console.log('bidlist:')
        console.log(res);
        if(res === null){
            return;
        }
        let arr = new Array<MyAuction>();
        //获得session列表
        let list = res ? res[0]["list"] as Array<MyAuction> : [];
        if (res) {
            for (let i in list) {
                const element = list[i];

                //获得当前账户该域名下的余额
                let balanceOfSelling = await Auction.getBalanceOfSeling(Neo.Uint256.parse(element.id.replace('0x', '')));
                element.receivedState = 0;
                //根据余额和所有者判断当前账户是否领取过了域名或退币
                if (element.auctionState == '0') {
                    if (element.maxBuyer == Wallet.account.address) {
                        element.receivedState = element.owner == Wallet.account.address ? 1 : 0
                    } else {
                        element.receivedState = balanceOfSelling.compareTo(Neo.BigInteger.Zero) == 0 ? 2 : 0;
                    }
                }
                //开始时间日期格式化
                element.startAuctionTime = formatTime(element.startAuctionTime, 'Y/M/D h:m:s'); // formatTime("yyyy/MM/dd hh:mm:ss", new Date(element.startAuctionTime * 1000));

                element.endedState = 0;
                element.auctionState = '3';
                element.maxBuyer = null;
                element.maxPrice = '0';
                let info = await NNSSell.getSellingStateByDomain(element.domain);
                if (info.startBlockSelling.compareTo(Neo.BigInteger.Zero) > 0) {
                    if (info.maxPrice.compareTo(Neo.BigInteger.Zero) > 0) {
                        element.maxBuyer = Helper.Account.GetAddressFromScriptHash(info.maxBuyer);
                        element.maxPrice = parseInt(info.maxPrice.toString()) + '00000000';
                    }
                    element.auctionState = '1';
                }
                arr.push(element);
            }
        }
        console.log('bidlist');
        console.log(arr)
        return arr
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
}