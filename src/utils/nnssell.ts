import { Domainmsg, DomainInfo, SellDomainInfo, NNSResult, ResultItem, DataType } from "./entity";
import { Neo, Helper, ThinNeo } from "../lib/neo-ts/index";
import Common from "./common";
import NNS from './nns'
import Https from "./Https";
import Wallet from "./wallet";
import { DAPP_SGAS } from "./const";
import Transfer from "./transaction";
export default class NNSSell {
    
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
        let info = new SellDomainInfo();
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
    }

    /**
     * 注册器充值
     * @param amount 充值金额
     */
    static async rechargeReg(amount: string, prikey: string) {

        var v = 1;
        for (var i = 0; i < 8; i++)
            v *= 10;
        var bnum = new Neo.BigInteger(amount.replace(".", ""));
        var intv = bnum.multiply(v).toString();

        let addressto = Helper.Account.GetAddressFromScriptHash(NNS.root.register);

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
        sb.EmitAppCall(NNS.root.register);
        let script = sb.ToArray();
        let res = await Transfer.contractInvoke_attributes(script, prikey)
        // console.log(res);
        return res;
    }

    /**
     * 欲购买
     */
    static async wantbuy(subname: string, prikey: string) {
        try {
            let who = new Neo.Uint160(Helper.Account.GetPublicKeyScriptHash_FromAddress(Wallet.account.address).buffer);
            let param = [
                '(hex160)' + who.toString(),
                "(hex256)" + NNS.root.roothash.toString(),
                "(str)" + subname
            ];
            let data = Common.buildScript(NNS.root.register, "wantBuy", param);
            let res = await Transfer.contractInvoke_attributes(data, prikey);
            return res
        } catch (error) {
            throw error;
        }

    }

    /**
     * 竞标加价
     * @param domain 域名
     */
    static async addprice(domain: string, amount: number,prikey:string) {

        let info = await this.getSellingStateByDomain(domain);
        let who = new Neo.Uint160(
            Helper.Account.GetPublicKeyScriptHash_FromAddress
                (
                Wallet.account.address
                ).buffer
        );

        let data = Common.buildScript(
            NNS.root.register,
            "addPrice",
            ["(hex160)" + who.toString(), "(hex256)" + info.id.toString(), "(int)" + amount]
        );
        let res = await Transfer.contractInvoke_attributes(data,prikey);
        return res;
    }

    /**
     * 取回存储器下的sgas
     */
    getMoneyBack() {

    }

    /**
     * 
     */
    getsellingdomain() {

    }
}