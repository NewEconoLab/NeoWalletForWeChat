import * as Request from './wxRequest';
import * as NEL from '../lib/neo-ts/index';
let hotapp = require('./hotapp.js');
export class WWW {
    static api = "http://api.nel.group/api/testnet";
    static priceHost = "https://api.coinmarketcap.com/v1/ticker/";
    static rpc = WWW.api;
    static rpcName = "";

    /**
     * create Rpc Url
     * @param url string
     * @param method string
     * @param _params any[]
     */
    static makeRpcUrl(url, method, ..._params) {

        if (url[url.length - 1] != '/')
            url = url + "/";
        var urlout = url + "?jsonrpc=2.0&id=1&method=" + method + "&params=[";
        for (var i = 0; i < _params.length; i++) {
            urlout += JSON.stringify(_params[i]);
            if (i != _params.length - 1)
                urlout += ",";
        }
        urlout += "]";
        return urlout;
    }

    /**
     * create Rpc post call body
     * @param method string
     * @param _params any[]
     * @return {map}
     */
    static makeRpcPostBody(method, ..._params) {
        var body = {};
        body["jsonrpc"] = "2.0";
        body["id"] = 1;
        body["method"] = method;
        var params = [];
        for (var i = 0; i < _params.length; i++) {
            params.push(_params[i]);
        }
        body["params"] = params;
        return body;
    }
    /**
     * 构造watchonly地址管理接口
     * @param {map} body 
     */
    static async makeaddrpost(body) {
        // console.log(postdata)
        var result = await Request.wxRequest({ "method": "post", "body": body }, "http://112.74.52.116/neowallet/index.php");
        // var result = await Request.wxRequest({ "method": "post", "body":JSON.stringify(postdata)}, WWW.rpc);
        return result["result"];
    }
    /** 
     * get blockchain height
     * @return int 
     */
    static async  api_getHeight() {
        var str = WWW.makeRpcUrl(WWW.api, "getblockcount");
        var result = await Request.wxRequest({ "method": "get" }, str);
        var r = result["result"];
        var height = parseInt(r[0]["blockcount"]) - 1;
        return height;
    }

    static async api_getAllAssets() {
        var str = WWW.makeRpcUrl(WWW.api, "getallasset");
        var result = await Request.wxRequest({ "method": "get" }, str);
        var r = result["result"];
        return r;
    }

    static async api_getUTXO(address) {
        var str = WWW.makeRpcUrl(WWW.api, "getutxo", address);
        var result = await Request.wxRequest({ "method": "get" }, str);
        var r = result["result"];
        return r;

    }

    static async api_getCoinPrice() {
        // https://api.coinmarketcap.com/v1/ticker/gas/
        // https://api.coinmarketcap.com/v1/ticker/neo/ bitcoin/ ethereum/
        // https://api.coinmarketcap.com/v1/ticker/?limit=2

        let gas = await Request.wxRequest({ "method": "get" }, WWW.priceHost + 'gas/?convert=CNY');
        let neo = await Request.wxRequest({ "method": "get" }, WWW.priceHost + 'neo/?convert=CNY');
        let bitCoin = await Request.wxRequest({ "method": "get" }, WWW.priceHost + 'bitcoin/?convert=CNY')
        return {
            GAS: gas,
            NEO: neo,
            BitCoin: bitCoin
        }
    }


    static async rpc_getURL() {
        var str = WWW.makeRpcUrl(WWW.api, "getnoderpcapi");
        var result = await Request.wxRequest({ "method": "get" }, str);
        var r = result["result"][0];
        var url = r.nodeList[0];
        WWW.rpc = url;
        WWW.rpcName = r.nodeType;
        return url;
    }

    static async  rpc_getHeight() {
        var str = WWW.makeRpcUrl(WWW.rpc, "getblockcount");
        var result = await Request.wxRequest({ "method": "get" }, str);
        var r = result["result"];
        var height = parseInt(str(r)) - 1;
        return height;
    }
    /**
     *  发送交易
     * @param {uint8array} data 
     */
    static async rpc_postRawTransaction(data) {
        var postdata = WWW.makeRpcPostBody("sendrawtransaction", NEL.helper.StringHelper.toHexString(data));
        // console.log(postdata)
        var result = await Request.wxRequest({ "method": "post", "body": { 'tx': JSON.stringify(postdata), 'server': WWW.rpc } }, "http://112.74.52.116/proxy.php");
        // var result = await Request.wxRequest({ "method": "post", "body":JSON.stringify(postdata)}, WWW.rpc);
        var r = result["result"];
        return r;
    }

    /**
     * get transaction detail from txid
     * @param {string} data
     */
    static async rpc_getRawTransaction(txid) {
        var postdata = WWW.makeRpcPostBody("getrawtransaction", txid);
        // console.log(postdata)
        var result = await Request.wxRequest({ "method": "post", "body": { 'tx': JSON.stringify(postdata), 'server': WWW.rpc } }, "http://112.74.52.116/proxy.php");
        // var result = await Request.wxRequest({ "method": "post", "body":JSON.stringify(postdata)}, WWW.rpc);
        var r = result["result"];
        return r;
    }

    /**
     * Get transaction history by address
     * @param {string} addr the address used to get txs
     * @param {number = 20} max the max number of txs per page
     * @param {number = 1} page page index
     */
    static async rpc_getAddressTXs(addr, max = 20, page = 1) {
        var postdata = WWW.makeRpcPostBody("getaddresstxs", addr, max, page);
        // console.log(postdata)
        var result = await Request.wxRequest({ "method": "post", "body": { 'tx': JSON.stringify(postdata), 'server': WWW.rpc } }, "http://112.74.52.116/proxy.php");
        // var result = await Request.wxRequest({ "method": "post", "body":JSON.stringify(postdata)}, WWW.rpc);
        var r = result["result"];
        return r;
    }

    static async  rpc_getStorage(scripthash, key) {
        var str = WWW.makeRpcUrl(WWW.rpc, "getstorage", scripthash.toHexString(), key.toHexString());
        var result = await fetch(str, { "method": "get" });
        var json = JSON.parse(result)
        if (json["result"] == null)
            return null;
        var r = json["result"];
        return r;
    }

    /**
     * 增加新的watchonly地址
     * @param {string} openid 用户唯一身份识别
     * @param {string} address 增加的地址
     */
    static async  addr_insert(openid, address) {
        let body = { 'method': 'insert', 'openid': openid, 'address': address };
        return await WWW.makeaddrpost(body);;
    }

    /**
    * 删除watchonly地址
    * @param {string} openid 用户唯一身份识别
    * @param {string} address 增加的地址
    */
    static async  addr_delete(openid, address) {
        let body = { 'method': 'delete', 'openid': openid, 'address': address };
        return await WWW.makeaddrpost(body);;
    }
    /**
    * 查询watchonly地址
    * @param {string} openid 用户唯一身份识别
    */
    static async  query_insert(openid) {
        let body = { 'method': 'query', 'openid': openid };
        return await WWW.makeaddrpost(body);;
    }
    /**
    * 获取openid
    * @param {string} code
    */
    static async  query_insert(code) {
        let body = { 'method': 'openid', 'code': code };
        return await WWW.makeaddrpost(body);;
    }
}