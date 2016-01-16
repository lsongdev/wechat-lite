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
const R             = require('./request');
const xml2js       = require('xml2js');
/**
 * WechatAuth
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
    return new R()
    .get('https://login.weixin.qq.com/jslogin')
    .query({ appid: this.options.appId })
    .end().then(function(res){
      var o = self.parseJS(res.text);
      if(parseInt(o[ 'QRLogin.code' ]) == 200)
        return o[ 'QRLogin.uuid' ];
      throw new Error('can not request uuid for now');
    });
  }
  qrcode(uuid){
    return [ 'https://login.weixin.qq.com/qrcode', uuid ].join('/');
  }
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
  login(uuid, ticket){
    return new R()
    .get('https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage')
    .query('uuid'  , uuid)
    .query('ticket', ticket)
    .end().then(function(res){
      var data = {};
      res.headers['set-cookie'].filter(function(cookie){
        return /wxuin|wxsid|webwx_data_ticket/.test(cookie);
      }).map(function(cookie){
        return cookie.split(';')[0].split('=');
      }).forEach(function(item){
        data[ item[0] ] = item[1];
      });
      return data;
    });
  }
}

/**
 * [Client description]
 * @type {[type]}
 */
WeChat.Client = class WeChatClient extends EventEmitter {
  constructor(options){
    super();
    this.options  = options;
    this.uin      = options.wxuin;
    this.sid      = options.wxsid;
    this.ticket   = options.webwx_data_ticket;
    this.deviceId = [ 'e', +new Date ].join('');
  }
  /**
   * [BaseRequest description]
   */
  get BaseRequest(){
    return {
      Uin      : this.uin   ,
      Sid      : this.sid   ,
      Skey     : '' ,
      DeviceID : this.deviceId
    };
  }
  /**
   * [init description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  init(){
    var self = this;
    return new R()
    .post('https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit')
    .cookie(this.options)
    .send({ BaseRequest: this.BaseRequest })
    .end().then(function(res){
      var d = JSON.parse(res.text);
      self.User    = d.User;
      self.SyncKey = d.SyncKey;
      self.emit(WeChat.Client.EVENTS.READY, d);
      return d;
    });
  }
  /**
   * [getContacts description]
   * @return {[type]} [description]
   */
  contacts(){
    var self = this;
    return new R()
    .get('https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact')
    .cookie(this.options)
    .end().then(function(res){
      var d = JSON.parse(res.text);
      self.Contacts = d.MemberList;
      self.emit(WeChat.Client.EVENTS.CONTACTS, d);
      return d;
    });
  }
  /**
   * [keepalive description]
   * @return {[type]} [description]
   */
  check(){
    var self = this;
    function lowercase(d){
      var o = {};
      for(var k in d) o[ k.toLowerCase() ] = d[k];
      return o;
    }
    return new R()
    .get('https://webpush.weixin.qq.com/cgi-bin/mmwebwx-bin/synccheck')
    .cookie(this.options)
    .query(Object.assign(lowercase(this.BaseRequest), {
      synckey: this.SyncKey.List.map(function(item){
        return [ item.Key, item.Val ].join('_')
      }).join('|')
    }))
    .end().then(function(res){
      var d = res.text.split('=');
      if(d.length == 2){
        var v = d[1];
        v = v.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
        return JSON.parse(v);
      }
    });
  }

  /**
   * [send description]
   * @param  {[type]} msg [description]
   * @param  {[type]} to  [description]
   * @return {[type]}     [description]
   */
  send(msg, to){
    new R()
    .post('https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg')
    .cookie(this.options)
    .send({
      Msg : {
        Type        : 1,
        Content     : msg,
        FromUserName: this.User.UserName,
        ToUserName  : to || this.User.UserName,
        LocalID     : ~~new Date,
        ClientMsgId : ~~new Date
      },
      BaseRequest: this.BaseRequest
    })
    .end().then(function(res){
      return JSON.parse(res.text);
    });
  }
  /**
   * [sync description]
   * @return {[type]} [description]
   */
  sync(){
    var self = this;
    return new R()
    .post('https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsync')
    .cookie(this.options)
    .send({
      SyncKey     : this.SyncKey,
      BaseRequest : this.BaseRequest
    })
    .end().then(function(res){
      var d = JSON.parse(res.text);
      self.SyncKey = d.SyncKey; // sync
      return d;
    });
  }
};


WeChat.Client.EVENTS = {
  READY     : 'ready',
  CONTACTS  : 'contacts'
};

WeChat.Client.VERIFY_FLAG = {
  USER: 0,
  OFFICIAL: 24,
  GUANFANG: 56
};

WeChat.Client.MSG_TYPE = {
  TEXT: 1,
  IMAGE: 3,
  VOICE: 34,
  VIDEO: 43,
  MICRO_VIDEO: 62,
  EMOTICON: 47,
  APP: 49,
  VOIP_MSG: 50,
  VOIP_NOTIFY: 52,
  VOIP_INVITE: 53,
  LOCATION: 48,
  STATUS_NOTIFY: 51,
  SYSNOTICE: 9999,
  POSSIBLE_FRIEND_MSG: 40,
  VERIFY_MSG: 37,
  SHARE_CARD: 42,
  SYS     : 10000,
  RECALLED: 10002,
};

WeChat.Client.CONTACT_FLAG = {
  CONTACT: 1,
  CHATCONTACT: 2,
  SUBSCRIBE: 3,
  CHATROOMCONTACT: 4,
  BLACKLISTCONTACT: 8,
  DOMAINCONTACT: 16,
  HIDECONTACT: 32,
  FAVOURCONTACT: 64,
  SNSBLACKLISTCONTACT: 256,
  NOTIFYCLOSECONTACT: 512,
  TOPCONTACT: 2048,
};

WeChat.Client.PROFILE_BITFLAG = {
  NOCHANGE: 0,
  CHANGE: 190,
};

WeChat.Client.STATUS_NOTIFY_CODE = {
  READED: 1,
  ENTER_SESSION: 2,
  INITED: 3,
  SYNC_CONV: 4,
  QUIT_SESSION: 5,
};

WeChat.Client.CHAT_ROOM_NOTIFY = {
  OPEN: 1,
  CLOSE: 0,
};

WeChat.Client.SEX = {
  MALE: 1,
  FEMALE: 2,
};

WeChat.SuperClient = class SuperClient extends EventEmitter {
  constructor(appId){
    super();
    var self = this;
    this.wx = new WeChat({ appId: appId });
  }
  uuid(){
    return this.wx.getUUID();
  }
  qrcode(uuid){
    var link = this.wx.qrcode(uuid);
    console.log(link);
    return link.split('/').splice(-1)[0];
  }
  waitingForScan(uuid){
    var self = this;
    return new Promise(function(accept, reject){
      (function wait(){
        self.wx.status(uuid).then(function(status){
          switch(parseInt(status.code, 10)){
            case 200:
              accept(qs.parse(url.parse(status.redirect_uri).query))
              break;
            case 201:
              console.log('scan qrcode success, waiting for login.');
            default:
              setTimeout(wait, 1000);
              break;
          }
        }, reject);
      })();
    });
  }
  login(data){
    return this.wx.login(data.uuid, data.ticket);
  }
  init(data){
    this.client = new WeChat.Client(data);
    return this.client.init();
  }
  contacts(){
    return this.client.contacts();
  }
  loop(){
    var self = this;
    (function loop(){
      self.client.check().then(function(s){
        switch(parseInt(s.retcode, 10)){
          case 0:
            break;
          case 1100:
            console.error('sign out', s.retcode);
            break;
          default:
            console.error('sync check failed', s.retcode);
            break;
        }
        switch (parseInt(s.selector, 10)) {
          case 0:
            break;
          case 2:
            self.client.sync().then(function(d){
              self.processMessage(d.AddMsgList)
            });
            break;
          default:
            break;
        }
        setTimeout(loop, 100);
      });
    })();
  }
  processMessage(msgs){
    var self = this;
    msgs.forEach(function(msg){

      var msgType = Object.keys(WeChat.Client.MSG_TYPE).filter(function(type){
        return WeChat.Client.MSG_TYPE[ type ] == msg.MsgType;
      })[0];

      switch(parseInt(msg.MsgType, 10)){
        case WeChat.Client.MSG_TYPE.TEXT:
          console.log('%s > %s: %s', msgType, msg.FromUserName, msg.Content);
          break;
        case WeChat.Client.MSG_TYPE.STATUS_NOTIFY:
          self.processStatusNotify(msg);
          break;
      }

    });
  }
  processStatusNotify(msg){
    switch(parseInt(msg.StatusNotifyCode, 10)){
      case WeChat.Client.STATUS_NOTIFY_CODE.SYNC_CONV:
        console.log(msg.StatusNotifyUserName.split(','));
        break;
      case WeChat.Client.STATUS_NOTIFY_CODE.ENTER_SESSION:
        console.log('ENTER_SESSION');
        break;
      case WeChat.Client.STATUS_NOTIFY_CODE.QUIT_SESSION:
        console.log('QUIT_SESSION');
        break;
      default:
        console.log(msg.StatusNotifyCode);
        break;
    }
  }
}

module.exports = WeChat;
