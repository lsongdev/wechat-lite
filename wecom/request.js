const { request, readStream } = require('../lib/core');

const API = 'https://qyapi.weixin.qq.com/cgi-bin';

const createRequest = (method, url, { body, headers, withToken } = {}) => {
  url = API + url;
  return async ({ requestToken }) => {
    if (withToken) {
      const { access_token, expires_in } = await requestToken();
      url += `?access_token=${access_token}`;
    }
    // console.log(url);
    return Promise
      .resolve()
      .then(() => request(method, url, body, headers))
      .then(readStream)
      .then(JSON.parse)
  };
};

module.exports = {
  API,
  request,
  createRequest,
};