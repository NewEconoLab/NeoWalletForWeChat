import { Helper, Neo, ThinNeo } from "../lib/neo-ts/index";

export default class Common {
    constructor() { }

    static buildScript(appCall: Neo.Uint160, method: string, param: string[]): Uint8Array {
        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson(param);//第二个参数是个数组
        sb.EmitPushString(method);
        sb.EmitAppCall(new Uint8Array(appCall.bits.buffer));
        return sb.ToArray();
    }

    /**
     * 域名转hash
     * @param domain 域名
     */
    static nameHash(domain: string): Neo.Uint256 {
        var domain_bytes = Helper.Account.String2Bytes(domain);
        var hashd = Neo.Cryptography.Sha256.computeHash(domain_bytes);
        return new Neo.Uint256(hashd);
    }

    /**
     * 子域名转hash
     * @param roothash  根域名hash
     * @param subdomain 子域名
     */
    static nameHashSub(roothash: Neo.Uint256, subdomain: string): Neo.Uint256 {
        var bs: Uint8Array = Helper.Account.String2Bytes(subdomain);
        if (bs.length == 0)
            return roothash;

        var domain = Neo.Cryptography.Sha256.computeHash(bs);
        var domain_bytes = new Uint8Array(domain);
        var domainUint8arry = Helper.concat(domain_bytes, new Uint8Array(roothash.bits.buffer));

        var sub = Neo.Cryptography.Sha256.computeHash(domainUint8arry);
        // var sub_bytes = new Uint8Array(sub);
        return new Neo.Uint256(sub);
    }

    /**
     * 返回一组域名的最终hash
     * @param domainarray 域名倒叙的数组
     */
    static nameHashArray(domainarray: string[]): Neo.Uint256 {
        domainarray.reverse();
        var hash: Neo.Uint256 = Common.nameHash(domainarray[0]);
        for (var i = 1; i < domainarray.length; i++) {
            hash = Common.nameHashSub(hash, domainarray[i]);
        }
        return hash;
    }
}