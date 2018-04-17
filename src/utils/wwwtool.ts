import { Result, BalanceInfo, AssetEnum } from './entity';
import { CoinTool } from './cointool';
export class WWW
{
    static api: string = "https://api.nel.group/api/testnet";
    static makeRpcUrl(url: string, method: string, ..._params: any[])
    {
        if (url[ url.length - 1 ] != '/')
            url = url + "/";
        var urlout = url + "?jsonrpc=2.0&id=1&method=" + method + "&params=[";
        for (var i = 0; i < _params.length; i++)
        {
            urlout += JSON.stringify(_params[ i ]);
            if (i != _params.length - 1)
                urlout += ",";
        }
        urlout += "]";
        return urlout;
    }
    static makeRpcPostBody(method: string, ..._params: any[]): {}
    {
        var body = {};
        body[ "jsonrpc" ] = "2.0";
        body[ "id" ] = 1;
        body[ "method" ] = method;
        var params = [];
        for (var i = 0; i < _params.length; i++)
        {
            params.push(_params[ i ]);
        }
        body[ "params" ] = params;
        return body;
    }


    static async  api_getHeight()
    {
        var str = WWW.makeRpcUrl(WWW.api, "getblockcount");
        var result = await fetch(str, { "method": "get" });
        var json = await result.json();
        var r = json[ "result" ];
        var height = parseInt(r[ 0 ][ "blockcount" ] as string) - 1;
        return height;
    }
    static async api_getAllAssets()
    {
        var str = WWW.makeRpcUrl(WWW.api, "getallasset");
        var result = await fetch(str, { "method": "get" });
        var json = await result.json();
        var r = json[ "result" ];
        return r;
    }
    static async api_getUTXO(address: string)
    {
        var str = WWW.makeRpcUrl(WWW.api, "getutxo", address);
        var result = await fetch(str, { "method": "get" });
        var json = await result.json();
        var r = json[ "result" ];
        return r;
    }
    static async api_getnep5Balance(address: string)
    {
        var str = WWW.makeRpcUrl(WWW.api, "getallnep5assetofaddress", address, 1);
        var result = await fetch(str, { "method": "get" });
        var json = await result.json();
        var r = json[ "result" ];
        return r;
    }
    static async api_getBalance(address: string)
    {
        var res: Result = new Result();
        var str = WWW.makeRpcUrl(WWW.api, "getbalance", address);
        var value = await fetch(str, { "method": "get" });
        var json = await value.json();
        if (json[ "result" ])
        {
            var r = json[ "result" ];
            var balances = r as Array<BalanceInfo>;
            balances.map(balance => balance.names = balance.name.map(name => name.name).join('|'));
            balances.map((balance) =>
            {
                balance.names = CoinTool.assetID2name[ balance.asset ];
            });
            res.err = false;
            res.info = balances;
        } else
        {
            res.err = true;
            res.info = json[ "error" ];
        }
        return res;
    }

    static async getNep5Asset(asset: string)
    {
        var postdata = WWW.makeRpcPostBody("getnep5asset", asset);
        var result = await fetch(WWW.api, { "method": "post", "body": JSON.stringify(postdata) });
        var json = await result.json();
        var r = json[ "result" ][ 0 ];
        return r;
    }

    static async api_getAddressTxs(address: string, size: number, page: number)
    {
        var postdata = WWW.makeRpcPostBody("getaddresstxs", address, size, page);
        var result = await fetch(WWW.api, { "method": "post", "body": JSON.stringify(postdata) });
        var json = await result.json();
        var r = json[ "result" ];
        return r;
    }

    static async api_postRawTransaction(data: Uint8Array): Promise<boolean>
    {
        var postdata = WWW.makeRpcPostBody("sendrawtransaction", data.toHexString());
        var result = await fetch(WWW.api, { "method": "post", "body": JSON.stringify(postdata) });
        var json = await result.json();
        var r = json[ "result" ][ 0 ] as boolean;
        return r;
    }

    static async api_getclaimgas(address: string): Promise<number>
    {
        var str = WWW.makeRpcUrl(WWW.api, "getclaimgas", address);
        var result = await fetch(str, { "method": "get" });
        var json = await result.json();
        var r = json[ "result" ];
        if (r == undefined)
            return 0;
        return r[ 0 ][ "gas" ];
    }

    // static async rpc_getURL()
    // {
    //     var str = WWW.makeRpcUrl(WWW.api, "getnoderpcapi");
    //     var result = await fetch(str, { "method": "get" });
    //     var json = await result.json();
    //     var r = json[ "result" ][ 0 ];
    //     var url = r.nodeList[ 0 ];
    //     WWW.rpc = url;
    //     WWW.rpcName = r.nodeType;
    //     return url;
    // }
    // 蓝鲸淘接口
    // static async otc_getBalances(address: string)
    // {
    //     var str = WWW.otcgo + "/address/balances/{" + address + "}";
    //     var value = await fetch(str, { "method": "get" });
    //     var json = await value.json();
    //     var r = json[ "data" ];
    //     return r;
    // }


    static async  rpc_getHeight()
    {
        var str = WWW.makeRpcUrl(WWW.api, "getblockcount");
        var result = await fetch(str, { "method": "get" });
        var json = await result.json();
        var r = json[ "result" ];
        var height = parseInt(r as string) - 1;
        return height;
    }

    static async  rpc_getStorage(scripthash: Uint8Array, key: Uint8Array): Promise<string>
    {
        var str = WWW.makeRpcUrl(WWW.api, "getstorage", scripthash.toHexString(), key.toHexString());
        var result = await fetch(str, { "method": "get" });
        var json = await result.json();
        if (json[ "result" ] == null)
            return null;
        var r = json[ "result" ] as string;
        return r;
    }

    static async rpc_getInvokescript(scripthash: Uint8Array): Promise<any>
    {
        var str = WWW.makeRpcUrl(WWW.api, "invokescript", scripthash.toHexString());
        var result = await fetch(str, { "method": "get" });
        var json = await result.json();
        if (json[ "result" ] == null)
            return null;
        var r = json[ "result" ][ 0 ]
        return r;
    }
    static async getrawtransaction(txid: string)
    {
        var str = WWW.makeRpcUrl(WWW.api, "getrawtransaction", txid);
        var result = await fetch(str, { "method": "get" });
        var json = await result.json();
        if (json[ "result" ] == null)
            return null;
        var r = json[ "result" ][ 0 ]
        return r;
    }
}