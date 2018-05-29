const fs = require('fs');
const util = require('util');
const path = require('path');
const zlib = require('zlib');
const qs = require('querystring');
const https = require('https');
const mkdirp = require('mkdirp');
const WeChat = require('..');
const pack = require('./pack');
const unpack = require('./unpack');

class MINA extends WeChat {
  constructor(options) {
    super(Object.assign({
      appid: 'wxde40e023744664cb'
    }, options));
  }
  static pack(dir, to, options){
    const data = pack(dir, options);
    if(!to) return data;
    const writeFile = util.promisify(fs.writeFile);
    return writeFile(to, data);
  }
  static unpack(filename, to) {
    const data = fs.readFileSync(filename);
    const unpakced = unpack(data);
    if(!to) return unpakced;
    const writeFile = util.promisify(fs.writeFile);
    return Promise.all(unpakced.map(file => {
      const fullpath = path.join(to, file.filename);
      mkdirp(path.dirname(fullpath));
      return writeFile(fullpath, file.data);
    }));
  }
  login(code) {
    return new Promise((resolve, reject) => {
      https.get(`https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode?code=${code}&state=darwin`, res => {
        let buffer = '';
        res
          .on('error', reject)
          .on('data', chunk => buffer += chunk)
          .on('end', () => {
            const user = JSON.parse(buffer);
            resolve(Object.assign(user, {
              signature: res.headers['debugger-signature'],
              newticket: res.headers['debugger-newticket'],
            }));
          });
      });
    });
  }
  preview(filename, path) {
    return this.upload('/wxa-dev/testsource', filename, {
      path
    });
  }
  publish(filename, version = '0.0.1', message = '') {
    return this.upload('/wxa-dev/commitsource', filename, {
      'user-version': version,
      'user-desc': message,
    });
  }
  upload(type, data, options) {
    const { appid, newticket } = this;
    options = Object.assign({
      _r: Math.random(),
      gzip: 1,
      appid,
      newticket,
      platform: 0,
      ext_appid: '',
      os: 'darwin',
      path: 'pages/index/index',
      clientversion: '1021802080',
    }, options);
    const query = qs.stringify(options);
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') 
        data = fs.readFileSync(data);
      if(options.gzip)
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
  }
}

module.exports = MINA;