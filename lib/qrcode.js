const { API, postJSON } = require("./core");

/**
 * 生成带参数二维码
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html
 * @param {*} action_info
 * @param {*} param1
 */
const create = async (token, action_info, { action_name = 'QR_SCENE', expire_seconds }) => {
  const qrcode = await postJSON(`${API}/cgi-bin/qrcode/create?access_token=${token}`, {
    action_info,
    action_name,
    expire_seconds
  });
  qrcode.image = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + encodeURIComponent(qrcode.ticket);
  return qrcode;
};

module.exports = {
  create
};
