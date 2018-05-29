'use strict';
const URI = require('url');
const xttp = require('xttp');
const https = require('https');
const crypto = require('crypto');
const EventEmitter = require('events');
const ERROR_CODES = require('../errcode');

/**
 * [WeChat description]
 * @param {[type]} options [description]
 */
class WeChat extends EventEmitter {
  constructor(options = {}) {
    super();
    const { appId, appSecret } = options;
    this.appid = appId;
    this.secret = appSecret;
    return Object.assign(this, options);
  }
  static parseJS(code, scope){
    const window = {};
    if(scope) window[ scope ] = {};
    eval(code);
    return scope ? window[scope] : window;
  };
  /**
   * [function description]
   * @param  {[type]} method [description]
   * @param  {[type]} url    [description]
   * @param  {[type]} query  [description]
   * @param  {[type]} data   [description]
   * @return {[type]}        [description]
   */
  static request(url, params){
    params.headers = params.headers || {};
    params.headers['content-type'] = 'application/json';
    return xttp(url, params);
  }
  requestToken() {
    return this.token().then(({ access_token }) => access_token);
  }
  /**
   * [getToken description]
   * @param  {[type]} grantType [description]
   * @return {[type]}           [description]
   * @docs http://mp.weixin.qq.com/wiki/11/0e4b294685f817b95cbed85ba5e82b8f.html
   */
  token(grant_type = 'client_credential') {
    const { appid, secret } = this;
    return new Promise(function (accept, reject) {
      https.get(URI.format({
        pathname: WeChat.API_CORE + '/token',
        query: {
          appid,
          secret,
          grant_type
        }
      }), res => {
        var buffer = ''; res
          .on('error', reject)
          .on('data', chunk => buffer += chunk)
          .on('end', () => {
            try {
              accept(JSON.parse(buffer))
            } catch (e) {
              reject(e);
            };
          });
      })
    });
  }
  /**
   * [getAuthorizeURL description]
   * @param  {[type]} callbackURL [description]
   * @param  {[type]} scope       [snsapi_base|snsapi_userinfo]
   * @param  {[type]} state       [description]
   * @return {[type]}             [description]
   * @docs http://mp.weixin.qq.com/wiki/4/9ac2e7b1f1d22e9e57260f6553822520.html
   */
  auth_url(callbackURL, scope = WeChat.AUTH_SCOPE.BASE, state) {
    const { appid } = this;
    // NOTES: QUERYSTRING ORDER IS VERY IMPORTANT !!!
    const args = [
      { appid: appid },
      { redirect_uri: callbackURL },
      { response_type: 'code' },
      { scope: scope },
      { state: state }
    ];
    const api = 'https://open.weixin.qq.com/connect/oauth2/authorize?' + args.map((i, index) => {
      var [key] = Object.keys(args[index]),
        val = args[index][key];
      if (val) return [key, encodeURIComponent(val)].join('=');
    }).filter(Boolean).join('&');
    return api + '#wechat_redirect';
  }
  /**
   * [getUser description]
   * @param  {[type]} token    [description]
   * @param  {[type]} openId   [description]
   * @param  {[type]} language [description]
   * @return {[type]}          [description]
   * @docs https://mp.weixin.qq.com/wiki/14/bb5031008f1494a59c6f71fa0f319c66.html
   */
  user(openid, lang = 'en') {
    return this.requestToken().then(access_token => {
      return WeChat.request(WeChat.API_CORE + '/user/info', {
        query: {
          access_token,
          openid,
          lang
        }
      }).then(res => res.json());
    });
  }
  /**
   * [getTicket description]
   * @param  {[type]} token [description]
   * @return {[type]}       [description]
   * @docs http://mp.weixin.qq.com/wiki/11/0e4b294685f817b95cbed85ba5e82b8f.html
   */
  ticket(token) {
    return Promise
      .resolve(token || this.requestToken())
      .then(access_token => {
        return WeChat.request(WeChat.API_CORE + '/ticket/getticket', {
          query: { type: 'jsapi', access_token }
        }).then(res => res.json());
      })
  }

  /**
   * [refreshAuthorizeToken description]
   * @param  {[type]} refreshToken [description]
   * @return {[type]}              [description]
   * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
   */
  auth_refresh_token(refresh_token) {
    const { appid } = this;
    return WeChat.request(WeChat.API_SNS + '/oauth2/refresh_token', {
      query: {
        appid,
        refresh_token,
        grant_type: 'refresh_token',
      }
    });
  }
  /**
   * [getAuthorizeToken description]
   * @param  {[type]} code [description]
   * @return {[type]}      [description]
   * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
   */
  auth_token(code, grant_type = 'authorization_code') {
    const { appid, secret } = this;
    return WeChat.request(WeChat.API_SNS + '/oauth2/access_token', {
      query: {
        code,
        appid,
        secret,
        grant_type
      }
    });
  }
  qrconnect({redirect_uri, scope = 'snsapi_login', state = 'login'}, callback){
    const { appid } = this;
    WeChat
    .request(`${WeChat.OPEN_WEIXIN}/connect/qrconnect?appid=${appid}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}#wechat_redirect`)
    .then(res => res.text({ encoding: 'gbk' }))
    .then(html => {
      const rQrcode   = /src="\/connect\/qrcode\/(.+)"/;
      const rLongPull = /"https:\/\/long.open.weixin.qq.com\/connect\/l\/qrconnect\?uuid=(.+?)"/;
      const m = html.match(rQrcode);
      if(!m){
        const err_msg = html.match(/<h4 class="weui_msg_title">(.*)<\/h4>/)[1];
        const err = new Error(err_msg);
        return callback(err);
      }
      const uuid   = m[1];
      const qrcode = `${WeChat.OPEN_WEIXIN}/connect/qrcode/${uuid}`;
      callback(null, { state: 0, qrcode });
      let lastState = 0;
      (function loop(){
        WeChat
        .request(`https://long.open.weixin.qq.com/connect/l/qrconnect?uuid=${uuid}&_=${Date.now()}`)
        .then(res => res.text())
        .then(WeChat.parseJS)
        .then(({ wx_errcode, wx_code }) => {
          if(wx_errcode !== 666){
            setTimeout(loop, 200);
          }
          if(lastState !== wx_errcode && wx_errcode === 405){
            lastState = wx_errcode;
            callback(null, { state: wx_errcode, code: wx_code });
          }
        })
      })();
    }).catch(err => process.nextTick(() => callback(err)));
  }
}

/**
 * [API description]
 * @type {String}
 */
WeChat.API = 'https://api.weixin.qq.com';
WeChat.API_SNS = WeChat.API + '/sns';
WeChat.API_CORE = WeChat.API + '/cgi-bin';
WeChat.OPEN_WEIXIN = 'https://open.weixin.qq.com';

/**
 * [SCOPE description]
 * @type {Object}
 */
WeChat.AUTH_SCOPE = {
  BASE: 'snsapi_base',
  USER: 'snsapi_userinfo'
};

/**
 * [QR_SCENE description]
 * @type {String}
 * @docs http://mp.weixin.qq.com/wiki/18/28fc21e7ed87bec960651f0ce873ef8a.html
 */
WeChat.QR_SCENE = 'QR_SCENE';
WeChat.QR_LIMIT_SCENE = 'QR_LIMIT_SCENE';
WeChat.QR_LIMIT_STR_SCENE = 'QR_LIMIT_STR_SCENE';

/**
 * [function description]
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
WeChat.Error = function (msg, code) {
  Error.call(this);
  this.name = 'WeChatError';
  this.code = code;
  this.message = msg;
};
/**
 * [prototype description]
 * @type {[type]}
 */
WeChat.Error.Codes = ERROR_CODES;
WeChat.Error.prototype = Error.prototype;

/**
 * [getCallbackIP description]
 * @param  {[type]} token [description]
 * @return {[type]}       [description]
 * @docs http://mp.weixin.qq.com/wiki/0/2ad4b6bfd29f30f71d39616c2a0fcedc.html
 */
WeChat.prototype.callback_ip = function () {
  return this.requestToken()
    .then(access_token => {
      return WeChat.request(WeChat.API_CORE + '/getcallbackip', {
        query: { access_token }
      }).then(res => res.json());
    })

};

/**
 * [checkAuthorizeToken description]
 * @param  {[type]} token  [description]
 * @param  {[type]} openId [description]
 * @return {[type]}        [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.auth_check_token = function (openId) {
  return WeChat.request(WeChat.API_SNS + '/auth', { openid: openId });
};

/**
 * [getUser description]
 * @param  {[type]} token    [description]
 * @param  {[type]} openId   [description]
 * @param  {[type]} language [description]
 * @return {[type]}          [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.auth_user = function (token, openId, language) {
  return WeChat.request(WeChat.API_SNS + '/userinfo', {
    access_token: token,
    openid: openId,
    lang: language || 'en'
  });
};

/**
 * [function description]
 * @param  {[type]} token  [description]
 * @param  {[type]} openId [description]
 * @param  {[type]} remark [description]
 * @return {[type]}        [description]
 */
WeChat.prototype.user_remark = function (openId, remark) {
  return this.requestToken().then(access_token => {
    return WeChat.request(WeChat.API_CORE + '/user/info/updateremark', {
      method: 'post',
      query: { access_token },
      body: {
        openid: openId,
        remark: remark
      }
    }).then(res => res.json());
  })

};

/**
 * [getUserList description]
 * @param  {[type]} token       [description]
 * @param  {[type]} next_openid [description]
 * @return {[type]}             [description]
 * @docs http://mp.weixin.qq.com/wiki/12/54773ff6da7b8bdc95b7d2667d84b1d4.html
 */
WeChat.prototype.users = function (next) {
  return this.requestToken().then(access_token => {
    return WeChat.request(WeChat.API_CORE + '/user/get', {
      query: {
        access_token,
        next_openid: next
      }
    }).then(res => res.json());
  });
};

/**
 * [getUserBatch description]
 * @param  {[type]} token [description]
 * @param  {[type]} list  [description]
 * @return {[type]}       [description]
 * @docs http://mp.weixin.qq.com/wiki/14/bb5031008f1494a59c6f71fa0f319c66.html
 */
WeChat.prototype.users_info = function (list, language) {
  language = language || 'en';
  list = list.map(function (item) {
    if (item.openid && item.lang)
      return item;
    if (item.openid) {
      item.lang = language;
      return item;
    }
    return {
      openid: item,
      lang: language
    };
  });
  return this.requestToken().then(access_token => {
    return WeChat.request(WeChat.API_CORE + '/user/info/batchget', {
      method: 'post',
      query: { access_token },
      body: { user_list: list }
    }).then(res => res.json());
  });
};

/**
 * [function description]
 * @param  {[type]} token [description]
 * @return {[type]}       [description]
 * @docs http://mp.weixin.qq.com/wiki/17/4dc4b0514fdad7a5fbbd477aa9aab5ed.html
 */
WeChat.prototype.menu_list = function (token) {
  return this.requestToken().then(access_token => {
    return WeChat.request(WeChat.API_CORE + '/get_current_selfmenu_info', {
      query: { access_token }
    }).then(res => res.json());
  });
};
/**
 * [function description]
 * @param  {[type]} to         [description]
 * @param  {[type]} templateId [description]
 * @param  {[type]} data       [description]
 * @param  {[type]} url        [description]
 * @return {[type]}            [description]
 * @docs http://mp.weixin.qq.com/wiki/17/304c1885ea66dbedf7dc170d84999a9d.html
 */
WeChat.prototype.template_send = function (templateId, data, url, to) {
  Object.keys(data).forEach(function (key) {
    if (typeof data[key] === 'string') {
      data[key] = { value: data[key] };
    }
  });
  return this.requestToken().then(access_token => {
    return WeChat.request(WeChat.API_CORE + '/message/template/send', {
      method: 'post',
      query: { access_token },
      body: {
        touser: to,
        template_id: templateId,
        url: url,
        data: data
      }
    }).then(res => res.json());
  });
};
/**
 * [wxopen_template_send description]
 * @param  {[type]} templateId [description]
 * @param  {[type]} page       [description]
 * @param  {[type]} value      [description]
 * @return {[type]}            [description]
 * @docs https://mp.weixin.qq.com/debug/wxadoc/dev/api/notice.html#接口说明
 */
WeChat.prototype.wxopen_template_send = function (to, form_id, templateId, value, data, page, color, emphasis_keyword) {
  return WeChat.request(`${WeChat.API_CORE}/message/wxopen/template/send`, {
    method: 'post',
    body: {
      touser: to,
      template_id: templateId,
      page: page,
      form_id: form_id,
      value: value,
      data: data,
      color: color,
      emphasis_keyword: emphasis_keyword
    }
  });
};
/**
 * [jscode2session description]
 * @param  {[type]} appId      [小程序唯一标识]
 * @param  {[type]} secret     [小程序的 app secret]
 * @param  {[type]} code       [登录时获取的 code]
 * @param  {[type]} grant_type [填写为 authorization_code]
 * @return {[type]}            [description]
 * @docs https://mp.weixin.qq.com/wxopen/wawiki?action=dir_list&type=develop&lang=zh_CN&token=1925614965
 */
WeChat.prototype.jscode2session = function (appId, secret, code, grant_type) {
  return this.requestToken().then(access_token => {
    return WeChat.request(WeChat.API_SNS + '/jscode2session', {
      query: {
        access_token,
        appid: appId,
        secret: secret,
        js_code: code,
        grant_type: grant_type || 'authorization_code'
      }
    }).then(res => res.json());
  });
};

/**
 * [function description]
 * @param  {[type]} id       [description]
 * @param  {[type]} name     [description]
 * @param  {[type]} password [description]
 * @return {[type]}          [description]
 * @docs https://mp.weixin.qq.com/wiki/1/70a29afed17f56d537c833f89be979c9.html
 */
WeChat.prototype.custom_add = function (id, name, password) {
  // TODO:
};

/**
 * [function description]
 * @param  {[type]} id       [description]
 * @param  {[type]} name     [description]
 * @param  {[type]} password [description]
 * @return {[type]}          [description]
 * @docs https://mp.weixin.qq.com/wiki/1/70a29afed17f56d537c833f89be979c9.html
 */
WeChat.prototype.custom_del = function (id, name, password) {
  // TODO:
};

/**
 * [function description]
 * @param  {[type]} id       [description]
 * @param  {[type]} name     [description]
 * @param  {[type]} password [description]
 * @return {[type]}          [description]
 * @docs https://mp.weixin.qq.com/wiki/1/70a29afed17f56d537c833f89be979c9.html
 */
WeChat.prototype.custom_set = function (id, name, password) {
  // TODO:
};

/**
 * [function description]
 * @param  {[type]} id       [description]
 * @param  {[type]} name     [description]
 * @param  {[type]} password [description]
 * @return {[type]}          [description]
 * @docs http://mp.weixin.qq.com/wiki/9/6fff6f191ef92c126b043ada035cc935.html
 */
WeChat.prototype.custom_get = function (id, name, password) {
  // TODO:
};

/**
 * [function description]
 * @param  {[type]} id  [description]
 * @param  {[type]} img [description]
 * @return {[type]}     [description]
 * @docs https://mp.weixin.qq.com/wiki/1/70a29afed17f56d537c833f89be979c9.html
 */
WeChat.prototype.custom_avatar = function (id, img) {
  // TODO:
};

/**
 * [function description]
 * @return {[type]} [description]
 * @docs https://mp.weixin.qq.com/wiki/1/70a29afed17f56d537c833f89be979c9.html
 */
WeChat.prototype.custom_list = function () {
  // TODO:
};

/**
 * [function description]
 * @param  {[type]} token   [description]
 * @param  {[type]} openId  [description]
 * @param  {[type]} msgType [description]
 * @param  {[type]} content [description]
 * @return {[type]}         [description]
 * @docs http://mp.weixin.qq.com/wiki/7/12a5a320ae96fecdf0e15cb06123de9f.html
 */
WeChat.prototype.custom_send = function (openId, msgType, content) {
  const body = {};
  body.touser = openId;
  body.msgtype = msgType;
  body[msgType] = content;
  return this.requestToken().then(access_token => {
    return WeChat.request(WeChat.API_CORE + '/message/custom/send', {
      method: 'post', body
    }).then(res => res.json());
  })
};

/**
 * [function description]
 * @param  {[type]} action [description]
 * @param  {[type]} info   [description]
 * @param  {[type]} expire [description]
 * @return {[type]}        [description]
 * @docs http://mp.weixin.qq.com/wiki/18/28fc21e7ed87bec960651f0ce873ef8a.html
 */
WeChat.prototype.qr = function (action, info, expire) {
  return this.requestToken().then(access_token => {
    return WeChat.request(WeChat.API_CORE + '/qrcode/create', {
      method: 'post',
      query: { access_token },
      body: {
        action_name: action,
        action_info: info,
        expire_seconds: expire
      }
    })
      .then(res => res.json())
      .then(function (res) {
        var url = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=';
        res.img = url + encodeURIComponent(res.ticket);
        return res;
      });
  })
};

/**
 * [function description]
 * @param  {[type]} url    [description]
 * @param  {[type]} action [description]
 * @return {[type]}        [description]
 * @docs https://mp.weixin.qq.com/wiki/10/165c9b15eddcfbd8699ac12b0bd89ae6.html
 */
WeChat.prototype.short_url = function (url, action) {
  action = action || 'long2short';
  return this.requestToken().then(access_token => {
    return WeChat.request(WeChat.API_CORE + '/shorturl', {
      method: 'post',
      query: { access_token },
      body: {
        action: action,
        long_url: url
      }
    }).then(res => res.json());
  })
};

/**
 * [genSignature description]
 * @param  {[type]} ticket [description]
 * @return {[type]}        [description]
 * @docs http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 */
WeChat.prototype.genSignature = function (ticket) {
  var self = this;
  /**
   * [signature description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  function signature(params) {
    var shasum = crypto.createHash('sha1');
    shasum.update(Object.keys(params).sort().map(function (key) {
      return [key, params[key]].join('=');
    }).join('&'));
    params.appId = self.options.appId;
    params.signature = shasum.digest('hex');
    return params;
  }
  /**
   * [function description]
   * @param  {[type]} url [description]
   * @return {[type]}     [description]
   */
  return function (url) {
    var nonce = Math.random().toString(36).substr(2);
    var timestamp = parseInt(new Date / 1000);
    return signature({
      jsapi_ticket: ticket,
      noncestr: nonce,
      timestamp: timestamp,
      url: url
    });
  }
};

/**
 * [checkSignature description]
 * @param  {[type]} params    [description]
 * @param  {[type]} signature [description]
 * @return {[type]}           [description]
 * @docs http://mp.weixin.qq.com/wiki/4/2ccadaef44fe1e4b0322355c2312bfa8.html
 */
WeChat.prototype.checkSignature = function (token, timestamp, nonce, signature, echostr) {
  var sha1 = crypto
    .createHash('sha1')
    .update([token, timestamp, nonce].sort().join(''))
    .digest('hex');
  return signature ? (sha1 == signature) && (echostr || true) : sha1;
};

/**
 * [exports description]
 * @type {[type]}
 */
module.exports = WeChat;
