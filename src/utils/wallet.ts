import { Nep6, Helper } from '../lib/neo-ts/index';
import { SCRYPT, CURR_ACCOUNT, LOCAL_ACCOUNTS } from './const'
import Tips from './tip';
import Cache from './cache'
export default class Wallet {
    //当前账户钱包
    static wallet: Nep6.nep6wallet = null

    //nep6account
    static account: Nep6.nep6account = null

    //保存用户的openid
    static openid: string = null

    constructor() { }

    /**
     * 切换账户的时候调用（观察账户的时候不切换）
     */
    static reset() {
        //清除文件缓存
        Cache.delete(CURR_ACCOUNT);
        //清除内存缓存
        Wallet.account = null;
    }

    /**
     * 通过用户输入的账户信息返回钱包对象
     * @param {string} label 
     * @param {string} key prikey
     */
    static getAccount(label: string, key: string): Nep6.nep6account {
        let privateKey = Helper.hexToBytes(key);
        Tips.loading('公钥计算中');
        const publicKey = Helper.Account.GetPublicKeyFromPrivateKey(privateKey);

        Tips.loading('地址计算中');
        const address = Helper.Account.GetAddressFromPublicKey(publicKey);
        let account: Nep6.nep6account = new Nep6.nep6account();

        account.address = address;
        account.label = label;
        account.nep2key = key;
        account.publickey = Helper.toHexString(publicKey);
        return account;
    }

    static importAccount(json) {
        const label = json['label'];
        let accounts = Cache.get(LOCAL_ACCOUNTS) || {};

        if (accounts[label] !== undefined) {
            Tips.alert('账户名已存在');
            return;
        }

        let account = new Nep6.nep6account();
        account.address = json['address'];
        account.label = json['label'];
        account.nep2key = json['nep2key'];
        account.publickey = json['publickey'];

        Wallet.setAccount(account);
        accounts[label] = account;
        Cache.put(LOCAL_ACCOUNTS, accounts);
    }
    /**
     * 缓存账户
     * @param {object} wallet 
     */
    static setAccount(account: Nep6.nep6account) {
        Cache.put(CURR_ACCOUNT, account);
        Wallet.account = account;
    }

    /**
     * 删除本地缓存的指定账户
     * @param {string} label 
     */
    static removeWallet() {
        const label = Wallet.account.label;
        let wals = Cache.get(LOCAL_ACCOUNTS) || {};
        let temp_wals = {};
        for (var key in wals) {
            if (key !== label)
                temp_wals[key] = wals[key];
        }
        Cache.put(LOCAL_ACCOUNTS, temp_wals);
        Wallet.reset();
    }
    /**
     * return address 
     */
    static getAddress(): string {
        if (this.account === null) {
            Tips.alert('密钥格式错误，重新登陆')
            return;
        }

        // if (this.address === null) {
        //     if (this.publickey === null) {
        //         const prikey = NEL.helper.UintHelper.hexToBytes(this.privatekey);
        //         this.publickey = NEL.helper.Helper.GetPublicKeyFromPrivateKey(prikey);
        //     }
        //     this.address = NEL.helper.Helper.GetAddressFromPublicKey(this.publickey);
        // }
        return this.account.address;
    }

    /**
     * wif 转私钥
     * @param {string} wif 
     */
    static wif2prikey(wif: string): string {
        let prikey: Uint8Array = Helper.Account.GetPrivateKeyFromWIF(wif);
        let strkey: string = Helper.toHexString(prikey);

        return strkey;
    }
    /**
     * decode nep2 to get private key
     * @param {string} passphrase 
     * @param {Wallet} wallet 
     * @param {CallBack} callback
     */
    static decode(passphrase: string, callback: Function): Function {
        if (Wallet.account === null) {
            callback(-1, null, null)
            return;
        }
        //如果是通过导入私钥登陆的，那么账户里直接是私钥
        if (Wallet.account.nep2key.length === 64) {
            callback(0, Wallet.account.nep2key, Wallet.account.publickey);
            return;
        }

        Helper.Account.GetPrivateKeyFromNep2(
            Wallet.account.nep2key,
            passphrase,
            SCRYPT['N'],
            SCRYPT['r'],
            SCRYPT['p'],
            (info, result) => {
                if (info === 'error') {
                    Tips.alert('密码错误');
                    callback(-1, null, null)
                    return;
                }
                callback(0, result, Wallet.account.publickey);
            }
        );
    }

    static getLoginCode() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: function (res) {
                    if (res.code) {
                        resolve(res.code)
                    } else {
                        // console.log('获取用户登录态失败！' + res.errMsg)
                    }
                }
            });
        })
    }

    static getUserInfo() {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                success: function (res) {
                    resolve(res);
                }
            })
        });
    }
}