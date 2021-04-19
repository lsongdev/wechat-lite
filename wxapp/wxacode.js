const { post, API, API_CORE } = require('../lib/core');

/**
 * wxacode.createQRCode
 * @docs https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.createQRCode.html
 * @param {*} path
 * @param {*} width
 */
const createwxaqrcode = (token, path, width = 430) => {
  return post(`${API_CORE}/cgi-bin/wxaapp/createwxaqrcode?access_token=${token}`, { path, width });
};

/**
 * wxacode.get
 * @docs https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.get.html
 */
const getwxacode = token => {
  return post(`${API}/wxa/getwxacode?access_token=${token}`);
};

/**
 * wxacode.getUnlimited
 * @docs https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
 */
const getwxacodeunlimit = token => {
  return post(`${API}/wxa/getwxacodeunlimit?access_token=${token}`);
};

module.exports = {
  createwxaqrcode,
  getwxacode,
  getwxacodeunlimit,
};
