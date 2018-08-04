import Cache from "./cache";
import { WatchOnlyAccount } from "./entity";
import { WATCH_ONLY } from "./const";

export default class WatchOnlyManager {
    constructor() { }

    static getAll() {
        return Cache.get(WATCH_ONLY) || {};
    }

    static delete(tag: string) {
        let accounts = Cache.get(WATCH_ONLY) || {};
        let res = [];
        for (let key in accounts) {
            if (key !== tag)
                res[key] = accounts[key];
        }
        Cache.put(WATCH_ONLY, res);
    }

    static add(watch: WatchOnlyAccount) {
        let accounts = Cache.get(WATCH_ONLY) || {};
        accounts[watch.tag] = watch;
        Cache.put(WATCH_ONLY, accounts);
    }

}