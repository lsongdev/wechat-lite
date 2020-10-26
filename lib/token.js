const { debuglog } = require('util');
const { getJSON, API } = require('./core');

const debug = debuglog('wechat-lite');

const token = ({ appid, secret, type = 'client_credential' }) => {
  debug('request access token', appid);
  return getJSON(`${API}/cgi-bin/token?grant_type=${type}&appid=${appid}&secret=${secret}`);
};

module.exports = {
  token,
};
