'use strict';
const url           = require('url');
const util          = require('util');
const http          = require('http');
const https         = require('https');
const crypto        = require('crypto');
const EventEmitter  = require('events');
const ERROR_CODES   = require('../errcode');


/**
 * [WeChat description]
 * @param {[type]} options [description]
 */
function WeChat(options, requestToken){
  EventEmitter.call(this);
  var defaults = {};
  for(var key in options)
    defaults[ key ] = options[ key ];
  this.options = defaults;
  // requestToken
  this.requestToken = new Promise((requestToken || function(done){
    this.token().then(function(token){ 
      return token.access_token;
    }).then(done);
  }).bind(this));
  return this;
};

/**
 * [inherits description]
 * @param  {[type]} WeChat       [description]
 * @param  {[type]} EventEmitter [description]
 * @return {[type]}              [description]
 */
util.inherits(WeChat, EventEmitter);

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
WeChat.AUTH_SCOPE = {
  BASE: 'snsapi_base',
  USER: 'snsapi_userinfo'
};

/**
 * [QR_SCENE description]
 * @type {String}
 * @docs http://mp.weixin.qq.com/wiki/18/28fc21e7ed87bec960651f0ce873ef8a.html
 */
WeChat.QR_SCENE           = 'QR_SCENE';
WeChat.QR_LIMIT_SCENE     = 'QR_LIMIT_SCENE';
WeChat.QR_LIMIT_STR_SCENE = 'QR_LIMIT_STR_SCENE';

/**
 * [function description]
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
WeChat.Error = function(msg, code){
  Error.call(this);
  this.name = 'WeChatError';
  this.code = code;
  this.message = msg;
};
/**
 * [prototype description]
 * @type {[type]}
 */
WeChat.Error.Codes     = ERROR_CODES;
WeChat.Error.prototype = Error.prototype;

/**
 * [function description]
 * @param  {[type]} method [description]
 * @param  {[type]} url    [description]
 * @param  {[type]} query  [description]
 * @param  {[type]} data   [description]
 * @return {[type]}        [description]
 */
WeChat.prototype.request = function(method, url_, query, data, parser, b, headers){
  parser = parser || JSON.parse;
  return this.requestToken.then(function(token){
    query = query || {};
    if(query.access_token === null){
      delete query.access_token;
    }else{
      query.access_token = query.access_token || token;
    }
    var options = url.parse(url_, true);
    options.search = null;
    options.query = Object.assign(options.query, query);
    options = url.parse(url.format(options));
    options.method = method || 'GET';
    if(data){
      data = JSON.stringify(data);
      options.headers = options.headers || {};
      options.headers['Content-Type'] = 'application/json; charset=utf-8';
      options.headers['Content-Length'] = new Buffer(data).length;
      if(headers){
        for(var key in headers) options.headers[ key ] = headers[ key ];
      }
    }
    if(b) options.path = unescape(options.path);
    return new Promise(function(accept, reject){
      var req = (options.protocol == 'http:' ? http:https).request(options, function(res){
        var buffer = [];
        res
        .on('error', reject)
        .on('data', function(chunk){
          buffer.push(chunk);
        })
        .on('end', function(){
          accept(parser(buffer.join(''), res));
        });
      });
      if(data) req.write(data);
      req.on('error', reject);
      req.end();
    });
    
  });
};

/**
 * [getToken description]
 * @param  {[type]} grantType [description]
 * @return {[type]}           [description]
 * @docs http://mp.weixin.qq.com/wiki/11/0e4b294685f817b95cbed85ba5e82b8f.html
 */
WeChat.prototype.token = function(grantType) {
  var self = this;
  grantType = grantType || 'client_credential';
  return new Promise(function(accept, reject){
    https.get(url.format({
      pathname: WeChat.API_CORE + '/token',
      query: {
        appid        : self.options.appId     ,
        secret       : self.options.appSecret ,
        grant_type   : grantType
      }
    }), function(res){
      var buffer = [];
      res.on('data', function(chunk){
        buffer.push(chunk);
      }).on('end', function(){
        try{
          accept(JSON.parse(buffer.join('')))
        }catch(e){
          reject(e);
        };
      }).on('error', reject);
    })
  });
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
WeChat.prototype.callback_ip = function() {
  return this.request('get', WeChat.API_CORE + '/getcallbackip');
};

/**
 * [getAuthorizeURL description]
 * @param  {[type]} callbackURL [description]
 * @param  {[type]} scope       [snsapi_base|snsapi_userinfo]
 * @param  {[type]} state       [description]
 * @return {[type]}             [description]
 * @docs http://mp.weixin.qq.com/wiki/4/9ac2e7b1f1d22e9e57260f6553822520.html
 */
WeChat.prototype.auth_url = function(callbackURL, scope, state){
  var api = 'https://open.weixin.qq.com/connect/oauth2/authorize';
  // NOTES: QUERYSTRING ORDER IS VERY IMPORTANT !!!
  var args = [
    { appid        : this.options.appId               },
    { redirect_uri : callbackURL                      },
    { response_type: 'code'                           },
    { scope        : scope ||  WeChat.AUTH_SCOPE.BASE },
    { state        : state                            }
  ];
  api += '?' + args.map(function(i, index){
    var key = Object.keys(args[ index ])[0],
        val = args[ index ][ key ];
    if(val) return [ key, encodeURIComponent(val) ].join('=');
  }).filter(function(arg){ return !!arg; }).join('&');
  return api + '#wechat_redirect';
};

/**
 * [getAuthorizeToken description]
 * @param  {[type]} code [description]
 * @return {[type]}      [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.auth_token = function(code, grantType){
  return this.request('get', WeChat.API_SNS + '/oauth2/access_token', {
    code      : code                  ,
    appid     : this.options.appId    ,
    secret    : this.options.appSecret,
    grant_type: grantType || 'authorization_code'
  });
};

/**
 * [checkAuthorizeToken description]
 * @param  {[type]} token  [description]
 * @param  {[type]} openId [description]
 * @return {[type]}        [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.auth_check_token = function(openId){
  return this.request('get', WeChat.API_SNS + '/auth', { openid: openId });
};

/**
 * [refreshAuthorizeToken description]
 * @param  {[type]} refreshToken [description]
 * @return {[type]}              [description]
 * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
 */
WeChat.prototype.auth_refresh_token = function(refreshToken){
  return this.request('get', WeChat.API_SNS + '/oauth2/refresh_token', {
    appid         : this.options.appId,
    grant_type    : 'refresh_token'   ,
    refresh_token : refreshToken      ,
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
WeChat.prototype.auth_user = function(token, openId, language){
  return this.request('get', WeChat.API_SNS + '/userinfo', {
    access_token : token,
    openid       : openId,
    lang         : language || 'en'
  });
};

/**
 * [getUser description]
 * @param  {[type]} token    [description]
 * @param  {[type]} openId   [description]
 * @param  {[type]} language [description]
 * @return {[type]}          [description]
 * @docs https://mp.weixin.qq.com/wiki/14/bb5031008f1494a59c6f71fa0f319c66.html
 */
WeChat.prototype.user = function(openId, language){
  return this.request('get', WeChat.API_CORE + '/user/info', {
    openid: openId,
    lang  : language || 'en'
  });
};

/**
 * [function description]
 * @param  {[type]} token  [description]
 * @param  {[type]} openId [description]
 * @param  {[type]} remark [description]
 * @return {[type]}        [description]
 */
WeChat.prototype.user_remark = function(openId, remark) {
  return this.request('post', WeChat.API_CORE + '/user/info/updateremark', null, {
    openid: openId,
    remark: remark
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
WeChat.prototype.users_info = function(list, language){
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
  return this.request('post', WeChat.API_CORE + '/user/info/batchget', null, { user_list: list });
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
 * @param  {[type]} to         [description]
 * @param  {[type]} templateId [description]
 * @param  {[type]} data       [description]
 * @param  {[type]} url        [description]
 * @return {[type]}            [description]
 * @docs http://mp.weixin.qq.com/wiki/17/304c1885ea66dbedf7dc170d84999a9d.html
 */
WeChat.prototype.template_send = function(templateId, data, url, to){
  Object.keys(data).forEach(function(key){
    if(typeof data[key] == 'string'){
      data[key] = { value: data[key] };
    }
  });
  return this.request('post', WeChat.API_CORE + '/message/template/send', null, {
    touser      : to,
    template_id : templateId,
    url         : url,
    data        : data
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
WeChat.prototype.wxopen_template_send = function(to, form_id, templateId, value, page, color, emphasis_keyword){
  return this.request('post', WeChat.API_CORE + '/message/wxopen/template/send', null, {
    touser          : to         ,
    template_id     : templateId ,
    page            : page       ,
    form_id         : form_id    ,
    value           : value      ,
    color           : color      ,
    emphasis_keyword: emphasis_keyword
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
WeChat.prototype.jscode2session = function(appId, secret, code, grant_type){
  return this.request('get', WeChat.API_SNS + '/jscode2session', {
    appid     : appId ,
    secret    : secret,
    js_code   : code  ,
    grant_type: grant_type || 'authorization_code'
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
WeChat.prototype.custom_add = function(id, name, password){
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
WeChat.prototype.custom_del = function(id, name, password){
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
WeChat.prototype.custom_set = function(id, name, password){
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
WeChat.prototype.custom_get = function(id, name, password){
  // TODO:
};

/**
 * [function description]
 * @param  {[type]} id  [description]
 * @param  {[type]} img [description]
 * @return {[type]}     [description]
 * @docs https://mp.weixin.qq.com/wiki/1/70a29afed17f56d537c833f89be979c9.html
 */
WeChat.prototype.custom_avatar = function(id, img){
  // TODO:
};

/**
 * [function description]
 * @return {[type]} [description]
 * @docs https://mp.weixin.qq.com/wiki/1/70a29afed17f56d537c833f89be979c9.html
 */
WeChat.prototype.custom_list = function(){
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
WeChat.prototype.custom_send = function(openId, msgType, content){
  var data = {};
  data.touser = openId;
  data.msgtype = msgType;
  data[ msgType ] = content;
  return this.request('post', WeChat.API_CORE + '/message/custom/send', null, data);
};

/**
 * [function description]
 * @param  {[type]} action [description]
 * @param  {[type]} info   [description]
 * @param  {[type]} expire [description]
 * @return {[type]}        [description]
 * @docs http://mp.weixin.qq.com/wiki/18/28fc21e7ed87bec960651f0ce873ef8a.html
 */
WeChat.prototype.qr = function(action, info, expire){
  return this.request('post', WeChat.API_CORE + '/qrcode/create', null, {
    action_name: action,
    action_info: info,
    expire_seconds: expire
  }).then(function(res){
    var url = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=';
    res.img = url + encodeURIComponent(res.ticket);
    return res;
  });
};

/**
 * [function description]
 * @param  {[type]} url    [description]
 * @param  {[type]} action [description]
 * @return {[type]}        [description]
 * @docs https://mp.weixin.qq.com/wiki/10/165c9b15eddcfbd8699ac12b0bd89ae6.html
 */
WeChat.prototype.short_url = function(url, action){
  action = action || 'long2short';
  return this.request('post', WeChat.API_CORE + '/shorturl', null, {
    action  : action,
    long_url: url
  });
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
 * [exports description]
 * @type {[type]}
 */
module.exports = WeChat;
