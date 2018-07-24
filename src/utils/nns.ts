import { DomainInfo, RootDomainInfo, DomainStatus, Domainmsg, DataType, NNSResult, ResultItem, DomainState } from './entity';
import { ThinNeo, Helper, Neo } from '../lib/neo-ts/index'
import Https from "./Https";
import Wallet from './wallet';
import Transfer from './transaction';
import { Account } from '../lib/neo-ts/Helper/index';
import Common from './common';
import { DOMAIN_ROOT, DAPP_NNS } from './const';
/**
 * @name NEONameServiceTool
 * @method initRootDomain_初始化根域名信息
 */
export default class NNS {
    static root: RootDomainInfo = null;

    /**
     * 域名查询及校验
     * @param domain 二级域名
     */
    static async  verifyDomain(domain: string): Promise<DomainInfo> {
        if (domain.includes('.neo')) {
            domain = domain.substring(0, domain.length - 4);
        }
        console.log(domain);
        domain = domain.toLowerCase().trim();
        let verify = /^[a-zA-Z0-9]{1,32}$/;
        if (verify.test(domain)) {
            console.log(domain + '.' + DOMAIN_ROOT)
            let doamininfo: DomainInfo = await NNS.queryDomainInfo(domain + '.' + DOMAIN_ROOT);
            console.log(doamininfo)

            if (doamininfo.register !== null && doamininfo.ttl !== null) {
                var timestamp = new Date().getTime();
                let copare = new Neo.BigInteger(timestamp).compareTo(new Neo.BigInteger(doamininfo.ttl).multiply(1000));
                if (copare < 0) {
                    // console.log('域名已到期');
                    doamininfo.status = DomainState.Avaliable;
                } else {
                    doamininfo.status = DomainState.Taken;
                }
            } else {
                doamininfo.status = DomainState.Avaliable;
            }
            return doamininfo;
        } else {
            return null;
        }

        return null;
    }

    /**
     * @method 初始化根域名信息
     */
    static async initRootDomain() {
        var test = new RootDomainInfo();
        test.roothash = Common.nameHash(DOMAIN_ROOT);
        let domain = null;
        test.rootname = DOMAIN_ROOT;
        while (domain === null)
            domain = await NNS.getOwnerInfo(test.roothash, DAPP_NNS);
        test.owner = domain.owner;
        test.register = domain.register;
        test.resolver = domain.resolver;
        test.ttl = domain.ttl;
        NNS.root = test;
    }


    static async getRoot() {
        if (NNS.root === null) {
            await NNS.initRootDomain();
        }
        return NNS.root;
    }
    /**
     * 注册域名
     * @param domain 域名
     */
    static async nnsRegister(domain: string, prikey: string) {
        // NNS.verifyDomain(domain);
        if (domain) {
            try {
                let res = await NNS.registerDomain(domain, prikey);
                if (res.err) {
                    console.error(res.info);
                } else {
                    let state = new DomainStatus();
                    state.await_register = true;
                    state.domainname = domain + "." + DOMAIN_ROOT;
                    DomainStatus.setStatus(state);
                    NNS.getDomainsByAddr();
                }
            } catch (error) {
                // console.log(error);
                // mui.alert(error.message);
            }
        }
    }

    /**
     * 获得域名列表
     */
    static async getDomainsByAddr() {
        // console.log(Wallet.account.address);

        let res = await Https.getnnsinfo(Wallet.account.address);

    }

    /**
     * @method 查询域名信息
     * @param doamin 域名字符串
     */
    static async queryDomainInfo(doamin: string): Promise<DomainInfo> {
        var domainarr: string[] = doamin.split('.');
        var subdomain: string = domainarr[0];
        var nnshash: Neo.Uint256 = Common.nameHashArray(domainarr);
        let doamininfo: DomainInfo = await NNS.getOwnerInfo(nnshash, DAPP_NNS);
        console.log(doamininfo);
        // var owner = Helper.toHexString(doamininfo.owner);
        return doamininfo;
    }

    /**
     * 通过域名哈希查询地址
     * @param domain 域名哈希
     * @param scriptaddress 合约地址
     */
    //返回域名详情
    static async getOwnerInfo(domain: Neo.Uint256, scriptaddress: Neo.Uint160): Promise<DomainInfo> {
        let info: DomainInfo = new DomainInfo();
        var data = Common.buildScript(scriptaddress, "getOwnerInfo", ["(hex256)" + domain.toString()]);

        let result = await Https.rpc_getInvokescript(data);
        console.log(result)
        try {
            let rest = new NNSResult();
            rest.textInfo = result;
            var stackarr = result["stack"] as any[];
            let stack = ResultItem.FromJson(DataType.Array, stackarr).subItem[0].subItem;
            if (stackarr[0].type == "Array") {
                info.owner = (stack[0].AsHash160() === null) ? null : stack[0].AsHash160();
                if (stack[0].AsHash160() !== null)
                    info.address = Helper.Account.GetAddressFromScriptHash(info.owner);
                info.register = (stack[1].AsHash160() === null) ? null : stack[1].AsHash160();
                info.resolver = (stack[2].AsHash160() === null) ? null : stack[2].AsHash160();
                info.ttl = (stack[3].AsInteger() === null) ? null : stack[3].AsInteger().toString();
            }
        }
        catch (e) {
            console.error(e);
            return null;
        }
        return info;
    }

    /**
     * 注册域名
     * @param doamin 域名字符串
     */
    static async registerDomain(doamin: string, prikey: string) {
        var nnshash: Neo.Uint256 = Common.nameHash(NNS.root.rootname);
        var address = Wallet.account.address;
        var sb = new ThinNeo.ScriptBuilder();
        const root = await NNS.getRoot() as RootDomainInfo
        var scriptaddress = root.register;

        sb.EmitParamJson(["(addr)" + address, "(hex256)" + nnshash.toString(), "(str)" + doamin]);//第二个参数是个数组
        sb.EmitPushString("requestSubDomain");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();
        var res = await Transfer.contractInvoke_attributes(data);
        if (!res.err) {
            // WWW.setnnsinfo(address,doamin,);
        }
        return res;
    }

    static async resolveData(domain: string) {
        var scriptaddress = DAPP_NNS;
        let arr = domain.split(".");
        let nnshash: Neo.Uint256 = Common.nameHashArray(arr);

        var data = Common.buildScript(scriptaddress, "resolve",
            new Array("(str)addr",
                "(hex256)" + nnshash.toString(),
                "(str)1"))

        let res = await Https.rpc_getInvokescript(data);
        let ret = {}
        try {
            var state = res.state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK")) {
                // info2.textContent += "Succ\n";
                var stack = res.stack as any[];
                let rest = new NNSResult();
                rest.textInfo = res;

                rest.value = ResultItem.FromJson(DataType.Array, stack);
                // console.log(rest)
                //find name 他的type 有可能是string 或者ByteArray
                if (stack[0].type == DataType.ByteArray) {
                    if (stack[0].value as string != "00") {
                        let value = Helper.hexToBytes(stack[0].value as string);
                        let addr = Account.Bytes2String(value);
                        ret = { state: true, addr: addr };
                    }
                }
            }
        }
        catch (e) {
            // console.log(e);
            ret = { state: false };
        }
        return ret;
    }

}