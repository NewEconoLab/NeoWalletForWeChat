import * as NEL from '../lib/neo-ts/index';
import { SCRYPT_CONFIG } from './constant'
import tip from '../utils/tip';
export class Wallet {
    static wallet = null
    static height = -1
    static address = null
    static privatekey = null
    static publickey = null

    //当前账户是否为观察账户
    static watchonly = false;
    //保存用户的openid
    static openid = null

    constructor() { }
    /**
     * 切换账户的时候调用（观察账户的时候不切换）
     */
    static reset(){
        Wallet.privatekey = null;
        Wallet.publickey = null;
        Wallet.watchonly = null;
        Wallet.wallet = null;
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