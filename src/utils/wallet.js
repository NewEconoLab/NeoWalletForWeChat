import * as NEL from '../lib/neo-ts/index';
import { SCRYPT_CONFIG } from './constant'
import tip from '../utils/tip';
export class WalletHelper {
    static wallet = null
    constructor() {
    }

    /**
     * decode nep2 to get private key
     * @param {string} passphrase 
     * @param {Wallet} wallet 
     * @param {CallBack} callback
     */
    static decode(passphrase, wallet, callback) {
        if (wallet === null) {
            return;
        }

        NEL.helper.Helper.GetPrivateKeyFromNep2(
            wallet.key,
            passphrase,
            SCRYPT_CONFIG['N'],
            SCRYPT_CONFIG['r'],
            SCRYPT_CONFIG['p'],
            (info, result) => {
                if (info === 'error') {
                    tip.alert('密码错误');
                    return;
                }
                console.log('result=' + 'info=' + info + ' result=' + result);
                const prikey = result;
                let pubkey = NEL.helper.Helper.GetPublicKeyFromPrivateKey(prikey);
                callback(prikey, pubkey)
            }
        );
    }
}