import * as NEL from '../lib/neo-ts/index';
import { SCRYPT_CONFIG, CURR_WALLET, LOCAL_WALLET } from './constant'
import tip from '../utils/tip';

export class Wallet {
    //当前账户钱包
    static wallet = null
    static height = -1

    //nep6account
    static account = null

    //保存用户的openid
    static openid = null

    constructor() { }

    /**
     * 切换账户的时候调用（观察账户的时候不切换）
     */
    static reset() {
        //清除文件缓存
        wx.setStorageSync(CURR_WALLET, null);
        //清除内存缓存
        Wallet.account = null;
    }

    /**
     * 通过用户输入的账户信息返回钱包对象
     * @param {string} label 
     * @param {string} key prikey
     */
    static getWallet(label, key) {
        let privateKey = NEL.helper.UintHelper.hexToBytes(key);
        wx.showLoading({ title: '公钥计算中' });
        const publicKey = NEL.helper.Helper.GetPublicKeyFromPrivateKey(privateKey);

        wx.showLoading({ title: '地址计算中' });
        const address = NEL.helper.Helper.GetAddressFromPublicKey(publicKey);
        var wallet = new NEL.nep6.nep6wallet();
        wallet.scrypt = new NEL.nep6.nep6ScryptParameters();
        wallet.scrypt.N = SCRYPT_CONFIG.N;
        wallet.scrypt.r = SCRYPT_CONFIG.r;
        wallet.scrypt.p = SCRYPT_CONFIG.p;
        wallet.accounts = [];
        wallet.accounts[0] = new NEL.nep6.nep6account();
        wallet.accounts[0].address = address;
        wallet.accounts[0].label = label;
        wallet.accounts[0].nep2key = key;
        wallet.accounts[0].publickey = NEL.helper.StringHelper.toHexString(publicKey);
        return wallet;
    }

    static importAccount(json) {

        const label = json['label'];
        let wallets = wx.getStorageSync(LOCAL_WALLET) || {};

        if (wallets[label] !== undefined) {
            tip.alert('账户名已存在');
            return;
        }

        var wallet = new NEL.nep6.nep6wallet();
        wallet.scrypt = new NEL.nep6.nep6ScryptParameters();
        wallet.scrypt.N = SCRYPT_CONFIG.N;
        wallet.scrypt.r = SCRYPT_CONFIG.r;
        wallet.scrypt.p = SCRYPT_CONFIG.p;
        wallet.accounts = [];
        wallet.accounts[0] = new NEL.nep6.nep6account();
        wallet.accounts[0].address = json['address'];
        wallet.accounts[0].label = json['label'];
        wallet.accounts[0].nep2key = json['nep2key'];
        wallet.accounts[0].publickey = json['publickey'];

        Wallet.setWallet(wallet);

        const wallet_json = wallet.toJson();
        wallets[label] = wallet_json;
        wx.setStorageSync(LOCAL_WALLET, wallets);
    }
    /**
     * 缓存账户
     * @param {object} wallet 
     */
    static setWallet(wallet) {
        wx.setStorageSync(CURR_WALLET, wallet);
        Wallet.setAccount(wallet.accounts[0]);
    }

    static setAccount(nep6account) {
        Wallet.account = nep6account;
    }
    /**
     * 删除本地缓存的指定账户
     * @param {string} label 
     */
    static removeWallet() {
        const label = Wallet.account.label;
        let wals = wx.getStorageSync(LOCAL_WALLET) || {};
        let temp_wals = {};
        for (var key in wals) {
            if (key !== label)
                temp_wals[key] = wals[key];
        }
        wx.setStorageSync(LOCAL_WALLET, temp_wals);
        Wallet.reset();
    }
    /**
     * return address 
     */
    static getAddress() {
        if (this.privatekey === null) {
            tip.alert('密钥格式错误，重新登陆')
            return;
        }

        if (this.address === null) {
            if (this.publickey === null) {
                const prikey = NEL.helper.UintHelper.hexToBytes(this.privatekey);
                this.publickey = NEL.helper.Helper.GetPublicKeyFromPrivateKey(prikey);
            }
            this.address = NEL.helper.Helper.GetAddressFromPublicKey(this.publickey);
        }
        return this.address;
    }

    /**
     * decode nep2 to get private key
     * @param {string} passphrase 
     * @param {Wallet} wallet 
     * @param {CallBack} callback
     */
    static decode(passphrase, callback) {
        if (Wallet.account === null) {
            callback(-1, null, null)
            return;
        }
        //如果是通过导入私钥登陆的，那么账户里直接是私钥
        if (Wallet.account.nep2key.length === 64) {
            callback(0, Wallet.account.nep2key, Wallet.account.publickey);
            return;
        }

        NEL.helper.Helper.GetPrivateKeyFromNep2(
            Wallet.account.nep2key,
            passphrase,
            SCRYPT_CONFIG['N'],
            SCRYPT_CONFIG['r'],
            SCRYPT_CONFIG['p'],
            (info, result) => {
                if (info === 'error') {
                    tip.alert('密码错误');
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