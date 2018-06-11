import { DomainInfo, Consts, RootDomainInfo, DomainStatus, Domainmsg,DataType, NNSResult,ResultItem } from './entity';
import { ThinNeo, Helper, Neo } from '../lib/neo-ts/index'
import Https from "./Https";
import Coin from './coin';
import Wallet from './wallet';
import Transfer from './transaction';
import { Account } from '../lib/neo-ts/Helper/index';
import Common from './common';

/**
 * @name NEONameServiceTool
 * @method initRootDomain_初始化根域名信息
 */
export default class NNS {
    static root_test: RootDomainInfo;

    /**
     * 校验域名
     */
    static async  verifyDomain(domain: string) {
        domain = domain.toLowerCase().trim();

        let verify = /^[a-zA-Z0-9]{1,32}$/;
        if (verify.test(domain)) {
            let domains = await NNS.queryDomainInfo(domain + ".test")
            if (domains.register && domains.ttl) {
                var timestamp = new Date().getTime();
                console.log(timestamp);
                console.log(domains.register.toString());
                console.log(domains.resolver.toString());

                let copare = new Neo.BigInteger(timestamp).compareTo(new Neo.BigInteger(domains.ttl).multiply(1000));
                if (copare < 0) {
                    console.log('域名已到期');
                } else {
                    // mui.toast("The current domain name is registered : ");
                }
            } else {
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
        test.roothash = Common.nameHash("test");
        test.rootname = "test";

        var domain = await NNS.getOwnerInfo(test.roothash, Consts.baseContract);


        console.log('initRootDomain:');

        console.log(domain);

        test.owner = domain.owner;
        test.register = domain.register;
        test.resolver = domain.resolver;
        test.ttl = domain.ttl;
        NNS.root_test = test;
    }


    /**
     * 注册域名
     * @param domain 域名
     */
    static async nnsRegister(domain: string) {
        // NNS.verifyDomain(domain);
        if (domain) {
            try {
                let res = await NNS.registerDomain(domain);
                if (res.err) {
                    console.error(res.info);
                } else {
                    let state = new DomainStatus();
                    state.await_register = true;
                    state.domainname = domain + ".test";
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

        let arrdomain = res ? res.map(dom => { return dom + ".test" }) : [];
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
    static async queryDomainInfo(doamin: string) {
        var domainarr: string[] = doamin.split('.');
        var subdomain: string = domainarr[0];
        var nnshash: Neo.Uint256 = Common.nameHashArray(domainarr);
        let doamininfo = await NNS.getOwnerInfo(nnshash, Consts.baseContract);
        console.log(doamininfo);
        // var owner = Helper.toHexString(doamininfo.owner);
        return doamininfo;
    }

    /**
     * 通过域名哈希查询地址
     * @param domain 域名哈希
     * @param scriptaddress 合约地址
     */
    static async getOwnerInfo(domain: Neo.Uint256, appcall: Neo.Uint160): Promise<DomainInfo> {
        console.log(appcall);
        
        let info: DomainInfo = new DomainInfo();
        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson(["(hex256)" + domain.toString()]);//第二个参数是个数组
        sb.EmitPushString("getOwnerInfo");
        sb.EmitAppCall(appcall);
        var data = sb.ToArray();

        let result = await Https.rpc_getInvokescript(data);
        try {
            var state = result.state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK")) {
                // info2.textContent += "Succ\n";
            }
            var stackarr = result["stack"] as any[];
            if (stackarr[0].type == "Array") {
                var stack = stackarr[0].value as any[];
                if (stack[0].type == "ByteArray") {
                    info.owner =  Neo.Uint160.parse(stack[0].value as string);
                }
                if (stack[1].type == "ByteArray") {
                    info.register = Neo.Uint256.parse(stack[1].value as string);
                }
                if (stack[2].type == "ByteArray") {
                    info.resolver = Neo.Uint256.parse(stack[2].value as string);
                }
                if (stack[3].type == "Integer") {
                    info.ttl = new Neo.BigInteger(stack[3].value as string).toString();

                } if (stack[3].type = "ByteArray") {
                    let bt = Helper.hexToBytes(stack[3].value as string);
                    info.ttl = Neo.BigInteger.fromUint8ArrayAutoSign(Helper.clone(bt)).toString();
                } if (stack[4].type = "ByteArray") {
                    let parentOwner = Helper.hexToBytes(stack[5].value as string);
                } if (stack[5].type = "String") {
                    let domainstr = stack[5].value as string;
                } if (stack[6].type = "ByteArray") {
                    let parentHash = Helper.hexToBytes(stack[6].value as string);
                } if (stack[7].type = "ByteArray") {
                    let bt = Helper.hexToBytes(stack[7].value as string);
                    let root = Neo.BigInteger.fromUint8ArrayAutoSign(bt);
                }
                if (stack[7].type = "Integer") {
                    let a = new Neo.BigInteger(stack[7].value as string);
                }
            }
        }
        catch (e) {
        }
        // console.log(info);
        return info;
    }

    /**
     * 注册域名
     * @param doamin 域名字符串
     */
    static async registerDomain(doamin: string) {
        var nnshash: Neo.Uint256 = Common.nameHash(NNS.root_test.rootname);
        var address = Wallet.account.address;
        var sb = new ThinNeo.ScriptBuilder();
        var scriptaddress = NNS.root_test.register;

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
                let rest =new NNSResult();
                rest.textInfo = res;
                console.log('..');
                console.log(stack);
                
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