import { UserInfo } from "./entity";

export default class User {

    static async getUser() {
        await User.getLoginCode();
        let user = await User.getUserInfo();
        let userInfo = new UserInfo();
        userInfo.avatarUrl = user.avatarUrl;
        userInfo.nickName = user.nickName;
        return userInfo;
    }

    static getLoginCode() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: function (res) {
                    if (res.code) {
                        resolve(res.code)
                    } else {
                        // console.log('获取用户登录态失败！' + res.errMsg)
                    }
                }
            });
        })
    }

    static getUserInfo() {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                success: function (res) {
                    resolve(res['userInfo']);
                }
            })
        });
    }
}