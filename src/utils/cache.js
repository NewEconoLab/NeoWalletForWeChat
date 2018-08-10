export default class Cache {

    /**
     * 缓存数据
     * @param {string} key 
     * @param {any} value 
     */
    static put(key, value) {
        if (key === null || key === undefined)
            return;
        try {
            wx.setStorageSync(key, value);
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * 获取缓存
     * @param {string} key 
     */
    static get(key) {
        return wx.getStorageSync(key);
    }

    static delete(key) {
        try {
            wx.removeStorageSync(key)
            return true;
        } catch (e) {
            console.log(e)
            // Do something when catch error
            return false;
        }
    }
}