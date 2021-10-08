// https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ID&corpsecret=SECRET
const { createRequest } = require('./request');

const token = (corpid, corpsecret) => {
  return createRequest('GET', `/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`)
};

module.exports = {
  token,
};