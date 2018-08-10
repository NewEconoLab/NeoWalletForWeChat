import wepy from 'wepy'
export default class AuthMixin extends wepy.mixin {
  data = {
    showModal: false,
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  }
  methods = {
    getUserInfo(e) {
      this.showModal = false;
      this.$apply();
      console.log(e.detail.userInfo)
    },
    preventTouchMove(e) { }
  }

  onShow() {
    // console.log('mixin onShow')
  }

  onLoad() {
    // console.log('mixin onLoad')
  }

  checkAuth() {
    let that = this;
    wx.getSetting({
      success: (res) => {
        console.log(res)
        let auth = res.authSetting['scope.userInfo'];
        console.log(auth)
        // 没有用户权限
        if (!auth) {
          that.setData({
            showModal: true
          })
        }
      }
    })

  }
}
