const { API, postJSON } = require('./core');

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/Adding_Permanent_Assets.html
 */
const add = async (token, articles) => {
  return postJSON(`${API}/cgi-bin/material/add_news?access_token=${token}`, { articles });
};

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/Getting_Permanent_Assets.html
 */
const get_material = async (token, media_id) => {
  return postJSON(`${API}/cgi-bin/material/get_material?access_token=${token}`, { media_id });
};

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/Deleting_Permanent_Assets.html
 */
const del_material = async (token, media_id) => {
  return postJSON(`${API}/cgi-bin/material/del_material?access_token=${token}`, { media_id });
};

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/Editing_Permanent_Rich_Media_Assets.html
 * @param {*} media_id
 * @param {*} articles
 * @param {*} index
 */
const update = async (media_id, articles, index = 0) => {
  return postJSON(`${API}/cgi-bin/material/update_news?access_token=${token}`, {
    media_id,
    index,
    articles,
  });
};

module.exports = {
  add, get_material, del_material, update
};
