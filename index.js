'use strict';
const crypto        = require('crypto');
const EventEmitter  = require('events');
const R             = require('request-js');
const qs            = require('querystring');
const debug         = require('debug')('wechat');
const ERROR_CODES   = require('./errcode');
/**
 * Wechat
 */
class WeChat extends EventEmitter {
  /**
   * [constructor description]
   * @param  {[type]} appId     [description]
   * @param  {[type]} appSecret [description]
   * @return {[type]}           [description]
   */
  constructor(options){
    super();
    var defaults = {
      timeout   : 2000
    };
    for(var key in options){
      defaults[ key ] = options[ key ];
    }
    this.options = defaults;
  }
  /**
   * [handleResponse description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  handleResponse(callback){
    var self = this;
    return function(err, res){
      try{
        if(err)       return self.throwError(`network error: ${err}`);
        if(!res.ok)   return self.throwError(`server response status code is not ok (${res.statusCode})`);
        if(Object.keys(res.body)) res.body = JSON.parse(res.text);
          // return self.throwError(`can not parse body from server response: ${res.text}`);
        var errcode = res.body[ 'errcode' ];
        var errmsg  = res.body[ 'errmsg'  ] || ERROR_CODES[ errcode ];
        if(!!errcode) return self.throwError(`server receive an error: ${errmsg}`);
        //
        debug(res.body);
        callback(null, res.body);
      }catch(e){
        debug(e);
        callback(e);
      }
    };
  }
  /**
   * [getToken description]
   * @param  {[type]} grantType [description]
   * @return {[type]}           [description]
   * @docs http://mp.weixin.qq.com/wiki/11/0e4b294685f817b95cbed85ba5e82b8f.html
   */
  getToken(grantType){
    var self = this;
    return new R()
    .get('https://api.weixin.qq.com/cgi-bin/token')
    .query({
      appid     : self.options.appId     ,
      secret    : self.options.appSecret ,
      grant_type: grantType || 'client_credential'
    }).end().then(R.json())
  }
  /**
   * [getTicket description]
   * @param  {[type]} token [description]
   * @return {[type]}       [description]
   * @docs http://mp.weixin.qq.com/wiki/11/0e4b294685f817b95cbed85ba5e82b8f.html
   */
  getTicket(token){
    var self = this;
    return new R()
    .get('https://api.weixin.qq.com/cgi-bin/ticket/getticket')
    .query({
      type         : 'jsapi',
      access_token : token
    }).end().then(R.json())
  }
  /**
   * [genSignature description]
   * @param  {[type]} ticket [description]
   * @return {[type]}        [description]
   * @docs http://mp.weixin.qq.com/wiki/11/0e4b294685f817b95cbed85ba5e82b8f.html
   */
  genSignature(ticket){
    var self = this;
    function signature(params){
      var shasum = crypto.createHash('sha1');
      shasum.update(Object.keys(params).sort().map(function(key){
        return [ key , params[ key ] ].join('=');
      }).join('&'));
      params.appId     = self.options.appId;
      params.signature = shasum.digest('hex');
      return params;
    }
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
  }
  /**
   * [genSignature2 description]
   * @param  {[type]} token     [description]
   * @param  {[type]} timestamp [description]
   * @param  {[type]} nonce     [description]
   * @return {[type]}           [description]
   * @docs http://mp.weixin.qq.com/wiki/8/f9a0b8382e0b77d87b3bcc1ce6fbc104.html
   */
  genSignature2(token, timestamp, nonce){
    return crypto
      .createHash('sha1')
      .update(([]).slice.call(arguments).sort().join(''))
      .digest('hex');
  }
  /**
   * [checkSignature description]
   * @param  {[type]} params    [description]
   * @param  {[type]} signature [description]
   * @return {[type]}           [description]
   * @docs http://mp.weixin.qq.com/wiki/4/2ccadaef44fe1e4b0322355c2312bfa8.html
   */
  checkSignature(token, timestamp, nonce, signature, echostr){
    var sha1 = crypto.createHash('sha1');
    sha1.update([ token, timestamp, nonce ].sort().join(''));
    return (sha1.digest('hex') == signature) && (echostr || true);
  }
  /**
   * [getCallbackIP description]
   * @param  {[type]} token [description]
   * @return {[type]}       [description]
   * @docs http://mp.weixin.qq.com/wiki/0/2ad4b6bfd29f30f71d39616c2a0fcedc.html
   */
  getCallbackIP(token){
    var self = this;
    new R()
    .get(`${this.options.api}/getcallbackip`)
    .query({ access_token: token })
    .end().then(R.json());
  }
  /**
   * [getAuthorizeURL description]
   * @param  {[type]} callbackURL [description]
   * @param  {[type]} scope       [snsapi_base|snsapi_userinfo]
   * @param  {[type]} state       [description]
   * @return {[type]}             [description]
   * @docs http://mp.weixin.qq.com/wiki/4/9ac2e7b1f1d22e9e57260f6553822520.html
   */
  getAuthorizeURL(callbackURL, scope, state){
    // NOTES: QUERYSTRING ORDER IS VERY IMPORTANT !!!
    return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=$appId&redirect_uri=$redirect_uri&response_type=code&scope=$scope&state=$state#wechat_redirect'
      .replace('$appId'         , this.options.appId)
      .replace('$state'         , state || 'wechat')
      .replace('$scope'         , scope || WeChat.SCOPE.BASE)
      .replace('$redirect_uri'  , encodeURIComponent(callbackURL))

  }
  /**
   * [getAuthorizeToken description]
   * @param  {[type]} code [description]
   * @return {[type]}      [description]
   * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
   */
  getAuthorizeToken(code){
    var self = this;
    return new R()
    .get('https://api.weixin.qq.com/sns/oauth2/access_token')
    .query({
      code  : code                  ,
      appid : self.options.appId    ,
      secret: self.options.appSecret,
      grant_type: 'authorization_code'
    }).end().then(R.json())
  }
  /**
   * [checkAuthorizeToken description]
   * @param  {[type]} token  [description]
   * @param  {[type]} openId [description]
   * @return {[type]}        [description]
   * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
   */
  checkAuthorizeToken(token, openId){
    return new R()
    .get('https://api.weixin.qq.com/sns/auth')
    .query({
      openid: openId,
      access_token: token
    }).end().then(R.json())
  }
  /**
   * [refreshAuthorizeToken description]
   * @param  {[type]} refreshToken [description]
   * @return {[type]}              [description]
   * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
   */
  refreshAuthorizeToken(refreshToken){
    return new R()
    .get('https://api.weixin.qq.com/sns/oauth2/refresh_token')
    .query({
      appid         : this.options.appId,
      grant_type    : 'refresh_token'   ,
      refresh_token : refreshToken      ,
    }).end().then(R.json())
  }
  /**
   * [getUser description]
   * @param  {[type]} token    [description]
   * @param  {[type]} openId   [description]
   * @param  {[type]} language [description]
   * @return {[type]}          [description]
   * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
   */
  getUser(token, openId, language){
    var self = this;
    return new R()
    .get('https://api.weixin.qq.com/sns/userinfo')
    .query({
      access_token  : token ,
      openid        : openId,
      lang          : language || 'en'
    }).end().then(R.json());
  }
  /**
   * [parseJS description]
   * @param  {[type]} code  [description]
   * @param  {[type]} scope [description]
   * @return {[type]}       [description]
   */
  parseJS(code, scope){
    var window = {};
    if(scope){
      window[ scope ] = {};
    }
    eval(code);
    return scope ? window[scope] : window;
  }
  /**
   * [getUUID description]
   * @return {[type]} [description]
   */
  getUUID(){
    var self = this;
    return new R()
    .get('https://login.weixin.qq.com/jslogin')
    .query({ appid: this.options.appId })
    .end().then(function(res){
      return self.parseJS(res.text, 'QRLogin').uuid;
    })
  }
  /**
   * [qrcode description]
   * @param  {[type]} uuid [description]
   * @return {[type]}      [description]
   */
  qrcode(uuid){
    return [ 'https://login.weixin.qq.com/qrcode', uuid ].join('/');
  }
  /**
   * [status description]
   * @param  {[type]} uuid [description]
   * @return {[type]}      [description]
   */
  status(uuid){
    var self = this;
    return new R()
    .get('https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login')
    .query({'uuid': uuid})
    .end().then(function(res){
      return self.parseJS(res.text);
    })
  }
  /**
   * [login description]
   * @param  {[type]} uuid   [description]
   * @param  {[type]} ticket [description]
   * @return {[type]}        [description]
   */
  login(url){
    var data = { isQQ: /wx2.qq.com/.test(url) };
    // 'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage'
    return new R().get(url)
    .end().then(function(res){

      res.headers['set-cookie'].filter(function(cookie){
        return /wxuin|wxsid|webwx_data_ticket/.test(cookie);
      }).map(function(cookie){
        return cookie.split(';')[0].split('=');
      }).forEach(function(item){
        data[ item[0] ] = item[1];
      });
      return data;
    })
  }
}

/**
 * [SCOPE description]
 * @type {Object}
 */
WeChat.SCOPE = {
  BASE: 'snsapi_base',
  USER: 'snsapi_userinfo'
};

WeChat.Client = require('./client');

module.exports = WeChat;
