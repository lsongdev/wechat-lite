const WeChat = require('..');

const wechat = new WeChat({ appid: 'wxde40e023744664cb' });

wechat.qrconnect({
  redirect_uri: 'https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode'
}, (err, res) => {
  if(err) return console.error(err);
  switch(res.state){
    case 0:
      console.log('Your qrcode is', res.qrcode);
      break;
    case 404:
      console.log('scan ');
      break;
    case 405:
      console.log('Your login code is', res.code);
      break;
    case 666:
      console.log('expired');
      break;
  }
})

