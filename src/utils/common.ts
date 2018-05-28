import { Helper, Neo, ThinNeo } from "../lib/neo-ts/index";

export default class Common {
    constructor() { }

    static buildScript(appCall: Uint8Array, method: string, param: string[]): Uint8Array {
        var sb = new ThinNeo.ScriptBuilder();
        sb.EmitParamJson(param);//第二个参数是个数组
        sb.EmitPushString(method);
        sb.EmitAppCall(appCall);
        return sb.ToArray();
    }

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
        var hash: Uint8Array = Common.nameHash(domainarray[0]);
        for (var i = 1; i < domainarray.length; i++) {
            hash = Common.nameHashSub(hash, domainarray[i]);
        }
        return hash;
    }
}