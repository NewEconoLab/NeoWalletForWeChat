import tip from './tip'

export async function wxRequest(params = {}, url) {
  let res = await this.Request(params, url);
  return res;
};

export function Request(params = {}, url) {
  console.log('======');
  console.log(url);

  console.log(params)
  console.log('======');
  let body = params.body
  console.log(body)
  return new Promise((resolve, reject) => {
    let type = ''
    if (params.method === 'get')
      type = 'application/json'
    else
      type = 'text/plain'
    wx.request({
      url: url,
      header: { "Content-Type": type },
      method: params.method || 'GET',
      body: params.body || {},
      success: function (res) {
        if (res.data) {
          resolve(res.data)
        } else {
          console.log('网络异常' + res.errMsg)
        }
      }
    });
  })
}

