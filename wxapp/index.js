
const fs = require('fs');
const util = require('util');
const path = require('path');
const zlib = require('zlib');
const qs = require('querystring');
const https = require('https');
const pack = require('./pack');
const unpack = require('./unpack');
const wxacode = require('./wxacode');

module.exports = ({ appid = 'wxde40e023744664cb' }) => {
  return {
    pack(dir, to, options) {
      const data = pack(dir, options);
      if (!to) return data;
      const writeFile = util.promisify(fs.writeFile);
      return writeFile(to, data);
    },
    unpack(filename, to) {
      const data = fs.readFileSync(filename);
      const unpakced = unpack(data);
      if (!to) return unpakced;
      const writeFile = util.promisify(fs.writeFile);
      return Promise.all(unpakced.map(file => {
        const fullpath = path.join(to, file.filename);
        mkdirp(path.dirname(fullpath));
        return writeFile(fullpath, file.data);
      }));
    },
    login,
    preview(filename, path) {
      return upload(appid, newticket, '/wxa-dev/testsource', filename, { path });
    },
    publish(filename, version = '0.0.1', message = '') {
      return upload('/wxa-dev/commitsource', filename, {
        'user-version': version,
        'user-desc': message,
      });
    }
  };
};


module.exports = {
  wxacode,
};
