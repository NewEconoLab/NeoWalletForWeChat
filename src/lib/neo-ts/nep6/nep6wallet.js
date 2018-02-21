"use strict";
exports.__esModule = true;
var index_1 = require("../index");
var nep6account = /** @class */ (function () {
    function nep6account() {
    }
    nep6account.prototype.getPrivateKey = function (scrypt, password, callback) {
        var _this = this;
        var cb = function (i, r) {
            if (i == "finish") {
                var bytes = r;
                var pkey = index_1.Helper.GetPublicKeyFromPrivateKey(bytes);
                var address = index_1.Helper.GetAddressFromPublicKey(pkey);
                if (address == _this.address) {
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
        index_1.Helper.GetPrivateKeyFromNep2(this.nep2key, password, scrypt.N, scrypt.r, scrypt.p, cb);
    };
    return nep6account;
}());
exports.nep6account = nep6account;
var nep6ScryptParameters = /** @class */ (function () {
    function nep6ScryptParameters() {
    }
    return nep6ScryptParameters;
}());
exports.nep6ScryptParameters = nep6ScryptParameters;
var nep6wallet = /** @class */ (function () {
    function nep6wallet() {
    }
    nep6wallet.prototype.fromJsonStr = function (jsonstr) {
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
    };
    nep6wallet.prototype.toJson = function () {
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
    };
    return nep6wallet;
}());
exports.nep6wallet = nep6wallet;
