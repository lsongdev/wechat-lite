const { decode } = require('fast-gbk');
const { get, readStream } = require('./core');

const parseJS = (code, scope) => {
  const window = {};
  if (scope) window[scope] = {};
  eval(code);
  return scope ? window[scope] : window;
};

const qrconnect = (appid, { redirect_uri, scope = 'snsapi_login', state = 'login' }) => Promise
  .resolve()
  .then(() => get(`https://open.weixin.qq.com/connect/qrconnect?appid=${appid}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}#wechat_redirect`))
  .then(readStream)
  .then(decode)
  .then(html => {
    const rQrcode = /src="\/connect\/qrcode\/(.+)"/;
    const rLongPull = /"https:\/\/long.open.weixin.qq.com\/connect\/l\/qrconnect\?uuid=(.+?)"/;
    const m = html.match(rQrcode);
    if (!m) {
      const err_msg = html.match(/<h4 class="weui_msg_title">(.*)<\/h4>/)[1];
      const err = new Error(err_msg);
      throw err;
    }
    const uuid = m[1];
    return uuid;
  });

const polling = uuid =>
  get(`https://long.open.weixin.qq.com/connect/l/qrconnect?uuid=${uuid}&_=${Date.now()}`)
    .then(readStream)
    .then(decode)
    .then(parseJS)
    .then(({ wx_errcode, wx_code }) => {
      return { wx_errcode, wx_code };
    });

module.exports = {
  qrconnect, polling,
};
