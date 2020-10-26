const { API, getJSON, postJSON } = require('./core.js');

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/User_Management/Getting_a_User_List.html
 * @param {*} next_openid
 */
const list = async (token, next_openid = '') => {
  return getJSON(`${API}/cgi-bin/user/get?access_token=${token}&next_openid=${next_openid}`);
};

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/User_Management/Get_users_basic_information_UnionID.html#UinonId
 * @param {*} openid
 * @param {*} lang
 */
const info = async (token, openid, lang = 'zh_CN') => {
  return getJSON(`${API}/cgi-bin/user/info?access_token=${token}&openid=${openid}&lang=${lang}`);
};

/**
 * https://developers.weixin.qq.com/doc/offiaccount/User_Management/Configuring_user_notes.html
 * @param {*} openid
 * @param {*} remark
 */
const remark = async (token, openid, remark) => {
  return postJSON(`${API}/cgi-bin/user/info/updateremark?access_token=${token}`, { openid, remark });
};

module.exports = {
  list, info, remark
};
