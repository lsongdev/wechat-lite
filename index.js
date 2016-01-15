'use strict';
const http          = require('http');
const https         = require('https');
const crypto        = require('crypto');
const EventEmitter  = require('events');
const url           = require('url');
const qs            = require('querystring');
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
      timeout   : 2000
    };
  }
  cookie(cookies){
    return Object.keys(cookies).map(function(key){
      return [ key, cookies[ key ] ].join('=');
    }).join('; ');
  }
  read(res, callback){
    var buffer = [];
    res.on('data', function(chunk){
      buffer.push(chunk);
    }).on('end', function(){
      callback(null, buffer.join(''));
    }).on('error', callback);
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
        if(Object.keys(res.body)) res.body = JSON.parse(res.text);
          // return self.throwError(`can not parse body from server response: ${res.text}`);
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
      .get(`https://api.weixin.qq.com/cgi-bin/token`)
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
      .get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket`)
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
    var self = this;
    return promiseify(function(callback){
      request
      .get(`${this.options.api}/getcallbackip`)
      .query({ access_token: token })
      .end(self.handleResponse(callback));
    });
  }
  /**
   * [getAuthorizeToken description]
   * @param  {[type]} code [description]
   * @return {[type]}      [description]
   * @docs https://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html
   */
  getAuthorizeToken(code){
    var self = this;
    return promiseify(function(callback){
      request
      .get('https://api.weixin.qq.com/sns/oauth2/access_token')
      .query({
        appid : self.options.appId,
        secret: self.options.appSecret,
        code  : code,
        grant_type: 'authorization_code'
      })
      .end(self.handleResponse(callback));
    });
  }
  checkAuthorizeToken(){
    //https://api.weixin.qq.com/sns/auth?access_token=ACCESS_TOKEN&openid=OPENID
  }
  refreshAuthorizeToken(){
    //https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=APPID&grant_type=refresh_token&refresh_token=REFRESH_TOKEN
  }
  getUser(token, openId, language){
    var self = this;
    return promiseify(function(callback){
      request
      .get('https://api.weixin.qq.com/sns/userinfo')
      .query({
        access_token  : token ,
        openid        : openId,
        lang          : language || 'zh_CN'
      })
      .end(self.handleResponse(callback));
    });
  }
  getAuthorizeURL(callbackURL, scope, state){
    var api = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    var querystring = qs.stringify({
      appid         : this.options.appId  ,
      redirect_uri  : callbackURL         ,
      response_type : 'code'              ,
      scope         : scope               ,
      state         : state
    });
    return [ api, '?' ,querystring ,'#wechat_redirect' ].join('');
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
        self.read(res, function(err, text){
          accept(self.parseJS(text)['QRLogin.uuid']);
        });
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
      https.get('https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?uuid=' + uuid, function(res){
        self.read(res, function(err, text){
          if(err) return reject(err);
          accept(self.parseJS(text));
        });
      }).on('error', reject);
    });
  }
  getLoginInfo(ticket, uuid){
    var u = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage?uuid=$uuid&ticket=$ticket'.replace('$uuid', uuid).replace('$ticket', ticket)
    return new Promise(function(accept, reject){
      https.get(u, function(res){
        var o = {};
        res.headers['set-cookie'].filter(function(item){
          return /wxuin|wxsid|webwx_data_ticket/.test(item);
        }).map(function(item){
          return item.split(';')[0].split('=');
        }).map(function(item){
          o[ item[0] ] = item[1];
        })
        accept(o);
      })
    });
  }
  login(uin, sid, ticket){
    var self = this;
    return new Promise(function(accept, reject){
      var data = JSON.stringify({
        "BaseRequest": {
          "Uin": uin,
          "Sid": sid,
          "Skey":"",
          "DeviceID":"e540201223688200"
        }
      });

      var req = http.request({
        hostname: 'wx.qq.com',
        method  : 'post'  ,
        path    : '/cgi-bin/mmwebwx-bin/webwxinit',
        headers : {
          'Content-Length': data.length,
          Cookie: self.cookie({
            wxuin: uin,
            wxsid: sid,
            webwx_data_ticket: ticket
          })
        }
      }, function(res){
        self.read(res, function(err, text){
          accept(JSON.parse(text));
        })
      })
      req.on('error', reject);
      req.write(data)
      req.end()
    });
  }

  getContacts(uin, sid, ticket){
    var self = this;
    return new Promise(function(accept, reject){
      var req = https.request({
        hostname: 'wx.qq.com',
        path: '/cgi-bin/mmwebwx-bin/webwxgetcontact',
        headers: {
          Cookie: self.cookie({
            wxuin: uin,
            wxsid: sid,
            webwx_data_ticket: ticket
          })
        }
      }, function(res){
        self.read(res, function(err, text){
          accept(JSON.parse(text));
        })
      });
      req.end();
    });
  }

  keepalive(uin, sid, ticket,  syncKey, skey, deviceid){
    var self = this;
    https.request({
      hostname: 'webpush.weixin.qq.com',
      headers: {
        Cookie: self.cookie({ webwx_data_ticket: ticket })
      },
      path: [ '/cgi-bin/mmwebwx-bin/synccheck',  qs.stringify({
        sid     : sid     ,
        uin     : uin     ,
        skey    : skey || '',
        deviceid: deviceid || ~~new Date,
        synckey : syncKey.List.map(function(item){
          return [ item.Key, item.Val ].join('_')
        }).join('|')
      }) ].join('?')
    }, function(res){
      self.read(res, function(err, text){
        console.log(self.parseJS(text));
      });
    }).end();
  }

  fetchMessage(uin, sid, ticket, syncKey, deviceId){
    var self = this;
    var data = JSON.stringify({
      "BaseRequest":{
        "Uin":uin,
        "Sid":sid,
        "Skey":"",
        "DeviceID": ~~new Date
      },
      "SyncKey": syncKey
    });
    return new Promise(function(accept, reject){
      var req = https.request({
        method: 'post',
        hostname: 'wx.qq.com',
        path: '/cgi-bin/mmwebwx-bin/webwxsync',
        headers: {
          'Content-Length': data.length,
          Cookie: self.cookie({
            wxuin: uin,
            wxsid: sid,
            webwx_data_ticket: ticket
          })
        }
      }, function(res){
        self.read(res, function(err, text){
          accept(JSON.parse(text));
        })
      });
      req.write(data);
      req.end();
    });
  }

  sendMessage(uin, sid, ticket, from, to, msg){
    var self = this;
    var data = JSON.stringify({
      "BaseRequest":{
        "Uin":uin,
        "Sid":sid,
        "Skey":"",
        "DeviceID": ~~new Date
      },
      "Msg" : {
        "LocalID" : ~~new Date,
        "ClientMsgId" : ~~new Date,
       "Content" : msg,
       "FromUserName" : from,
       "ToUserName" : to,
       "Type" : 1
     }
    });
    return new Promise(function(accept, reject){
      var req = https.request({
        method: 'post',
        hostname: 'wx.qq.com',
        path: '/cgi-bin/mmwebwx-bin/webwxsendmsg',
        headers: {
          'Content-Length': data.length,
          Cookie: self.cookie({
            wxuin: uin,
            wxsid: sid,
            webwx_data_ticket: ticket
          })
        }
      }, function(res){
        self.read(res, function(err, text){
          accept(JSON.parse(text));
        })
      });
      req.write(data);
      req.end();
    });
  }

}

module.exports = WechatAuth;
