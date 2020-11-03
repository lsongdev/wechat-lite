const https = require('https');
const { get, readStream } = require('../lib/core');

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
    gzip: 1,
    appid,
    newticket,
    platform: 0,
    ext_appid: '',
    os: 'darwin',
    path: 'pages/index/index',
    clientversion: '1021902010',
  }, options);
  const query = qs.stringify(options);
  return new Promise((resolve, reject) => {
    if (typeof data === 'string')
      data = fs.readFileSync(data);
    if (options.gzip)
      data = zlib.gzipSync(data);
    const req = https.request({
      method: 'post',
      path: `${type}?${query}`,
      hostname: 'servicewechat.com',
      headers: {
        'content-length': data.length
      }
    }, res => {
      let buffer = '';
      res
        .on('error', reject)
        .on('data', chunk => buffer += chunk)
        .on('end', () => resolve(JSON.parse(buffer)))
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

module.exports = {
  login,
  upload,
};
