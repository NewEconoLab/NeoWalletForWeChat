import{Helper} from '../Helper/AccountHelper'
export class nep6account {
    public address: string;
    public nep2key: string;
    public getPrivateKey(scrypt: nep6ScryptParameters, password: string, callback: (info: string, result: string | Uint8Array) => void): void {

        var cb = (i, r) => {
            if (i == "finish") {
                var bytes = r as Uint8Array;
                var pkey = Helper.GetPublicKeyFromPrivateKey(bytes);
                var address = Helper.GetAddressFromPublicKey(pkey);
                if (address == this.address) {
                    callback(i, r);
                }
                else {
                    callback("error", "checkerror");
                }
            }
            else {
                callback(i, r);
            }
        }
        Helper.GetPrivateKeyFromNep2(this.nep2key, password, scrypt.N, scrypt.r, scrypt.p, cb);
    }
}
export class nep6ScryptParameters {
    public N: number;
    public r: number;
    public p: number;
}
export class nep6wallet {

    scrypt: nep6ScryptParameters;
    accounts: nep6account[];
    public fromJsonStr(jsonstr: string): void {
        var json = JSON.parse(jsonstr);
        this.scrypt = new nep6ScryptParameters();
        this.scrypt.N = json.scrypt.n;
        this.scrypt.r = json.scrypt.r;
        this.scrypt.p = json.scrypt.p;
        this.accounts = [];
        for (var i = 0; i < json.accounts.length; i++) {
            var acc = json.accounts[i];
            var localacc = new nep6account();
            localacc.address = acc.address;
            localacc.nep2key = acc.key;
            if (acc.key == undefined)
                localacc.nep2key = null;
            this.accounts.push(localacc);
        }
    }
    public toJson(): any {
        var obj = {};
        obj["name"] = null;

        obj["version"] = "1.0";
        obj["scrypt"] = {
            "n": this.scrypt.N,
            "r": this.scrypt.r,
            "p": this.scrypt.p
        }
        var accounts = [];
        for (var i = 0; i < this.accounts.length; i++) {
            var acc = this.accounts[0];

            var jsonacc = {};
            jsonacc["address"] = acc.address;
            jsonacc["label"] = null;
            jsonacc["isDefault"] = false;
            jsonacc["lock"] = false;
            jsonacc["key"] = acc.nep2key;
            jsonacc["extra"] = null;
            accounts.push(jsonacc);
        }
        obj["accounts"] = accounts;
        obj["extra"] = null;

        return obj;
    }
}