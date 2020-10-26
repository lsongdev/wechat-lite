const { API, getJSON, postJSON } = require('./core');

/**
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html
 */
const create = menu => {
  return postJSON(`${API}/cgi-bin/menu/create?access_token=${token}`, menu);
};

/**
 * https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Querying_Custom_Menus.html
 */
const get = (token) => {
  return getJSON(`${API}/cgi-bin/menu/get?access_token=${token}`);
};

/**
 * https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Deleting_Custom-Defined_Menu.html
 */
const del = (token) => {
  return getJSON(`${API}/cgi-bin/menu/delete?access_token=${token}`);
};

/**
 * 创建个性化菜单
 * @docs https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Personalized_menu_interface.html
 */
const addconditional = (token, menu) => {
  return postJSON(`${API}/cgi-bin/menu/addconditional?access_token=${token}`, menu);
};

const delconditional = (token) => {
  return postJSON(`${API}/cgi-bin/menu/delconditional?access_token=${token}`);
};

const trymatch = (token, user_id) => {
  return postJSON(`${API}/cgi-bin/menu/trymatch?access_token=${token}`, { user_id });
};

module.exports = {
  create, get, del,
  addconditional, delconditional,
  trymatch,
};
