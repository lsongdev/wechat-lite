const FormData = require('form-data');
const { API, postJSON, readStream } = require('./core');

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/New_temporary_materials.html
 */
const upload = async (token, filename, type) => new Promise((resolve, reject) => {
  const form = new FormData();
  form.append('type', type);
  form.append('media', filename);
  form.submit(`${API}/cgi-bin/media/upload?access_token=${token}`, (err, res) => {
    if (err) return reject(err);
    readStream(res).then(JSON.parse).then(resolve, reject);
  });
});

const uploadimg = async (token, filename) => new Promise((resolve, reject) => {
  const form = new FormData();
  form.append('media', filename);
  form.submit(`${API}/cgi-bin/media/uploadimg?access_token=${token}`, (err, res) => {
    if (err) return reject(err);
    readStream(res).then(JSON.parse).then(resolve, reject);
  });
});

const get = async (token, media_id) => {
  return postJSON(`${API}/cgi-bin/media/get?access_token=${token}&media_id=${media_id}`);
};

module.exports = {
  upload, uploadimg, get,
};
