const { API, postJSON } = require("./core");
/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html
 * @param {*} token
 * @param {*} template_id
 * @param {*} data
 * @param {*} url
 * @param {*} touser
 */
const send = (token, template_id, data, touser, url) => {
  Object.keys(data).forEach(function (key) {
    if (typeof data[key] === 'string') {
      data[key] = { value: data[key] };
    }
  });
  return postJSON(`${API}/message/template/send?access_token=${token}`, {
    touser,
    template_id,
    url,
    data,
  })
};
/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Message_Management/One-time_subscription_info.html
 * @param {*} token
 * @param {*} template_id
 * @param {*} title
 * @param {*} data
 * @param {*} appid
 * @param {*} pagepath
 * @param {*} url
 * @param {*} touser
 * @param {*} scene
 */
const subscribe = (token, template_id, title, data, touser, scene, miniprogram, url) => {
  return postJSON(`${API}/message/template/subscribe?access_token=${token}`, {
    touser,
    template_id,
    url,
    miniprogram,
    scene,
    title,
    data
  })
};

module.exports = {
  send,
  subscribe,
};
