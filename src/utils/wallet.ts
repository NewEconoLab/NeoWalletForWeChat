import { Nep6, Helper } from '../lib/neo-ts/index';
import { SCRYPT, CURR_ACCOUNT, LOCAL_ACCOUNTS, id_GAS } from './const'
import Tips from './tip';
import Cache from './cache'
import Https from './Https';
import { Utxo, Asset } from './entity';
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
        let privateKey;
        if (key !== null && key.length === 52 && key.charAt(0) === 'K') {
            privateKey =Helper.hexToBytes(Wallet.wif2prikey(key));
        } else {
            privateKey = Helper.hexToBytes(key);
        }

        console.log('000')
        Tips.loading('公钥计算中');
        const publicKey = Helper.Account.GetPublicKeyFromPrivateKey(privateKey);
        console.log('1111')
        Tips.loading('地址计算中');
        const address = Helper.Account.GetAddressFromPublicKey(publicKey);
        let account: Nep6.nep6account = new Nep6.nep6account();
        console.log('3333')
        account.address = address;
        account.label = label;
        account.nep2key = key;
        account.publickey = Helper.toHexString(publicKey);
        console.log('4444')
        console.log(account)
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
        const key = json['nep2key'];
        const addr = json['address'];

        if (addr === undefined) {
            account = Wallet.getAccount(label, key);
        } else {
            account.address = addr;
            account.label = json['label'];
            account.publickey = json['publickey'];
            account.nep2key = json['nep2key'];
        }

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
        return this.account.address;
    }


    /**
     * 获取私钥
     * @param passphrase nep2解密密码
     */
    public static async getPrikey(passphrase?: string) /*Uint8Array*/ {
        return new Promise((resolve, rejet) => {

            //私钥登陆
            if (this.account.nep2key.length === 64)
                resolve(this.account.nep2key);
            else {

            }
        })
    }

    static test() {

    }

    /**
     * 获取地址UTXO
     * @param addr 目标地址
     */
    public static async getUTXO_GAS(addr: string): Promise<Asset> {
        let utxos = await Https.api_getUTXO(addr);
        let GAS = new Asset('GAS', id_GAS);

        for (const index in utxos) {
            let utxo: Utxo = new Utxo(utxos[index]);

            if (utxo["asset"] === id_GAS) {
                GAS.addUTXO(utxo);
            }
        }
        return GAS;
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

    static prikey2Wif(prikey: string): string {
        return Helper.Account.GetWifFromPrivateKey(Helper.hexToBytes(prikey));
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
}