const { post } = require('../lib/core');

/**
 * @docs https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.createQRCode.html
 * @param {*} path
 * @param {*} width
 */
const createwxaqrcode = (token, path, width = 430) => {
  return post(`/cgi-bin/wxaapp/createwxaqrcode?access_token=${token}`, { path, width });
};

/**
 * @docs https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.get.html
 */
const getwxacode = token => {
  return post(`/wxa/getwxacode?access_token=${token}`);
};

/**
 * @docs https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
 */
const getwxacodeunlimit = token => {
  return post(`/wxa/getwxacodeunlimit?access_token=${token}`);
};

module.exports = {
  createwxaqrcode,
  getwxacode,
  getwxacodeunlimit,
};
