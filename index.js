'use strict';
const https         = require('https');
const crypto        = require('crypto');
const EventEmitter  = require('events');
const request       = require('superagent');
const debug         = require('debug')('wechat');
const ERROR_CODES   = require('./errcode');
const promiseify    = require('./promiseify');
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
      timeout   : 2000,
      api       : 'https://api.weixin.qq.com/cgi-bin'
    };
  }
  // request(u, data, headers){
  //   var parsed = url.parse(u, null, null, {decodeURIComponent: decodeURIComponent});
  //   var method = !!data ? 'POST' : 'GET'
  // }
  /**
   * [throwError description]
   * @param  {[type]}   err      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  throwError(msg, err){
    if(err){
      err.msg = msg;
    }else{
      err = new Error(msg);
    }
    // err.msg = msg;
    this.emit('error', err);
    throw err;
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
        if(!res.body) return self.throwError(`can not parse body from server response: ${res.text}`);
        //
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
    return promiseify(function(callback){
      request
      .get(`${self.options.api}/token`)
      .query({
        appid     : self.options.appId     ,
        secret    : self.options.appSecret ,
        grant_type: grantType || 'client_credential'
      })
      .timeout(self.options.timeout)
      .end(self.handleResponse(callback));
    });
  }
  /**
   * [getTicket description]
   * @param  {[type]} token [description]
   * @return {[type]}       [description]
   */
  getTicket(token){
    var self = this;
    return promiseify(function(callback){
      request
      .get(`${self.options.api}/ticket/getticket`)
      .query({
        type         : 'jsapi',
        access_token : token
      })
      .timeout(self.options.timeout)
      .end(self.handleResponse(callback));
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
      shasum.update(Object.keys(params).sort().map(function(key){
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
    return promiseify(function(callback){
      request
      .get(`${this.options.api}/getcallbackip`)
      .query({ access_token: token })
      .end(this.handleResponse(callback));
    });
  }
  parseJS(input){
    var obj = {};
    input
    .split(';')
    .filter(function(item){
      return !!item.trim();
    })
    .map(function(item){
      return item
        .replace('=', '$')
        .replace(/"/g, '')
        .replace('window.', '')
        .split('$')
        .map(function(k){
          return k.trim()
        })
    })
    .forEach(function(item){
      obj[ item[0] ] = item[1]
    });
    return obj;
  }
  getUUID(){
    var self = this;
    return new Promise(function(accept, reject){
      var buffer = [];
      var req = https.get('https://login.weixin.qq.com/jslogin?appid=wx782c26e4c19acffb', function(res){
        res.on('data', function(chunk){
          buffer.push(chunk);
        })
        .on('end', function(){
          accept(self.parseJS(buffer.join('')));
        })
        .on('error', reject);
      })
      .on('error', reject)
      .end();
    });
  }
  qrcode(uuid){
    return [ 'https://login.weixin.qq.com/qrcode', uuid ].join('/');
  }
  status(uuid){
    var self = this;
    return new Promise(function(accept, reject){
      var buffer = [];
      https.get('https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?uuid=$uuid&tip=1'.replace('$uuid', uuid), function(res){
        res.on('data', function(chunk){
          buffer.push(chunk);
        }).on('end', function(){
          accept(self.parseJS(buffer.join('')));
        }).on('error', reject);
      }).on('error', reject);
    });
  }
  login(u){
    // var u = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage?uuid=$uuid&ticket=$ticket'.replace('$uuid', uuid).replace('$ticket', ticket)
    // console.log(u);
    https.get(u, function(res){
      console.log(res.headers['set-cookie']);
    })
  }
}

module.exports = WechatAuth;
