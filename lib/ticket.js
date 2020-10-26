const { getJSON, API_CORE } = require("./core");

const ticket = (token) => {
  return getJSON(`${API_CORE}/ticket/getticket?access_token=${token}&type=jsapi`);
};

module.exports = {
  ticket,
};
