export class Cache {

    /**
     * 缓存数据
     * @param {string} key 
     * @param {any} value 
     */
    static put(key, value) {
        if (key === null || key === undefined)
            return;
        wx.setStorageSync(key, value);
    }
    
    /**
     * 获取缓存
     * @param {string} key 
     */
    static get(key) {
        return wx.getStorageSync(key);
    }
}