import { DomainInfo, Consts, RootDomainInfo } from './entity';
import { Https } from "./Https";
import { Coin } from './coin';
import {ThinNeo,Helper,Neo}from '../lib/neo-ts/index'

/**
 * @name NEONameServiceTool
 * @method initRootDomain_初始化根域名信息
 */
export class NNS
{
    static root_test: RootDomainInfo;

    /**
     * @method 初始化根域名信息
     */
    static async initRootDomain()
    {
        var test = new RootDomainInfo();
        test.roothash = NNS.nameHash("neo");
        test.rootname = "neo";
        var scriptaddress = Consts.baseContract.hexToBytes().reverse();
        var domain = await NNS.getDomainInfo(test.roothash, scriptaddress);
;
        test.owner = domain.owner;
        test.register = domain.register;
        test.resolver = domain.resolver;
        test.ttl = domain.ttl;
        NNS.root_test = test;
    }

    /**
     * @method 查询域名信息
     * @param doamin 域名字符串
     */
    static async queryDomainInfo(doamin: string)
    {
        var domainarr: string[] = doamin.split('.');
        var subdomain: string = domainarr[ 0 ];
        domainarr.shift();
        domainarr.push(this.root_test.rootname)
        var nnshash: Uint8Array = NNSTool.nameHashArray(domainarr);
        let address = await NNSTool.getSubOwner(nnshash, subdomain, NNSTool.root_test.register);
        let doamininfo = await NNSTool.getDomainInfo(nnshash, NNSTool.root_test.owner.reverse());
        return address;

    }

    /**
     * 注册域名
     * @param doamin 域名字符串
     */
    static async registerDomain(doamin: string)
    {
        var domainarr: string[] = doamin.split('.');
        var subdomain: string = domainarr[ 0 ];
        domainarr.shift();
        domainarr.push(NNSTool.root_test.rootname);
        var nnshash: Uint8Array = NNSTool.nameHashArray(domainarr);
        let domains = await NNSTool.getSubOwner(nnshash, subdomain, NNSTool.root_test.register);
        var sb = new ThinNeo.ScriptBuilder();
        var scriptaddress = NNSTool.root_test.register;
        sb.EmitPushNumber(new Neo.BigInteger(232323));
        sb.Emit(ThinNeo.OpCode.DROP);

        sb.EmitParamJson([ "(addr)" + LoginInfo.getCurrentAddress(), "(bytes)" + Helper.toHexString(nnshash), "(str)" + subdomain ]);//第二个参数是个数组
        sb.EmitPushString("requestSubDomain");//第一个参数
        sb.EmitAppCall(scriptaddress);  //资产合约
        var res = Coin.contractInvokeTrans(sb.ToArray());
        return res;
    }


    /**
     * @method 返回根域名名称
     */
    static async getRootName(): Promise<string>
    {

        let name: string = "";

        var sb = new ThinNeo.ScriptBuilder();

        sb.EmitParamJson(JSON.parse("[]"));
        sb.EmitPushString("rootName");
        var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await WWW.rpc_getInvokescript(data);
        try
        {
            var state = result.state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK"))
            {
                // info2.textContent += "Succ\n";
            }
            var stack = result.stack as any[];
            //find name 他的type 有可能是string 或者ByteArray
            if (stack[ 0 ].type == "Array")
            {
                // info2.textContent += "name=" + stack[0].value + "\n";
                length = stack[ 0 ].lenght;
            }
            else if (stack[ 0 ].type == "ByteArray")
            {
                var bs = Helper.hexToBytes(stack[ 0 ].value as string);
                name = Helper.Account.Bytes2String(bs);
            }

            return name;
        }
        catch (e)
        {
            return e.message;
        }
    }

    /**
     * @method 返回根域名hash
     */
    static async getRootNameHash(): Promise<Uint8Array>
    {

        let nameHash: Uint8Array;

        var sb = new ThinNeo.ScriptBuilder();

        sb.EmitParamJson(JSON.parse("[]"));
        sb.EmitPushString("rootNameHash");
        var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await WWW.rpc_getInvokescript(data);
        try
        {
            var state = result[ "state" ] as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK"))
            {
                // info2.textContent += "Succ\n";
            }
            var stack = result[ "stack" ] as any[];
            //find name 他的type 有可能是string 或者ByteArray
            if (stack[ 0 ].type == "ByteArray")
            {
                nameHash = (stack[ 0 ][ "value" ] as string).hexToBytes();

            }
            return nameHash;
        }
        catch (e)
        {
            return e.message;
        }
    }

    //返回域名详情
    static async getDomainInfo(domain: Uint8Array, scriptaddress: Uint8Array): Promise<DomainInfo>
    {
        let info: DomainInfo = new DomainInfo();
        var sb = new ThinNeo.ScriptBuilder();
        // var scriptaddress = Helper.hexToBytes(Consts.baseContract).reverse();
        sb.EmitParamJson([ "(bytes)" + Helper.toHexString(domain) ]);//第二个参数是个数组
        sb.EmitPushString("getOwnerInfo");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await WWW.rpc_getInvokescript(data);

        try
        {
            var state = result.state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK"))
            {
                // info2.textContent += "Succ\n";
            }
            var stackarr = result[ "stack" ] as any[];
            if (stackarr[ 0 ].type == "Array")
            {
                var stack = stackarr[ 0 ].value as any[];
                if (stack[ 0 ].type == "ByteArray")
                {
                    info.owner = Helper.hexToBytes((stack[ 0 ].value as string));
                }
                if (stack[ 1 ].type == "ByteArray")
                {
                    info.register = Helper.hexToBytes((stack[ 1 ].value as string));
                }
                if (stack[ 2 ].type == "ByteArray")
                {
                    info.resolver = Helper.hexToBytes((stack[ 2 ].value as string));
                }
                if (stack[ 3 ].type == "Integer")
                {
                    info.ttl = new Neo.BigInteger(stack[ 3 ].value as string);
                }
            }
        }
        catch (e)
        {
        }
        return info;
    }

    //返回域名hash
    static async getNameHash(domain: string): Promise<Uint8Array>
    {
        let namehash: Uint8Array
        var domainarr: string[] = domain.split('.');
        var subdomain: string = domainarr[ 0 ];
        var root: string = await NNSTool.getRootName();
        domainarr.shift();
        domainarr.push(root)
        var nnshash: Uint8Array = NNSTool.nameHashArray(domainarr);

        return nnshash;
    }

    //计算子域名hash
    static async getNameHashSub(domainhash: Uint8Array, subdomain: string) { }

    //nanmeHashArray
    static async getNameHashArray(nameArray: string[]) { }

    /**
     * 
     * @param protocol 
     * @param nnshash 
     * @param scriptaddress 
     */
    static async resolve(protocol: string, nnshash: Uint8Array, scriptaddress): Promise<Uint8Array>
    {
        let namehash: Uint8Array
        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson([ "(str)" + protocol, "(bytes)" + Helper.toHexString(nnshash) ]);//第二个参数是个数组
        sb.EmitPushString("resolve");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await WWW.rpc_getInvokescript(data);
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
    static async getSubOwner(nnshash: Uint8Array, subdomain: string, scriptaddress: Uint8Array): Promise<string>
    {
        let owner: string = "";
        var sb = new ThinNeo.ScriptBuilder();
        //var scriptaddress = Consts.registerContract.hexToBytes().reverse();
        sb.EmitParamJson([ "(bytes)" + Helper.toHexString(nnshash), "(str)" + subdomain ]);//第二个参数是个数组
        sb.EmitPushString("getSubOwner");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await WWW.rpc_getInvokescript(data);

        try
        {
            var state = result.state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK"))
            {
                // info2.textContent += "Succ\n";
                var stack = result.stack as any[];
                //find name 他的type 有可能是string 或者ByteArray
                if (stack[ 0 ].type == "ByteArray")
                {
                    if (stack[ 0 ].value as string != "00")
                    {
                        owner = Helper.Account.GetAddressFromScriptHash(Helper.hexToBytes((stack[ 0 ].value as string)));
                    }
                }
            }
        }
        catch (e)
        {
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
    static async requestSubDomain(who: string, nnshash: Uint8Array, subdomain: string): Promise<any>
    {

        let namehash: Uint8Array
        var sb = new ThinNeo.ScriptBuilder();
        var scriptaddress = Helper.hexToBytes(Consts.registerContract).reverse();
        sb.EmitParamJson([ "(bytes)" + Helper.toHexString(nnshash), "(str)" + subdomain ]);//第二个参数是个数组
        sb.EmitPushString("getSubOwner");
        sb.EmitAppCall(scriptaddress);
        var data = sb.ToArray();

        let result = await WWW.rpc_getInvokescript(data);

        try
        {
            var state = result[ 0 ].state as string;
            // info2.textContent = "";
            if (state.includes("HALT, BREAK"))
            {
                // info2.textContent += "Succ\n";
            }
            var stack = result[ 0 ].stack as any[];
            //find name 他的type 有可能是string 或者ByteArray
            if (stack[ 0 ].type == "ByteArray")
            {
                namehash = Helper.hexToBytes((stack[ 0 ].value as string));
            }
        }
        catch (e)
        {
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
    static nameHash(domain: string): Uint8Array
    {
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
    static nameHashSub(roothash: Uint8Array, subdomain: string): Uint8Array
    {
        var bs: Uint8Array = Helper.Account.String2Bytes(subdomain);
        if (bs.length == 0)
            return roothash;

        var domain = Neo.Cryptography.Sha256.computeHash(bs);
        var domain_bytes = new Uint8Array(domain);
        var domainUint8arry = domain_bytes.concat(roothash);

        var sub = Neo.Cryptography.Sha256.computeHash(domainUint8arry);
        var sub_bytes = new Uint8Array(sub);
        return Helper.clone(sub_bytes);
    }

    /**
     * 返回一组域名的最终hash
     * @param domainarray 域名倒叙的数组
     */
    static nameHashArray(domainarray: string[]): Uint8Array
    {
        domainarray.reverse();
        var hash: Uint8Array = NNSTool.nameHash(domainarray[ 0 ]);
        for (var i = 1; i < domainarray.length; i++)
        {
            hash = NNSTool.nameHashSub(hash, domainarray[ i ]);
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
    static async setResolveData(owner: string, nnshash: Uint8Array, subdomain: string | Neo.BigInteger, protocol: string, data: string): Promise<boolean>
    {
        try
        {
            var sb = new ThinNeo.ScriptBuilder();
            var scriptaddress = Helper.hexToBytes(Consts.registerContract).reverse();
            sb.EmitParamJson([ "(addr)" + owner, "(bytes)" + Helper.toHexString(nnshash), "(str)" + subdomain, "(str)addr", "(addr)" + data ]);//第二个参数是个数组
            sb.EmitPushString("getSubOwner");
            sb.EmitAppCall(scriptaddress);
            //var data = sb.ToArray();

            //let result = await WWW.rpc_getInvokescript(data);

        }
        catch (e)
        {

        }
        return true;
    }


}