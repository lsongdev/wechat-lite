const { API, getJSON } = require("./core");

const authorize = (appid, callbackURL, scope = WeChat.AUTH_SCOPE.BASE, state) => {
  // NOTES: QUERYSTRING ORDER IS VERY IMPORTANT !!!
  const args = [
    { appid },
    { redirect_uri: callbackURL },
    { response_type: 'code' },
    { scope },
    { state }
  ];
  const api = 'https://open.weixin.qq.com/connect/oauth2/authorize?' + args.map((i, index) => {
    var [key] = Object.keys(args[index]),
      val = args[index][key];
    if (val) return [key, encodeURIComponent(val)].join('=');
  }).filter(Boolean).join('&');
  return api + '#wechat_redirect';
};

const access_token = (app, code, grant_type = 'authorization_code') => {
  const { appid, secret } = app;
  return getJSON(`${API}/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=${grant_type}`);
};

const refresh_token = (appid, refresh_token, grant_type = 'refresh_token') => {
  return getJSON(`${API}/sns/oauth2/refresh_token?appid=${appid}&grant_type=${grant_type}&refresh_token=${refresh_token}`);
};

const user = (token, openid, lang = 'zh_CN') => {
  return getJSON(`${API}/sns/userinfo?access_token=${token}&openid=${openid}&lang=${lang}`);
};

module.exports = {
  authorize,
  access_token,
  refresh_token,
  user,
};
