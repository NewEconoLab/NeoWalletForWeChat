# NEO wallet for WeChat mini program
================

This project is developed with the help and support from [NEL](https://github.com/NewEconoLab/) community. Join the community and learn NEO developing at:
- 点击链接加入群【NEO开发 从入门到放弃】：https://jq.qq.com/?_wv=1027&k=5erIkal
- 点击链接加入群【NEL区块链技术交流】：https://jq.qq.com/?_wv=1027&k=57bF3he

## Mini Program QRCode

<p align="center">
  <img
    src="./img/qrcode.jpg"
    width="300px;">
</p>

## ScreenCapture

<div>
<img src="./img/index.JPG" width="200" alt="首页"/>
<img src="./img/send.JPG" width="200" alt="转账"/>
<img src="./img/receive.JPG" width="200" alt="收款"/>
<img src="./img/history.JPG" width="200" alt="交易历史"/>
</div>
<div>
<img src="./img/transaction.JPG" width="200" alt="交易详情"/>
<img src="./img/vin.JPG" width="200" alt="交易输入"/>
<img src="./img/vout.JPG" width="200" alt="交易输出"/>
<img src="./img/mine.JPG" width="200" alt="个人"/>
</div>

## Usage

### Start

``` bash
git clone https://github.com/NewEconoLab/NeoWalletForWeChat.git

cd NeoWalletForWeChat

npm install wepy-cli -g
npm install

npm run dev
```


> **Remind**
- 使用微信开发者工具新建项目，本地开发**选择 `dist` 目录**
- 微信开发者工具 -> 项目
  - **关闭** ES6 转 ES5
  - **关闭** 代码压缩上传
  - **关闭** 上传代码时样式文件自动补全
  - **开启** 开发环境不校验请求域名、TLS版本以及HTTPS证书


### Build&Watch

```
wepy build --watch
```

## Dependencies

- [wepy](https://github.com/Tencent/wepy)
- [ThinSDK-ts](https://github.com/NewEconoLab/neo-thinsdk-ts)
- [nodejs](https://github.com/nodejs/node)
- [secure-random-wechat](https://github.com/Liaojinghui/secure-random-wechat)


## LICENSE

[LICENSE](https://github.com/NewEconoLab/NeoWalletForWeChat/blob/master/LICENSE)

Please note that the open source protocol for this repository is **MIT**. This means that you have the freedom to run, copy, modify and distribute the software. 

## Author

- Jinghui Liao <jinghui@wayne.edu>

## Donation

- NEO/GAS: ASCjW4xpfr8kyVHY1J2PgvcgFbPYa1qX7F

