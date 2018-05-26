import { DomainInfo, Consts, RootDomainInfo, DomainStatus, Domainmsg } from './entity';
import { ThinNeo, Helper, Neo } from '../lib/neo-ts/index'
import Https from "./Https";
import Coin from './coin';
import Wallet from './wallet';
import Transfer from './transaction';

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
        test.roothash = NNS.nameHash("test");
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
                console.log('====================');

                console.log(res);
                console.log('=======================');

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
        // let rootdomain: string = domainarr.pop();    //返回根域名并删除
        var nnshash: Uint8Array = NNS.nameHashArray(domainarr);
        // let address = await NNSTool.getSubOwner(nnshash, subdomain, NNSTool.root_test.register);
        let doamininfo = await NNS.getOwnerInfo(nnshash, Helper.hexToBytes(Consts.baseContract).reverse());

        // let info = await NNSTool.getNameInfo(nnshash)
        var owner = Helper.toHexString(doamininfo.owner);
        // return address;
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
        var nnshash: Uint8Array = NNS.nameHash(NNS.root_test.rootname);
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


    /**
     * @method 返回根域名名称
     */
    static async getRootName(): Promise<string> {

        let name: string = "";

        var sb = new ThinNeo.ScriptBuilder();

        sb.EmitParamJson(JSON.parse("[]"));
        sb.EmitPushString("rootName");
        var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await Https.rpc_getInvokescript(data);
        try {
            var state = result.state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK")) {
                // info2.textContent += "Succ\n";
            }
            var stack = result.stack as any[];
            //find name 他的type 有可能是string 或者ByteArray
            if (stack[0].type == "Array") {
                // info2.textContent += "name=" + stack[0].value + "\n";
                length = stack[0].lenght;
            }
            else if (stack[0].type == "ByteArray") {
                var bs = Helper.hexToBytes(stack[0].value as string);
                name = Helper.Account.Bytes2String(bs);
            }

            return name;
        }
        catch (e) {
            return e.message;
        }
    }

    /**
     * @method 返回根域名hash
     */
    static async getRootNameHash(): Promise<Uint8Array> {

        let nameHash: Uint8Array;

        var sb = new ThinNeo.ScriptBuilder();

        sb.EmitParamJson(JSON.parse("[]"));
        sb.EmitPushString("rootNameHash");
        var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await Https.rpc_getInvokescript(data);
        try {
            var state = result["state"] as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK")) {
                // info2.textContent += "Succ\n";
            }
            var stack = result["stack"] as any[];
            //find name 他的type 有可能是string 或者ByteArray
            if (stack[0].type == "ByteArray") {
                nameHash = Helper.hexToBytes(stack[0]["value"] as string);

            }
            return nameHash;
        }
        catch (e) {
            return e.message;
        }
    }

    //返回域名hash
    static async getNameHash(domain: string): Promise<Uint8Array> {
        let namehash: Uint8Array
        var domainarr: string[] = domain.split('.');
        var subdomain: string = domainarr[0];
        var root: string = await NNS.getRootName();
        domainarr.shift();
        domainarr.push(root)
        var nnshash: Uint8Array = NNS.nameHashArray(domainarr);

        return nnshash;
    }

    //计算子域名hash
    static async getNameHashSub(domainhash: Uint8Array, subdomain: string) { }

    //nanmeHashArray
    static async getNameHashArray(nameArray: string[]) { }

    /**
    * 生成解析器
    * @param protocol 
    * @param nnshash 
    * @param scriptaddress 
    */
    static async resolve(): Promise<Uint8Array> {
        let domainname = 'yy.test';
        let arr = domainname.split('.');
        let nnshash: Uint8Array = NNS.nameHashArray(arr);
        let contractaddr = "0xabb0f1f3f035dd7ad80ca805fce58d62c517cc6b";
        let resolverhash = Helper.hexToBytes(contractaddr).reverse();

        let namehash: Uint8Array
        var sb = new ThinNeo.ScriptBuilder();
        let hash = Helper.Account.GetPublicKeyScriptHashFromPublicKey(Helper.hexToBytes(Wallet.account.publickey));
        let hashstr = Helper.toHexString(hash.reverse());
        let nnshashstr = Helper.toHexString(nnshash.reverse());
        let resolvestr = Helper.toHexString(resolverhash.reverse());
        var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();

        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson([
            "(hex160)0x" + hashstr,
            "(hex256)0x" + nnshashstr,
            "(hex160)0x" + resolvestr]);//第二个参数是个数组
        sb.EmitPushString("owner_SetResolver");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();
        // console.log(data.toHexString())
        // let res = await Transfer.contractInvokeTrans(data);
        return;
    }


    //解析域名完整模式
    static async resolveFull(protocol: string, nameArray: string[]) { }

    /**
     * 获得所有者
     * @param nnshash 根域名hash
     * @param subdomain 二级域名
     * @param scriptaddress scriptaddress
     */
    static async getSubOwner(nnshash: Uint8Array, subdomain: string, scriptaddress: Uint8Array): Promise<string> {
        let owner: string = "";
        var sb = new ThinNeo.ScriptBuilder();
        //var scriptaddress = Consts.registerContract.hexToBytes().reverse();
        sb.EmitParamJson(["(bytes)" + Helper.toHexString(nnshash), "(str)" + subdomain]);//第二个参数是个数组
        sb.EmitPushString("getSubOwner");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await Https.rpc_getInvokescript(data);

        try {
            var state = result.state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK")) {
                // info2.textContent += "Succ\n";
                var stack = result.stack as any[];
                //find name 他的type 有可能是string 或者ByteArray
                if (stack[0].type == "ByteArray") {
                    if (stack[0].value as string != "00") {
                        owner = Helper.Account.GetAddressFromScriptHash(Helper.hexToBytes((stack[0].value as string)));
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
        }
        return owner;
    }

    /**
     * 此接口为演示的先到先得注册器使用，用户调用注册器的这个接口申请域名
     * @param who         注册人的地址
     * @param nnshash     域名中除最后一位的hash : aa.bb.cc 中的 bb.cc的hash
     * @param subdomain   域名中的最后一位: aa.bb.cc 中的 aa
     */
    static async requestSubDomain(who: string, nnshash: Uint8Array, subdomain: string): Promise<any> {

        let namehash: Uint8Array
        var sb = new ThinNeo.ScriptBuilder();
        var scriptaddress = Helper.hexToBytes(Consts.registerContract).reverse();
        sb.EmitParamJson(["(bytes)" + Helper.toHexString(nnshash), "(str)" + subdomain]);//第二个参数是个数组
        sb.EmitPushString("getSubOwner");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await Https.rpc_getInvokescript(data);

        try {
            var state = result[0].state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK")) {
                // info2.textContent += "Succ\n";
            }
            var stack = result[0].stack as any[];
            //find name 他的type 有可能是string 或者ByteArray
            if (stack[0].type == "ByteArray") {
                namehash = Helper.hexToBytes((stack[0].value as string));
            }
        }
        catch (e) {
            console.log(e);
        }
        return;
    }

    //#region 域名转hash算法
    //域名转hash算法
    //aaa.bb.test =>{"test","bb","aa"}
    /**
     * 域名转hash
     * @param domain 域名
     */
    static nameHash(domain: string): Uint8Array {
        var domain_bytes = Helper.Account.String2Bytes(domain);
        var hashd = Neo.Cryptography.Sha256.computeHash(domain_bytes);
        var namehash = new Uint8Array(hashd);
        return Helper.clone(namehash);
    }

    /**
     * 子域名转hash
     * @param roothash  根域名hash
     * @param subdomain 子域名
     */
    static nameHashSub(roothash: Uint8Array, subdomain: string): Uint8Array {
        var bs: Uint8Array = Helper.Account.String2Bytes(subdomain);
        if (bs.length == 0)
            return roothash;

        var domain = Neo.Cryptography.Sha256.computeHash(bs);
        var domain_bytes = new Uint8Array(domain);
        var domainUint8arry = Helper.concat(domain_bytes, roothash);

        var sub = Neo.Cryptography.Sha256.computeHash(domainUint8arry);
        var sub_bytes = new Uint8Array(sub);
        return Helper.clone(sub_bytes);
    }

    /**
     * 返回一组域名的最终hash
     * @param domainarray 域名倒叙的数组
     */
    static nameHashArray(domainarray: string[]): Uint8Array {
        domainarray.reverse();
        var hash: Uint8Array = NNS.nameHash(domainarray[0]);
        for (var i = 1; i < domainarray.length; i++) {
            hash = NNS.nameHashSub(hash, domainarray[i]);
        }
        return hash;
    }

    /**
     * 
     * @param owner 拥有者
     * @param nnshash 域名hash
     * @param subdomain 子域名
     * @param protocol 解析器类型
     * @param data 解析地址
     */
    static async setResolveData(nnshash: Uint8Array, str: string) {
        let namehash: Uint8Array
        let pubkey = Helper.hexToBytes(Wallet.account.publickey);
        let hash = Helper.Account.GetPublicKeyScriptHashFromPublicKey(pubkey);
        let hashstr = Helper.toHexString(hash.reverse());
        let nnshashstr = Helper.toHexString(nnshash.reverse());
        var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();

        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson([
            "(hex160)0x" + hashstr,
            "(hex256)0x" + nnshashstr,
            "(str)1",
            "(str)addr",
            "(str)" + str
        ]);
        sb.EmitPushString("resolve");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();
        // console.log(data.toHexString())
        // let res = await Transfer.contractInvokeTrans(data);
        return;
    }
    static async resolveData(domain: string, resolver: Uint8Array) {
        let arr = domain.split(".");
        let nnshash = NNS.nameHashArray(arr);
        var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();
        let nnshashstr = Helper.toHexString(nnshash.reverse());

        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson([
            "(str)addr",
            "(hex256)" + nnshashstr,
            "(str)1"
        ]);
        sb.EmitPushString("resolve");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();
        let res = await Https.rpc_getInvokescript(data);
        return res;
    }


    static async gas2Sgas() {

    }
}
