import { Coin } from './coin';
import * as Config from './config';
import * as Entity from './entity';
import { Https } from './Https';
import { NNS } from './nns';
import * as Random from './random';
import { Context } from './context';
import * as Time from './time';
import * as Tip from './tip';
export { Cache } from './cache';


export default {
    Util: {
        Cache: Cache,
        Config: Config,
        Coin: Coin,
        Https: Https,
        Random: Random,
        Context: Context,
        Time: Time,
        Tip: Tip,
        NNS: NNS
    }
}