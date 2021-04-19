const { get, post, readStream } = require('../lib/core');

const login = code =>
  Promise
    .resolve()
    .then(() => get(`https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode?code=${code}&state=darwin`))
    .then(async res => {
      const user = await readStream(res);
      return Object.assign(user, {
        signature: res.headers['debugger-signature'],
        newticket: res.headers['debugger-newticket'],
      });
    });

const upload = (appid, newticket, type, data, options) => {
  options = Object.assign({
    _r: Math.random(),
    appid,
    newticket,
    platform: 0,
    ext_appid: '',
    os: 'darwin',
    path: 'pages/index/index',
    clientversion: '1021902010',
  }, options);
  if (typeof data === 'string')
    data = fs.readFileSync(data);
  if (options.gzip) {
    options.gzip = 1;
    data = zlib.gzipSync(data);
  }
  const query = qs.stringify(options);
  return post(`https://servicewechat.com${type}?${query}`, data, {
    'content-length': data.length
  });
};

module.exports = {
  login,
  upload,
};
