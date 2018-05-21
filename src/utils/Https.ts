import * as Request from './wxRequest';
import { Helper } from '../lib/neo-ts/index';
let hotapp = require('./hotapp.js');
export default class Https {
    static api: string = "https://api.nel.group/api/testnet";
    static priceHost: string = "https://api.coinmarketcap.com/v1/ticker/";
    static rpc: string = "http://47.96.168.8:20332/testnet";
    static proxy_server: string = "http://112.74.52.116/";
    // 交易通知模板id
    static templet_id: string = "2lEt8hQIzI6tbTw9ThtZhNalDG6GulckpcYEs_Ki7ZQ";

    static apiaggr: string = "https://apiaggr.nel.group/api/testnet";

    /**
     * create Rpc Url
     * @param url string
     * @param method string
     * @param _params any[]
     */
    static makeRpcUrl(url: string, method: string, ..._params: any[]) {

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
    static makeRpcPostBody(method: string, ..._params: any[]): {} {
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
        var result = await Request.wxRequest({ "method": "post", "body": body }, this.proxy_server + "neowallet/index.php");
        return result;
    }

    /** 
     * get blockchain height
     * @return int 
     */
    static async  api_getHeight() {
        var str = this.makeRpcUrl(this.api, "getblockcount");
        var result = await Request.wxRequest({ "method": "get" }, str);
        var height: number;
        try {
            var r = result["result"];
            height = parseInt(r[0]["blockcount"]) - 1;
        } catch (err) {
            height = -1;
        }
        return height;
    }

    static async api_getAllAssets() {
        var str = this.makeRpcUrl(this.api, "getallasset");
        var result = await Request.wxRequest({ "method": "get" }, str);
        var r = result["result"];
        return r;
    }

    static async api_getUTXO(address) {
        var str = this.makeRpcUrl(this.api, "getutxo", address);
        var result = await Request.wxRequest({ "method": "get" }, str);
        var r = result["result"];
        return r;

    }

    /**
     * 获取货币市值 //TODO 接口更新
     * @param coin 
     */
    static async api_getCoinPrice(coin) {
        return await Request.wxRequest({ "method": "get" }, this.priceHost + coin + '/?convert=CNY');
    }


    static async  rpc_getHeight() {
        var str = this.makeRpcUrl(this.api, "getblockcount");
        var result = await Request.wxRequest({ "method": "get" }, str);
        var r = (result["result"] as string);
        var height = parseInt(r) - 1;
        return height;
    }
    /**
     *  发送交易
     * @param {uint8array} data 
     */
    static async rpc_postRawTransaction(data) {
        var postdata = this.makeRpcPostBody("sendrawtransaction", Helper.toHexString(data));
        // console.log(postdata)
        var result = await Request.wxRequest({ "method": "post", "body": { 'tx': JSON.stringify(postdata), 'server': this.api } }, this.proxy_server + "proxy.php");
        // var result = await Request.wxRequest({ "method": "post", "body":JSON.stringify(postdata)}, this.rpc);
        console.log(result);

        var r = result["result"][0]['sendrawtransactionresult'];
        if (r) {
            return result["result"][0]['txid'] || ''//[]
        }
        return 'failed';
    }

    /**
     * 根据交易id获取交易详情
     * @param {string} data
     */
    static async rpc_getRawTransaction(txid) {
        var postdata = this.makeRpcPostBody("getrawtransaction", txid);
        // console.log(postdata)
        var result = await Request.wxRequest({ "method": "post", "body": { 'tx': JSON.stringify(postdata), 'server': this.api } }, this.proxy_server + "proxy.php");
        // var result = await Request.wxRequest({ "method": "post", "body":JSON.stringify(postdata)}, this.rpc);
        var r = result["result"];
        return r;
    }

    /**
     * 根据账户地址获取历史交易
     * @param {string} addr the address used to get txs
     * @param {number = 20} max the max number of txs per page
     * @param {number = 1} page page index
     */
    static async rpc_getAddressTXs(addr, max = 20, page = 1) {
        var postdata = this.makeRpcPostBody("getaddresstxs", addr, max, page);
        // console.log(postdata)
        var result = await Request.wxRequest({ "method": "post", "body": { 'tx': JSON.stringify(postdata), 'server': this.api } }, this.proxy_server + "proxy.php");
        // var result = await Request.wxRequest({ "method": "post", "body":JSON.stringify(postdata)}, this.rpc);
        var r = result["result"];
        return r;
    }

    /**
     * 获取可领取的GAS
     * @param address 地址
     */
    static async api_getclaimgas(address: string, type: number) {
        if (type)
            var str = this.makeRpcUrl(this.api, "getclaimgas", address, type);
        else
            var str = this.makeRpcUrl(this.api, "getclaimgas", address);
        // var result = await fetch(str, { "method": "get" });
        var result = await Request.wxRequest({ "method": "get" }, str);
        return result["result"][0];
        // var json = await result.json();
        // var r = json["result"];
        // if (r == undefined)
        //     return 0;
        // return r[0]["gas"];
    }

    /***********************************************************
     * 
     *  NEP5 接口
     * 
     * *********************************************************/

    /**
     * 获取nep5 代币详情
     * @param asset 
     */
    static async getNep5Asset(asset: string) {
        // var postdata = this.makeRpcPostBody("getnep5asset", asset);
        // var result = await fetch(this.api, { "method": "post", "body": JSON.stringify(postdata) });
        // var json = await result.json();
        // var r = json["result"][0];
        // return  r;
        return null;
    }

    static async api_getnep5Balance(address: string) {
        // var str = this.makeRpcUrl(this.api, "getallnep5assetofaddress", address, 1);
        // var result = await fetch(str, { "method": "get" });
        // var json = await result.json();
        // var r = json["result"];
        // return r;
        return null;
    }


    static async  rpc_getStorage(scripthash: Uint8Array, key: Uint8Array): Promise<string> {
        // var str = this.makeRpcUrl(this.api, "getstorage", Helper.toHexString(scripthash), Helper.toHexString(key));
        // var result = await fetch(str, { "method": "get" });
        // var json = await result.json();
        // if (json["result"] == null)
        //     return null;
        // var r = json["result"] as string;
        // return r;
        return null;
    }

    static async rpc_getInvokescript(scripthash: Uint8Array): Promise<any> {
        // var str = this.makeRpcUrl(this.api, "invokescript", Helper.toHexString(scripthash));
        // var result = await fetch(str, { "method": "get" });
        // var json = await result.json();
        // if (json["result"] == null)
        //     return null;
        // var r = json["result"][0]
        // return r;
        return null;
    }

    /**
     * 获取所有交易 utxo+nep5
     * @param address 地址
     * @param pagesize 每页展示交易量
     * @param pageindex 页下标
     */
    static async gettransbyaddress(address: string, pagesize: number = 20, pageindex: number = 1) {
        var postdata =
            Https.makeRpcPostBody(
                "gettransbyaddress",
                address,
                pagesize,
                pageindex
            );
        var r;
        try {
            var result = await Request.wxRequest({ "method": "post", "body": { 'tx': JSON.stringify(postdata), 'server': this.apiaggr } }, this.proxy_server + "proxy.php");
           console.log('result1');
           console.log(result);
           
           
            r = result["result"];
        } catch (err) {
            console.log(err);

        }
        console.log('result');
        
        console.log(r);

        return r;
    }

    /********************************************************
     * 
     *  NNS注册相关
     * 
     *********************************************************/

    //注册域名时塞值
    static async setnnsinfo(address: string, name: string, time: number) {
        // var str = this.makeRpcUrl(this.api, "setnnsinfo", address, name, time);
        // var result = await fetch(str, { "method": "get" });
        // var json = await result.json();
        // if (json["result"] == null)
        //     return null;
        // var r = json["result"][0]
        // return r;
        return null;
    }
    static async getnnsinfo(address: string) {
    }
    static async delnnsinfo(address: string, domain: string) {
    }


    /**********************************************************
     * 
     *  watchonly 账户接口  
     * 
     * ********************************************************/

    /**
     * 增加新的watchonly地址
     * @param {string} openid 用户唯一身份识别
     * @param {string} address 增加的地址
     */
    static async  addr_insert(openid, label, address) {
        let body = { 'method': 'insert', 'openid': openid, 'label': label, 'address': address };
        return await this.makeaddrpost(body);;
    }

    /**
    * 删除watchonly地址
    * @param {string} openid 用户唯一身份识别
    * @param {string} address 增加的地址
    */
    static async  addr_delete(openid, address) {
        let body = { 'method': 'delete', 'openid': openid, 'address': address };
        return await this.makeaddrpost(body);;
    }

    /**
    * 查询watchonly地址
    * @param {string} openid 用户唯一身份识别
    */
    static async addr_query(openid) {
        let body = { 'method': 'query', 'openid': openid };
        return await this.makeaddrpost(body);
    }

    /**
    * 获取openid
    * @param {string} code
    */
    static async addr_openid(code) {
        let body = { 'method': 'openid', 'code': code };
        return await this.makeaddrpost(body);
    }

    /**
     * 获取通知口令
     */
    static async access_token() {
        let body = { 'method': 'access_token' };
        return await this.makeaddrpost(body);
    }

    // /**
    //  * 发送微信通知
    //  * @param {string} txid 交易id
    //  * @param {string} openid 用户唯一识别码
    //  * @param {string} addr 转账地址
    //  * @param {string} sendTime 交易时间
    //  */
    /**
     * 
     * @param {string} txid 
     * @param {string} openid 
     * @param {string} addr 
     * @param {string} sendTime 
     * @param {string} type 
     * @param {string} amount 
     * @param {string} token 
     */
    static async notify(txid, openid, addr, sendTime, type, amount, token, formId) {
        // 交易时间{{keyword1.DATA}}
        // 交易类型{{keyword2.DATA}}
        // 交易金额{{keyword3.DATA}}
        // 订单编号{{keyword4.DATA}}
        // 交易人{{keyword5.DATA}}
        let url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + token;
        let body = {
            touser: openid,
            template_id: this.templet_id,
            page: './transaction?txid = ' + txid,
            form_id: formId,
            "data": {
                "keyword1": {
                    "value": sendTime,
                    "color": "#173177"
                },
                "keyword2": {
                    "value": type + '交易',
                    "color": "#173177"
                },
                "keyword3": {
                    "value": amount + type,
                    "color": "#173177"
                },
                "keyword4": {
                    "value": txid,
                    "color": "#173177"
                },
                "keyword5": {
                    "value": addr,
                    "color": "#173177"
                }
            }
        }
        var result = await Request.wxRequest({ "method": "post", "body": body }, url);
        // var result = await Request.wxRequest({ "method": "post", "body":JSON.stringify(postdata)}, this.rpc);
        var r = result["result"];
        return r;

    }
}