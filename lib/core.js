const https = require('https');
const Stream = require('stream');
const { debuglog } = require('util');

const debug = debuglog('wechat-lite');

const API = 'https://api.weixin.qq.com';
const API_SNS = API + '/sns';
const API_CORE = API + '/cgi-bin';
const OPEN_WEIXIN = 'https://open.weixin.qq.com';

const readStream = stream => {
  const buffer = [];
  return new Promise((resolve, reject) => {
    stream
      .on('error', reject)
      .on('data', chunk => buffer.push(chunk))
      .on('end', () => resolve(Buffer.concat(buffer)))
  });
};

const request = (method, url, payload, headers) => {
  debug('request', method, url);
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method,
      headers,
    }, resolve);
    req.once('error', reject);
    if (payload instanceof Stream) {
      payload.pipe(req);
    } else if (typeof payload === 'object') {
      req.end(JSON.stringify(payload));
    } else {
      req.end(payload);
    }
  });
};

const get = (url, headers) =>
  request('get', url, '', headers);

const post = (url, payload, headers) =>
  request('post', url, payload, headers);

const getJSON = (url, headers) =>
  get(url, headers)
    .then(readStream)
    .then(JSON.parse);

const postJSON = (url, payload, headers) =>
  post(url, payload, headers)
    .then(readStream)
    .then(JSON.parse);

module.exports = {
  API, API_CORE, API_SNS, OPEN_WEIXIN,
  request, readStream,
  get, post, getJSON, postJSON,
};
