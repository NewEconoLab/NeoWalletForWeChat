import * as NEL from '../lib/neo-ts/index';
import { SCRYPT_CONFIG } from './constant'
import tip from '../utils/tip';
export class WalletHelper {
    static wallet = null
    static height = -1
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