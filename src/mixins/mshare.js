import wepy from 'wepy'

export default class ShareMixin extends wepy.mixin {
  data = {
    mixin: 'This is mixin data.'
  }
  methods = {
    tap () {
      this.mixin = 'mixin data was changed'
      // console.log('mixin method tap')
    }
  }

  onShow() {
    // console.log('mixin onShow')
  }

  onLoad() {
    // console.log('mixin onLoad')
  }

  onShareAppMessage() {
    return {
      title: 'NEO钱包',
      path: '/pages/index'
    };
  }
}
