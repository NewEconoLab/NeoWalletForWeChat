export default class Cache {

    /**
     * 缓存数据
     * @param {string} key 
     * @param {any} value 
     */
    static async put(key, value) {
        console.log('key = ' + key);
        console.log('value = '+value);
        if (key === null || key === undefined)
            return;

        await wx.setStorageSync(key, value);
    }

    /**
     * 获取缓存
     * @param {string} key 
     */
    static get(key) {
        return wx.getStorageSync(key);
    }

    static delete(key) {
        Cache.put(key, undefined);
    }
}