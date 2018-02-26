import tip from './tip';
import { SHA256 } from 'crypto-js'
import wepy from 'wepy'


/**
 *  Get random string algorithm based on wechat login encrypted information.
 *  This method can only be used on wechat mini program pletform, since code, 
 *  signature, encryptedData and iv change every time login is called 
 * 
 *  max length is 256
 *  
 *  Author: Jinghui Liao<vvvincentvan@gmail.com>
 * 
 * @param {number} len length for random string
 * @return {string}  
 */
export async function getSecureRandom(len) {
  wepy.showLoading({ title: '获取随机数种子' });
  let random = ''
  const code = await this.getLoginCode();
  const userinfo = await this.getUserInfo();
  console.log(code)
  random = SHA256(code + random).toString()
  random = SHA256(userinfo.signature + random).toString()
  random = SHA256(userinfo.encryptedData + random).toString()
  random = SHA256(userinfo.iv + random).toString()
  console.log(random)
  return random.slice(0, len)
}

export function getLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (res) {
        if (res.code) {
          resolve(res.code)
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  })
}

export function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      success: function (res) {
        resolve(res);
      }
    })
  });
}