import Cache from "./cache";
import { WatchOnlyAccount } from "./entity";
import { WATCH_ONLY } from "./const";

export default class WatchOnlyManager {
    constructor() { }

    static getAll() {
        return Cache.get(WATCH_ONLY) || {};
    }

    static delete(tag: string) {
        console.log('delete')
        console.log(tag)
        let accounts = Cache.get(WATCH_ONLY) || {};
        // 移除缓存 之后更新缓存
        Cache.delete(WATCH_ONLY);

        let res = {};
        for (let key in accounts) {
            console.log(key)
            if (key !== tag)
                res[key] = accounts[key];
        }
        Cache.put(WATCH_ONLY, res);
    }

    static async add(watch: WatchOnlyAccount) {
        console.log(watch)
        let accounts = Cache.get(WATCH_ONLY) || {};
        accounts[watch.tag] = watch;
        console.log(accounts)
        await Cache.put(WATCH_ONLY, accounts);
        console.log(Cache.get(WATCH_ONLY))
    }

}