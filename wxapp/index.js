
const fs = require('fs');
const util = require('util');
const path = require('path');
const pack = require('./pack');
const unpack = require('./unpack');
const wxacode = require('./wxacode');
const { login, upload } = require('./devtools');

const WeChat = require('..');

const _pack = (dir, to, options) => {
  const data = pack(dir, options);
  if (!to) return data;
  const writeFile = util.promisify(fs.writeFile);
  return writeFile(to, data);
};

const _unpack = (filename, to) => {
  const data = fs.readFileSync(filename);
  const unpakced = unpack(data);
  if (!to) return unpakced;
  const writeFile = util.promisify(fs.writeFile);
  return Promise.all(unpakced.map(file => {
    const fullpath = path.join(to, file.filename);
    mkdirp(path.dirname(fullpath));
    return writeFile(fullpath, file.data);
  }));
};

class MINA extends WeChat {
  constructor() {
    super({ appid: 'wxde40e023744664cb' });
  }
  async login(fn) {
    const redirect_uri = 'https://mp.weixin.qq.com/xxx';
    const code = await this.qrconnect({ redirect_uri }, fn);
    const { newticket } = await login(code);
    return this.newticket = newticket;
  }
  preview(filename, path) {
    return upload(appid, newticket, '/wxa-dev/testsource', filename, { path });
  }
  publish(filename, version = '0.0.1', message = '') {
    return upload('/wxa-dev/commitsource', filename, {
      'user-version': version,
      'user-desc': message,
    });
  }
  async createwxaqrcode(path, width) {
    const token = await this.requestToken();
    return wxacode.createwxaqrcode(token, path, width);
  }
  async getwxacode() {
    const token = await this.requestToken();
    return wxacode.getwxacode(token);
  }
  async getwxacodeunlimit() {
    const token = await this.requestToken();
    return wxacode.getwxacodeunlimit(token);
  }

}

MINA.pack = _pack;
MINA.unpack = _unpack;

module.exports = MINA;
