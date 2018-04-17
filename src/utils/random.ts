import tip from './tip';
import { SHA256 } from 'crypto-js'
import wepy from 'wepy'
import { WalletTool } from './wallettool';

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
export async function getSecureRandom(len:number) {
  wepy.showLoading({ title: '获取随机数种子' });
  let random:string = ''
  const code = await WalletTool.getLoginCode();
  const userinfo:any = await WalletTool.getUserInfo();
  // console.log(code)
  random = SHA256(code + random).toString()
  random = SHA256(userinfo.signature + random).toString()
  random = SHA256(userinfo.encryptedData + random).toString()
  random = SHA256(userinfo.iv + random).toString()
  // console.log(random)
  wepy.hideLoading();
  return random.slice(0, len)
}