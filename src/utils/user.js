export default class User{

     static  s_Instance = null;

     static async getUser(){
         if (User.s_Instance === null) {
             await User.getLoginCode();
             User.s_Instance = await User.getUserInfo();
         }
         return User.s_Instance;
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