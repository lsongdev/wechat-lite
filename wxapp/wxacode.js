const { post } = require('./core');
const { requestToken } = require('./token');

/**
 * @docs https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.createQRCode.html
 * @param {*} path
 * @param {*} width
 */
const createQRCode = async (path, width = 430) => {
  const token = await requestToken();
  return post(`/cgi-bin/wxaapp/createwxaqrcode?access_token=${token}`, { path, width });
};

/**
 * @docs https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.get.html
 */
const get = () => {
  const token = await requestToken();
  return post(`/wxa/getwxacode?access_token=${token}`);
};

/**
 * @docs https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
 */
const getUnlimited = () => {
  const token = await requestToken();
  return post(`/wxa/getwxacodeunlimit?access_token=${token}`);
};

module.exports = {
  createQRCode,
  get,
  getUnlimited,
};
