'use strict';
const crypto        = require('crypto');
const EventEmitter  = require('events');
const ERROR_CODES   = require('./errcode');
const request       = require('superagent');
const debug         = require('debug')('wechat');
/**
 * WechatAuth
 */
class WechatAuth extends EventEmitter {
  /**
   * [constructor description]
   * @param  {[type]} appId     [description]
   * @param  {[type]} appSecret [description]
   * @return {[type]}           [description]
   */
  constructor(appId, appSecret){
    super();
    this.options = {
      appId     : appId,
      appSecret : appSecret,
      timeout   : 1000,
      api       : 'https://api.weixin.qq.com/cgi-bin'
    };
  }
  /**
   * [promiseify description]
   * @param  {[type]} creator [description]
   * @return {[type]}         [description]
   */
  promiseify(creator){
    var self = this;
    return new Promise(function(accept, reject){
      creator.call(self, function(err, res){
        if(err) return reject(err);
        accept(res);
      });
    });
  }
  /**
   * [throwError description]
   * @param  {[type]}   err      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  throwError(err, callback){
    debug(err);
    this.emit('error', err);
    callback(err);
  }
  /**
   * [handleResponse description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  handleResponse(callback){
    var self = this;
    return function(err, res){
      if(err)       return self.throwError(new Error('[wechat] network error', err),                                               callback);
      if(!res.ok)   return self.throwError(new Error('[wechat] server response status code is not ok ('   + res.statusCode + ')'), callback);
      if(!res.body) return self.throwError(new Error('[wechat] can not parse body from server response: ' + res.text),             callback);
      //
      var errcode = res.body[ 'errcode' ];
      var errmsg  = res.body[ 'errmsg'  ] || ERROR_CODES[ errcode ];
      if(!!errcode) return self.throwError(new Error('[wechat] server receive an error: ' + errmsg), callback);
      //
      callback(null, res.body);
    };
  }
  /**
   * [getToken description]
   * @param  {[type]} grantType [description]
   * @return {[type]}           [description]
   */
  getToken(grantType){
    return this.promiseify(function(callback){
      request
      .get(`${this.options.api}/token`)
      .query({
        appid     : this.options.appId     ,
        secret    : this.options.appSecret ,
        grant_type: grantType || 'client_credential'
      })
      .timeout(this.options.timeout)
      .end(this.handleResponse(callback));
    });
  }
  /**
   * [getTicket description]
   * @param  {[type]} token [description]
   * @return {[type]}       [description]
   */
  getTicket(token){
    return this.promiseify(function(callback){
      request
      .get(`${this.options.api}/ticket/getticket`)
      .query({
        type         : 'jsapi',
        access_token : token
      })
      .timeout(this.options.timeout)
      .end(this.handleResponse(callback));
    });
  }
  /**
   * [genSignature description]
   * @param  {[type]} ticket [description]
   * @return {[type]}        [description]
   */
  genSignature(ticket){
    function signature(params){
      var shasum = crypto.createHash('sha1');
      shasum.update(Object.keys(params).sort().map((key)=>{
        return [ key , params[ key ] ].join('=');
      }).join('&'));
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
}

module.exports = WechatAuth;
