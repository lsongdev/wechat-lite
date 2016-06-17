'use strict';
const url           = require('url');
const crypto        = require('crypto');
const EventEmitter  = require('events');
const R             = require('request-js');
const debug         = require('debug')('wechat');
const ERROR_CODES   = require('../errcode');
const http          = require('http');
const https         = require('https');

/**
 * [WeChat description]
 * @param {[type]} options [description]
 */
function WeChat(options, callback){
  var defaults = {};
  for(var key in options){
    defaults[ key ] = options[ key ];
  }
  this.options = defaults;
  
  if(callback) this.getToken().then(callback);
};

/**
 * [API description]
 * @type {String}
 */
WeChat.API      = 'https://api.weixin.qq.com';
WeChat.API_SNS  = WeChat.API + '/sns';
WeChat.API_CORE = WeChat.API + '/cgi-bin';

/**
 * [SCOPE description]
 * @type {Object}
 */
WeChat.SCOPE = {
  BASE: 'snsapi_base',
  USER: 'snsapi_userinfo'
};

/**
 * [function description]
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
WeChat.Error = function(msg, code){
  Error.call(this);
  this.code = code;
  this.message = msg;
};
/**
 * [prototype description]
 * @type {[type]}
 */
WeChat.Error.prototype = Error.prototype;

/**
 * [ERROR_CODES description]
 * @type {[type]}
 */
WeChat.Error.Codes = ERROR_CODES;

/**
 * [function description]
 * @param  {[type]} method [description]
 * @param  {[type]} url    [description]
 * @param  {[type]} query  [description]
 * @param  {[type]} data   [description]
 * @return {[type]}        [description]
 */
WeChat.prototype.request = function(method, _url, query, data){
  var options = url.parse(_url, true);
  options.search = null;
  options.method = method || 'GET';
  options.query = Object.assign(options.query, query);
  options = url.parse(url.format(options));
  return new Promise(function(accept, reject){
    var req = (options.protocol == 'http:' ? http:https).request(options, function(res){
      var buffer = [];
      res
      .on('error', reject)
      .on('data', function(chunk){
        buffer.push(chunk);
      })
      .on('end', function(){
        accept(JSON.parse(buffer.join('')));
      });
    });
    if(data) req.write(JSON.stringify(data));
    req.on('error', reject).end();
  });
};

/**
 * [getToken description]
 * @param  {[type]} grantType [description]
 * @return {[type]}           [description]
 * @docs http://mp.weixin.qq.com/wiki/11/0e4b294685f817b95cbed85ba5e82b8f.html
 */
WeChat.prototype.token = function(grantType) {
  grantType = grantType || 'client_credential';
  return new R()
  .get(WeChat.API_CORE + '/token')
  .query({
    appid     : this.options.appId     ,
    secret    : this.options.appSecret ,
    grant_type: grantType
  }).end().then(R.json())
};

/**
 * [getTicket description]
 * @param  {[type]} token [description]
 * @return {[type]}       [description]
 * @docs http://mp.weixin.qq.com/wiki/11/0e4b294685f817b95cbed85ba5e82b8f.html
 */
WeChat.prototype.ticket = function(token){
  return this.request('get', WeChat.API_CORE + '/ticket/getticket', {
    type:'jsapi'
  });
};

/**
 * [getCallbackIP description]
 * @param  {[type]} token [description]
 * @return {[type]}       [description]
 * @docs http://mp.weixin.qq.com/wiki/0/2ad4b6bfd29f30f71d39616c2a0fcedc.html
 */
WeChat.prototype.getCallbackIP = function(token) {
  return this.request('get', WeChat.API_CORE + '/getcallbackip');
};

/**
 * [genSignature description]
 * @param  {[type]} ticket [description]
 * @return {[type]}        [description]
 * @docs http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 */
WeChat.prototype.genSignature = function(ticket){
  var self = this;
  /**
   * [signature description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  function signature(params){
    var shasum = crypto.createHash('sha1');
    shasum.update(Object.keys(params).sort().map(function(key){
      return [ key , params[ key ] ].join('=');
    }).join('&'));
    params.appId     = self.options.appId;
    params.signature = shasum.digest('hex');
    return params;
  }
  /**
   * [function description]
   * @param  {[type]} url [description]
   * @return {[type]}     [description]
   */
  return function(url){
    var nonce     = Math.random().toString(36).substr(2);
    var timestamp = parseInt(new Date / 1000);
    return signature({
      jsapi_ticket : ticket   ,
      noncestr     : nonce    ,
      timestamp    : timestamp,
      url          : url
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
WeChat.prototype.checkSignature = function(token, timestamp, nonce, signature, echostr){
  var sha1 = crypto
    .createHash('sha1')
    .update([ token, timestamp, nonce ].sort().join(''))
    .digest('hex');
  return signature ? (sha1 == signature) && (echostr || true) : sha1;
};

/**
 * [getAuthorizeURL description]
 * @param  {[type]} callbackURL [description]
 * @param  {[type]} scope       [snsapi_base|snsapi_userinfo]
 * @param  {[type]} state       [description]
 * @return {[type]}             [description]
 * @docs http://mp.weixin.qq.com/wiki/4/9ac2e7b1f1d22e9e57260f6553822520.html
 */
WeChat.prototype.getAuthorizeURL = function(callbackURL, scope, state){
  // NOTES: QUERYSTRING ORDER IS VERY IMPORTANT !!!
  return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=$appId&redirect_uri=$redirect_uri&response_type=code&scope=$scope&state=$state#wechat_redirect'
    .replace('$appId'         , this.options.appId)
    .replace('$state'         , state || 'wechat')
    .replace('$scope'         , scope || WeChat.SCOPE.BASE)
    .replace('$redirect_uri'  , encodeURIComponent(callbackURL))
};

/**
 * [getAuthorizeToken description]
 * @param  {[type]} code [description]
 * @return {[type]}      [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.getAuthorizeToken = function(code){
  var self = this;
  return new R()
  .get(WeChat.API_SNS + '/oauth2/access_token')
  .query({
    code  : code                  ,
    appid : self.options.appId    ,
    secret: self.options.appSecret,
    grant_type: 'authorization_code'
  }).end().then(R.json())
};

/**
 * [checkAuthorizeToken description]
 * @param  {[type]} token  [description]
 * @param  {[type]} openId [description]
 * @return {[type]}        [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.checkAuthorizeToken = function(token, openId){
  return this.request('get', WeChat.API_SNS + '/auth', { openid: openId });
};

/**
 * [refreshAuthorizeToken description]
 * @param  {[type]} refreshToken [description]
 * @return {[type]}              [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.refreshAuthorizeToken = function(refreshToken){
  return new R()
  .get(WeChat.API_SNS + '/oauth2/refresh_token')
  .query({
    appid         : this.options.appId,
    grant_type    : 'refresh_token'   ,
    refresh_token : refreshToken      ,
  }).end().then(R.json())
};

/**
 * [getUser description]
 * @param  {[type]} token    [description]
 * @param  {[type]} openId   [description]
 * @param  {[type]} language [description]
 * @return {[type]}          [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.auth_user = function(openId, language){
  return this.request('get', WeChat.API_CORE + '/userinfo', {
    openid: openId,
    lang  : language || 'en'
  });
};

/**
 * [getUser description]
 * @param  {[type]} token    [description]
 * @param  {[type]} openId   [description]
 * @param  {[type]} language [description]
 * @return {[type]}          [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.user = function(token, openId, language){
  return this.request('get', WeChat.API_CORE + '/user/info', {
    openid: openId,
    lang  : language || 'en'
  });
};

/**
 * [getUserList description]
 * @param  {[type]} token       [description]
 * @param  {[type]} next_openid [description]
 * @return {[type]}             [description]
 * @docs http://mp.weixin.qq.com/wiki/12/54773ff6da7b8bdc95b7d2667d84b1d4.html
 */
WeChat.prototype.users = function(next){
  return this.request('get', WeChat.API_CORE + '/user/get', {
    next_openid: next
  });
};

/**
 * [getUserBatch description]
 * @param  {[type]} token [description]
 * @param  {[type]} list  [description]
 * @return {[type]}       [description]
 * @docs http://mp.weixin.qq.com/wiki/14/bb5031008f1494a59c6f71fa0f319c66.html
 */
WeChat.prototype.getUserBatch = function(token, list, language){
  language = language || 'en';
  list = list.map(function(item){
    if(item.openid && item.lang)
      return item;
    if(item.openid){
      item.lang = language;
      return item;
    }
    return {
      openid: item,
      lang  : language
    };
  });
  return new R()
  .post(WeChat.API_CORE + '/user/info/batchget')
  .send({ user_list: list })
  .query({
    access_token: token
  }).end().then(R.json());
};


/**
 * [parseJS description]
 * @param  {[type]} code  [description]
 * @param  {[type]} scope [description]
 * @return {[type]}       [description]
 */
WeChat.prototype.parseJS = function(code, scope){
  var window = {};
  if(scope){
    window[ scope ] = {};
  }
  eval(code);
  return scope ? window[scope] : window;
};

/**
 * [getUUID description]
 * @return {[type]} [description]
 */
WeChat.prototype.getUUID = function(){
  var self = this;
  return new R()
  .get('https://login.weixin.qq.com/jslogin')
  .query({ appid: this.options.appId })
  .end().then(function(res){
    return self.parseJS(res.text, 'QRLogin').uuid;
  })
};

/**
 * [qrcode description]
 * @param  {[type]} uuid [description]
 * @return {[type]}      [description]
 */
WeChat.prototype.qrcode = function(uuid){
  return [ 'https://login.weixin.qq.com/qrcode', uuid ].join('/');
};

/**
 * [status description]
 * @param  {[type]} uuid [description]
 * @return {[type]}      [description]
 */
WeChat.prototype.status = function(uuid){
  var self = this;
  return new R()
  .get('https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login')
  .query({'uuid': uuid})
  .end().then(function(res){
    return self.parseJS(res.text);
  })
};

/**
 * [login description]
 * @param  {[type]} uuid   [description]
 * @param  {[type]} ticket [description]
 * @return {[type]}        [description]
 */
WeChat.prototype.login = function(query){
  return new R().get(`https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage${query}`)
  .end().then(function(res){
    var data = { };
    res.headers['set-cookie'].filter(function(cookie){
      return /wxuin|wxsid|webwx_data_ticket/.test(cookie);
    }).map(function(cookie){
      return cookie.split(';')[0].split('=');
    }).forEach(function(item){
      data[ item[0] ] = item[1];
    });
    return data;
  });
};

/**
 * [function description]
 * @param  {[type]} token [description]
 * @return {[type]}       [description]
 * @docs http://mp.weixin.qq.com/wiki/17/4dc4b0514fdad7a5fbbd477aa9aab5ed.html
 */
WeChat.prototype.menu_list = function(token){
  return this.request('get', WeChat.API_CORE + '/get_current_selfmenu_info');
};
/**
 * [function description]
 * @param  {[type]} token  [description]
 * @param  {[type]} openId [description]
 * @param  {[type]} remark [description]
 * @return {[type]}        [description]
 */
WeChat.prototype.user_remark = function(token, openId, remark) {
  return new R()
  .post(WeChat.API_CORE + '/user/info/updateremark')
  .query('access_token', token)
  .send({
    openid: openId,
    remark: remark
  })
  .end().then(R.json());
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
WeChat.prototype.template_send = function(token, openId, templateId, data, url){
  return new R()
  .post(WeChat.API_CORE + '/message/template/send')
  .query('access_token', token)
  .send({
    touser: openId,
    template_id: templateId,
    url: url,
    data: data
  })
  .end().then(R.json());
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
WeChat.prototype.custom_send = function(token, openId, msgType, content){
  var data = {};
  data.touser = openId;
  data.msgtype = msgType;
  data[msgType] = content;
  return new R()
  .post(WeChat.API_CORE + '/message/custom/send')
  .query('access_token', token)
  .send(data)
  .end().then(R.json());
};

/**
 * [exports description]
 * @type {[type]}
 */
module.exports = WeChat;
