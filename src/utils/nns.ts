import { DomainInfo, Consts, RootDomainInfo, DomainStatus, Domainmsg, DataType, NNSResult, ResultItem, DomainState } from './entity';
import { ThinNeo, Helper, Neo } from '../lib/neo-ts/index'
import Https from "./Https";
import Coin from './coin';
import Wallet from './wallet';
import Transfer from './transaction';
import { Account } from '../lib/neo-ts/Helper/index';
import Common from './common';
import { DOMAIN_ROOT } from './const';

/**
 * @name NEONameServiceTool
 * @method initRootDomain_初始化根域名信息
 */
export default class NNS {
    static root: RootDomainInfo;

    /**
     * 域名查询及校验
     * @param domain 二级域名
     */
    static async  verifyDomain(domain: string):Promise<DomainInfo> {
        domain = domain.toLowerCase().trim();

        let verify = /^[a-zA-Z0-9]{1,32}$/;
        if (verify.test(domain)) {
            let doamininfo: DomainInfo = await NNS.queryDomainInfo(domain + "." + DOMAIN_ROOT)
            console.log(doamininfo)
            if (doamininfo.register !== null && doamininfo.ttl !== null) {
                var timestamp = new Date().getTime();
                console.log(timestamp);
                // console.log(domains.register.toString());
                // console.log(domains.resolver.toString());

                let copare = new Neo.BigInteger(timestamp).compareTo(new Neo.BigInteger(doamininfo.ttl).multiply(1000));
                if (copare < 0) {
                    console.log('域名已到期');
                    doamininfo.status = DomainState.Avaliable;
                } else {
                    doamininfo.status = DomainState.Taken;
                }
            } else {
                doamininfo.status = DomainState.Avaliable;
            }
        } else {
            return;
        }
    }

    /**
     * @method 初始化根域名信息
     */
    static async initRootDomain() {
        var test = new RootDomainInfo();
        test.roothash = Common.nameHash(DOMAIN_ROOT);
        test.rootname = DOMAIN_ROOT;

        var domain = await NNS.getOwnerInfo(test.roothash, Consts.baseContract);
        console.log('initRootDomain:');
        console.log(domain);
        test.owner = domain.owner;
        test.register = domain.register;
        test.resolver = domain.resolver;
        test.ttl = domain.ttl;
        NNS.root = test;
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
                console.log(error);
                // mui.alert(error.message);
            }
        }
    }

    /**
     * 获得域名列表
     */
    static async getDomainsByAddr() {
        console.log(Wallet.account.address);

        let res = await Https.getnnsinfo(Wallet.account.address);
        console.log(res);

        let arrdomain = res ? res.map(dom => { return dom + "." + DOMAIN_ROOT }) : [];
        let arr = new Array<Domainmsg>();
        let state = DomainStatus.getStatus() as DomainStatus;
        // state = JSON.parse(JSON.stringify(state));
        if (state) {
            for (let key in state) {
                if (state.hasOwnProperty(key)) {
                    let inculde = arrdomain.includes(key);
                    inculde ? "" : arrdomain.push(key);
                }
            }
        }
        for (const i in arrdomain) {
            if (arrdomain.hasOwnProperty(i)) {
                const n = parseInt(i)
                const domain = arrdomain[n];
                let a = state[domain] ? state[domain] as DomainStatus : new DomainStatus();
                let msg = await NNS.queryDomainInfo(domain);
            }
        }
    }

    /**
     * @method 查询域名信息
     * @param doamin 域名字符串
     */
    static async queryDomainInfo(doamin: string): Promise<DomainInfo> {
        var domainarr: string[] = doamin.split('.');
        var subdomain: string = domainarr[0];
        var nnshash: Neo.Uint256 = Common.nameHashArray(domainarr);
        let doamininfo: DomainInfo = await NNS.getOwnerInfo(nnshash, Consts.baseContract);
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
            console.log(stackarr)
            let stack = ResultItem.FromJson(DataType.Array, stackarr).subItem[0].subItem;
            console.log(stack)
            if (stackarr[0].type == "Array") {
                info.owner = (stack[0].AsHash160() === null) ? null : stack[0].AsHash160();
                info.register = (stack[1].AsHash160() === null) ? null : stack[1].AsHash160();
                info.resolver = (stack[2].AsHash160() === null) ? null : stack[2].AsHash160();
                info.ttl = (stack[3].AsHash160() === null) ? null : stack[3].AsHash160().toString();
            }
        }
        catch (e) {
            console.error(e);
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
        var scriptaddress = NNS.root.register;

        sb.EmitParamJson(["(addr)" + address, "(hex256)" + nnshash.toString(), "(str)" + doamin]);//第二个参数是个数组
        sb.EmitPushString("requestSubDomain");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();
        var res = await Transfer.contractInvoke_attributes(data, prikey);
        if (!res.err) {
            // WWW.setnnsinfo(address,doamin,);
        }
        return res;
    }

    static async resolveData(domain: string) {
        var scriptaddress = Consts.baseContract;
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
                console.log(rest)
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
            console.log(e);
            ret = { state: false };
        }
        return ret;
    }

}