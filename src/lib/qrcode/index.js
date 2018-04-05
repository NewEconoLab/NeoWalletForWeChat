import { QRCode, QRErrorCorrectLevel } from './qrcode'

//重新定义这个方法，不仅仅画二维码，还画整个canvas
function drawQrcode(options = {}) {
  options = Object.assign({
    WH: 256,
    name: '',
    addr: '',
    currTime: '',
    typeNumber: -1,
    correctLevel: QRErrorCorrectLevel.H,
    background: '#ffffff',
    foreground: '#000000'
  }, options)

  if (!options.canvasId) {
    console.warn('please you set canvasId!')
    return
  }

  createCanvas()

  function createCanvas() {
    // create the qrcode itself
    var qrcode = new QRCode(options.typeNumber, options.correctLevel)
    qrcode.addData(options.text)
    qrcode.make()

    // get canvas context
    var ctx = wx.createCanvasContext && wx.createCanvasContext(options.canvasId)

    //白色背景
    ctx.setFillStyle('white');
    ctx.fillRect(0, 0, options.CWH, options.CWH + 50)

    var label_y = 25;

    //绘制头部信息
    ctx.setFillStyle('#27adf1')
    // ctx.setFontSize(16);
    ctx.setTextBaseline('middle');
    ctx.setFontSize(18);
    ctx.setTextAlign('left')
    ctx.fillText(options.name, 20, label_y);

    var addr_y = label_y + 25;
    ctx.setFillStyle('#a3a3a3')
    ctx.setFontSize(13);
    ctx.setTextAlign('left')
    ctx.fillText(options.addr, 20, addr_y);

    var qrcode_y = addr_y + 30;

    var qrWH = options.WH * 0.6;
    var tileW = qrWH / qrcode.getModuleCount()
    var tileH = qrWH / qrcode.getModuleCount()
    var peek = Math.ceil((options.CWH - qrWH) / 2);
    // draw in the canvas
    for (var row = 0; row < qrcode.getModuleCount(); row++) {
      for (var col = 0; col < qrcode.getModuleCount(); col++) {
        var style = qrcode.isDark(row, col) ? options.foreground : options.background
        ctx.setFillStyle(style)
        var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW))
        var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW))
        ctx.fillRect(Math.round(col * tileW) + peek, Math.round(row * tileH) + qrcode_y, w, h)
      }
    }

    var label_y = qrcode_y + qrWH + 30;
    ctx.setTextAlign('center')
    ctx.setFillStyle('#000000')
    ctx.fillText('NEO账户备份/Back Up', options.CWH / 2, label_y)

    var time_y = label_y + 20;
    ctx.setFillStyle('#a3a3a3')
    ctx.setFontSize(12);
    ctx.fillText(options.currTime, options.CWH / 2, time_y)

    ctx.draw()
  }
}

export default drawQrcode
