import { DomainInfo, Consts, RootDomainInfo, DomainStatus, Domainmsg } from './entity';
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
                console.log(Helper.toHexString(domains.register));
                console.log(Helper.toHexString(domains.resolver));



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
        var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();
        var domain = await NNS.getOwnerInfo(test.roothash, scriptaddress);
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
        NNS.verifyDomain(domain);
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
                    // this.btn_register = true;
                }
            } catch (error) {
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
        var nnshash: Uint8Array = Common.nameHashArray(domainarr);
        let doamininfo = await NNS.getOwnerInfo(nnshash, Helper.hexToBytes(Consts.baseContract).reverse());
        console.log(DomainInfo);
        console.log('....................................');

        var owner = Helper.toHexString(doamininfo.owner);
        return doamininfo;
    }

    /**
     * 通过域名哈希查询地址
     * @param domain 域名哈希
     * @param scriptaddress 合约地址
     */
    static async getOwnerInfo(domain: Uint8Array, scriptaddress: Uint8Array): Promise<DomainInfo> {
        let info: DomainInfo = new DomainInfo();
        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson(["(bytes)" + Helper.toHexString(domain)]);//第二个参数是个数组
        sb.EmitPushString("getOwnerInfo");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await Https.rpc_getInvokescript(data);
        console.log('<><><><><><>><<<>><><><><');

        console.log(result);

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
                    info.owner = Helper.hexToBytes(stack[0].value as string);
                }
                if (stack[1].type == "ByteArray") {
                    info.register = Helper.hexToBytes(stack[1].value as string);
                }
                if (stack[2].type == "ByteArray") {
                    info.resolver = Helper.hexToBytes(stack[2].value as string);
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
        var nnshash: Uint8Array = Common.nameHash(NNS.root_test.rootname);
        var address = Wallet.account.address;
        var sb = new ThinNeo.ScriptBuilder();
        var scriptaddress = NNS.root_test.register;

        sb.EmitParamJson(["(addr)" + address, "(bytes)" + Helper.toHexString(nnshash), "(str)" + doamin]);//第二个参数是个数组
        sb.EmitPushString("requestSubDomain");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();
        var res = await Transfer.contractInvoke_attributes(data);
        console.log('========================');

        console.log(Helper.toHexString(res));

        console.log('==========================');

        if (!res.err) {
            // WWW.setnnsinfo(address,doamin,);
        }
        return res;
    }




    static async resolveData(domain: string) {
        var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();
        let arr = domain.split(".");
        let nnshash = Common.nameHashArray(arr);
        let nnshashstr = Helper.toHexString(nnshash.reverse());

        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson([
            "(str)addr",
            "(hex256)0x" + nnshashstr,
            "(str)1"
        ]);
        sb.EmitPushString("resolve");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();
        let res = await Https.rpc_getInvokescript(data);
        console.log('====================,,,,,,,,,,,,,,,,,,,');
        console.log(res);
        console.log('................................,,,,,,,,,,,,,,,,');
        let ret = {}
        try {
            var state = res.state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK")) {
                // info2.textContent += "Succ\n";
                var stack = res.stack as any[];
                //find name 他的type 有可能是string 或者ByteArray
                if (stack[0].type == "ByteArray") {
                    if (stack[0].value as string != "00") {
                        let value = Helper.hexToBytes(stack[0].value as string);
                        let addr = Account.Bytes2String(value);
                        console.log('././././././././././');

                        console.log('hhhhhhhhhh' + addr);
                        console.log('././././..//./.');
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
