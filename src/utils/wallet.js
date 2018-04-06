import * as NEL from '../lib/neo-ts/index';
import { SCRYPT_CONFIG } from './constant'
import tip from '../utils/tip';
export class Wallet {
    //当前账户钱包
    static wallet = null
    static height = -1

    //当前账户的地址
    static address = null

    //当前账户私钥 暂时不用
    static privatekey = null

    //当前账户公钥
    static publickey = null

    //当前帐户名
    static label = null

    //保存用户的openid
    static openid = null

    constructor() { }
    /**
     * 切换账户的时候调用（观察账户的时候不切换）
     */
    static reset() {
        Wallet.privatekey = null;
        Wallet.publickey = null;
        Wallet.wallet = null;
        Wallet.label = null;
        Wallet.address = null;
    }
    /**
     * 设置钱包
     * @param {object} wallet 
     */
    static setWallet(wallet) {
        Wallet.wallet = wallet;
        Wallet.label = wallet['name'];
        Wallet.address = wallet['address'];
        Wallet.publickey = wallet['pubkey'];
    }
    /**
     * 通过用户输入的账户信息返回钱包对象
     * @param {string} name 
     * @param {string} key prikey
     */
    static getWallet(name, key) {
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
        wallet.accounts[0].name = name;
        wallet.accounts[0].key = key;
        wallet.accounts[0].publicKey = NEL.helper.StringHelper.toHexString(publicKey);
        return wallet;
    }
    /**
     * 缓存账户
     * @param {object} wallet 
     */
    static saveWallet(wallet) {
        wepy.showLoading({ title: '账户存储中' });
        wepy.setStorageSync(CURR_WALLET, wallet);
        Wallet.setWallet(wallet.accounts[0]);
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

    static setPrikey(key) {
        if (key.length !== 64) {
            tip.alert('密钥格式错误')
            return;
        }
        this.privatekey = key;
        if (this.address === null) {
            if (this.publickey === null) {
                const prikey = NEL.helper.UintHelper.hexToBytes(this.privatekey);
                this.publickey = NEL.helper.Helper.GetPublicKeyFromPrivateKey(prikey);
            }
            this.address = NEL.helper.Helper.GetAddressFromPublicKey(this.publickey);
        }
    }

    static toString() {
        return JSON.stringify({ 'prikey': this.privatekey, 'pubkey': this.publickey, 'address': this.address });
    }
    static parse(str) {
        const wallet = JSON.parse(str);
        this.address = wallet.address;
        this.privatekey = wallet.prikey;
        this.publickey = wallet.pubkey;
    }
    /**
     * decode nep2 to get private key
     * @param {string} passphrase 
     * @param {Wallet} wallet 
     * @param {CallBack} callback
     */
    static decode(passphrase, wallet, callback) {
        if (wallet === null) {
            callback(-1, null, null)
            return;
        }

        NEL.helper.Helper.GetPrivateKeyFromNep2(
            wallet.key,
            passphrase,
            SCRYPT_CONFIG['N'],
            SCRYPT_CONFIG['r'],
            SCRYPT_CONFIG['p'],
            (info, result) => {
                // console.log('==========123');
                if (info === 'error') {
                    tip.alert('密码错误');
                    callback(-1, null, null)
                    return;
                }
                // console.log('==========');
                const prikey = result;
                let pubkey = NEL.helper.Helper.GetPublicKeyFromPrivateKey(prikey);
                // console.log('==========456');
                callback(0, prikey, pubkey)
            }
        );
    }
}