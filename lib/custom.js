const FormData = require('form-data');
const { postJSON, API, readStream } = require('./core');

// https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Service_Center_messages.html

const add = (token, user) => {
  return postJSON(`${API}/customservice/kfaccount/add?access_token=${token}`, user);
};

const del = (token, kf_account) => {
  return postJSON(`${API}/customservice/kfaccount/del?access_token=${token}`, { kf_account });
};

const list = (token) => {
  return getJSON(`/cgi-bin/customservice/getkflist?access_token=${token}`);
};

const avatar = (token, account, filename) => new Promise((resolve, reject) => {
  const formData = new FormData();
  formData.append('image', filename);
  formData.submit(`${API}/customservice/kfaccount/uploadheadimg?access_token=${token}&kf_account=${account}`, (err, res) => {
    if (err) return reject(err);
    readStream(res).then(resolve, reject);
  });
});

const send = (token, message) => {
  return postJSON(`${API}/cgi-bin/message/custom/send?access_token=${token}`, message);
};

/**
 * sendTo
 * @param {*} token
 * @param {*} touser
 * @param {*} msgtype
 * @param {*} msg
 */
const sendTo = (token, touser, msgtype, msg) => {
  return send(token, { touser, msgtype, [msgtype]: msg });
};

const typing = (token, touser, command = 'Typing') => {
  return postJSON(`${API}/cgi-bin/message/custom/typing?access_token=${token}`, {
    touser, command
  });
};

module.exports = {
  add, del, list, avatar, sendTo, typing,
};
