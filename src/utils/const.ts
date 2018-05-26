import { Helper } from "../lib/neo-ts/index";

/**
 * 用户code 换取 session_key
 * @type {String}
 */
export const USER_SPECICAL_INFO: string = "userSpecialInfo";

/**
 * 用户信息
 * @type {String}
 */
export const USER_INFO: string = "userInfo";

/**
 * 缓存钱包列表
 */
export const LOCAL_ACCOUNTS: string = "localWallets";
/** 
 * 当前登陆账户
*/
export const CURR_ACCOUNT: string = "currentWallet";

export const SCRYPT: any = {
    N: 16384,
    r: 8,
    p: 8
};

export const NET_STATE: any = {
    TEST: 'test_net',
    MAIN: 'main_net'
}


export const DAPP_SGAS = Helper.hexToBytes('0x4ac464f84f50d3f902c2f0ca1658bfaa454ddfbf').reverse();//sgas 新合约地址
export const DAPP_COIN_POOL = Helper.hexToBytes("0x5d6b91ee7cde1f8bb1868d36d4bf134f6887d231").reverse();//coinpool 新合约地址
export const DAPP_NNS = Helper.hexToBytes("0x954f285a93eed7b4aed9396a7806a5812f1a5950").reverse();//nns 合约地址

export const DOMAIN_ROOT: string = 'sell';
