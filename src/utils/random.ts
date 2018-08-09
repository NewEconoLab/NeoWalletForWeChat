import Tips from './tip';
import { SHA256 } from 'crypto-js'
import User from './user';

/**
 *  Get random string algorithm based on wechat login encrypted information.
 *  This method can only be used on wechat mini program platform, since code, 
 *  signature, encryptedData and iv change every time login is called 
 * 
 *  max length is 256
 *  
 *  Author: Jinghui Liao<vvvincentvan@gmail.com>
 * 
 * @param {number} len length for random string
 * @return {string}  
 */
export async function getSecureRandom(len:number):Promise<string> {
  Tips.loading('获取随机数种子' );
  let random:string = ''
  const code = await User.getLoginCode();
  const userinfo:any = await User.getUserInfo();
  // // console.log(code)
  random = SHA256(code + random).toString()
  random = SHA256(userinfo.signature + random).toString()
  random = SHA256(userinfo.encryptedData + random).toString()
  random = SHA256(userinfo.iv + random).toString()
  random = SHA256(Math.random()+''+random).toString()
  console.log(random)
  Tips.loaded();
  return random.slice(0, len)
}