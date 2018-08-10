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

/**
 * 观察账户 
 */
export const WATCH_ONLY:string ="watchonlys";


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

export const DAPP_SGAS = Neo.Uint160.parse('2761020e5e6dfcd8d37fdd50ff98fa0f93bccf54');//sgas 新合约地址
export const DAPP_COIN_POOL = Neo.Uint160.parse("5d6b91ee7cde1f8bb1868d36d4bf134f6887d231");//coinpool 新合约地址
export const DAPP_NNS = Neo.Uint160.parse("77e193f1af44a61ed3613e6e3442a0fc809bb4b8");//nns 合约地址
export const DAPP_NNC = Neo.Uint160.parse("12329843449f29a66fb05974c2fb77713eb1689a");//nnc 合约地址
export const DOMAIN_ROOT: string = 'neo';
