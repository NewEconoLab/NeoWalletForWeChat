import tip from './tip'
let hotapp = require('./hotapp.js');
export async function wxRequest(params = {}, url) {
  let res = await this.Request(params, url);
  return res;
};

export function Request(params = {}, url) {
  let body = params.body
  return new Promise((resolve, reject) => {
    let type = ''
    if (params.method === 'get')
      type = 'application/json';
    else
      type = 'application/x-www-form-urlencoded';
    hotapp.request({
      useProxy: true,
      url: url, // 需要代理请求的网址
      method: params.method || 'GET',
      data: body,
      header: {
        'content-type': type
      },
      success: function (res) {
        wx.hideLoading();
        // Loading = false;
        if (res.data) {
          resolve(res.data)
        } else {
          // console.log('网络异常' + res.errMsg)
        }
      },
      fail:function(res){

      }
    })
  })
}



