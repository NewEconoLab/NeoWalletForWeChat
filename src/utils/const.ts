import { Helper, Neo } from "../lib/neo-ts/index";

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


export const id_GAS = "0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7";
export const id_NEO = "0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";


export const DAPP_SGAS = Neo.Uint160.parse('4ac464f84f50d3f902c2f0ca1658bfaa454ddfbf');//sgas 新合约地址
export const DAPP_COIN_POOL = Neo.Uint160.parse("5d6b91ee7cde1f8bb1868d36d4bf134f6887d231");//coinpool 新合约地址
export const DAPP_NNS = Neo.Uint160.parse("954f285a93eed7b4aed9396a7806a5812f1a5950");//nns 合约地址
export const DAPP_NNC = Neo.Uint160.parse("d8fa0cfdd54493dfc9e908b26ba165605363137b");//nnc 合约地址
export const DOMAIN_ROOT: string = 'sell';
