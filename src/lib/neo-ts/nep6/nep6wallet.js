"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AccountHelper_1 = require("../Helper/AccountHelper");
const UintHelper_1 = require("../Helper/UintHelper");
class contract {
    constructor() {
        this.parameters = [{ "name": "parameter0", "type": "Signature" }];
        this.deployed = false;
    }
}
exports.contract = contract;
class nep6account {
    getPrivateKey(scrypt, password, callback) {
        var cb = (i, r) => {
            if (i == "finish") {
                var bytes = r;
                var pkey = AccountHelper_1.Helper.GetPublicKeyFromPrivateKey(bytes);
                var address = AccountHelper_1.Helper.GetAddressFromPublicKey(pkey);
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
        };
        AccountHelper_1.Helper.GetPrivateKeyFromNep2(this.nep2key, password, scrypt.N, scrypt.r, scrypt.p, cb);
    }
}
exports.nep6account = nep6account;
class nep6ScryptParameters {
}
exports.nep6ScryptParameters = nep6ScryptParameters;
class nep6wallet {
    fromJsonStr(jsonstr) {
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
            localacc.contract = acc.contract;
            if (localacc.contract == null || localacc.contract.script == null) {
                localacc.nep2key = null;
            }
            else {
                var ss = UintHelper_1.hexToBytes(localacc.contract.script);
                if (ss.length != 35 || ss[0] != 33 || ss[34] != 172) {
                    localacc.nep2key = null;
                }
            }
            if (acc.key == undefined)
                localacc.nep2key = null;
            this.accounts.push(localacc);
        }
    }
    toJson() {
        var obj = {};
        obj["name"] = null;
        obj["version"] = "1.0";
        obj["scrypt"] = {
            "n": this.scrypt.N,
            "r": this.scrypt.r,
            "p": this.scrypt.p
        };
        var accounts = [];
        for (var i = 0; i < this.accounts.length; i++) {
            var acc = this.accounts[0];
            var jsonacc = {};
            jsonacc["address"] = acc.address;
            jsonacc["publickey"] = acc.publickey;
            jsonacc["label"] = acc.label;
            jsonacc["isDefault"] = false;
            jsonacc["lock"] = false;
            jsonacc["nep2key"] = acc.nep2key;
            jsonacc["extra"] = null;
            jsonacc["contract"] = acc.contract;
            accounts.push(jsonacc);
        }
        obj["accounts"] = accounts;
        obj["extra"] = null;
        return obj;
    }
}
exports.nep6wallet = nep6wallet;
//# sourceMappingURL=nep6wallet.js.map