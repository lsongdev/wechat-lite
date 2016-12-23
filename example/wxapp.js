const { MINA } = require('..');

const devtools = new MINA();

devtools.qrconnect({
  redirect_uri: 'https://mp.weixin.qq.com/xxx'
}, async (err, { state, qrcode, code }) => {
  switch(state){
    case 0:
      console.log('qrcode', qrcode);
      break;
    case 405:
      console.log('scan success', code);
      const user = await devtools.login(code);
      console.log('user', user);
      break;
  }
});
