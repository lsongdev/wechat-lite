'use strict';
const util   = require('util');
const WeChat = require('./');
/**
 * [WeChatClient description]
 * @param {[type]} api [description]
 */
function WeChatClient(api){
  WeChat.apply(this, arguments);
};
/**
 * [inherits description]
 * @param  {[type]} WeChatClient [description]
 * @param  {[type]} WeChat       [description]
 * @return {[type]}              [description]
 */
util.inherits(WeChatClient, WeChat);
/**
 * [API_LOGIN description]
 * @type {String}
 */
WeChatClient.API_LOGIN = 'https://login.weixin.qq.com';

/**
 * [parseJS description]
 * @param  {[type]} code  [description]
 * @param  {[type]} scope [description]
 * @return {[type]}       [description]
 */
WeChatClient.parseJS = function(code, scope){
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
WeChatClient.prototype.uuid = function(){
  return this.request('get', WeChatClient.API_LOGIN + '/jslogin', {
    appid: this.options.appId,
    access_token: null
  }, null, function(res){
    return WeChatClient.parseJS(res, 'QRLogin').uuid
  });
};

/**
 * [qrcode description]
 * @param  {[type]} uuid [description]
 * @return {[type]}      [description]
 */
WeChatClient.prototype.qrcode = function(uuid){
  return [ WeChatClient.API_LOGIN, '/qrcode', uuid ].join('/');
};

/**
 * [status description]
 * @param  {[type]} uuid [description]
 * @return {[type]}      [description]
 */
WeChatClient.prototype.status = function(uuid){
  return this.request('get', WeChatClient.API_LOGIN + '/cgi-bin/mmwebwx-bin/login', {
    uuid: uuid,
    access_token: null
  }, null, function(data){ return WeChatClient.parseJS(data) }, true);
};

/**
 * [login description]
 * @param  {[type]} uuid   [description]
 * @param  {[type]} ticket [description]
 * @return {[type]}        [description]
 */
WeChatClient.prototype.login = function(url){
  
  return this.request('get', url, {access_token: null }, null, function(_, res){
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
 * [send description]
 * @return {[type]} [description]
 */
WeChatClient.prototype.send = function () {
  
};
/**
 * [exports description]
 * @type {[type]}
 */
module.exports = WeChatClient;


// 'use strict';
// const EventEmitter  = require('events');
// /**
//  * [Client description]
//  * @type {[type]}
//  */
// class WeChatClient extends EventEmitter {
//   constructor(options){
//     super();
//     this.options  = options;
//     this.uin      = options.wxuin;
//     this.sid      = options.wxsid;
//     this.ticket   = options.webwx_data_ticket;
//     this.deviceId = [ 'e', +new Date ].join('');
//     this.api      = ('http://wx' + (options.isQQ ? 2 : '') + '.qq.com');
//   }
//   /**
//    * [BaseRequest description]
//    */
//   get BaseRequest(){
//     return {
//       Uin      : this.uin   ,
//       Sid      : this.sid   ,
//       Skey     : '' ,
//       DeviceID : this.deviceId
//     };
//   }
//   /**
//    * [init description]
//    * @param  {Function} callback [description]
//    * @return {[type]}            [description]
//    */
//   init(){
//     var self = this;
//     return new R()
//     .post(this.api + '/cgi-bin/mmwebwx-bin/webwxinit')
//     .cookie(this.options)
//     .send({ BaseRequest: this.BaseRequest })
//     .end().then(function(res){
//       var d = JSON.parse(res.text);
//       self.Data    = d;
//       self.User    = d.User;
//       self.SyncKey = d.SyncKey;
//       self.ChatSet = d.ChatSet;
//       self.emit(WeChatClient.EVENTS.READY, d);
//       return d;
//     });
//   }
//   /**
//    * [getContacts description]
//    * @return {[type]} [description]
//    */
//   contacts(){
//     var self = this;
//     return new R()
//     .get(this.api + '/cgi-bin/mmwebwx-bin/webwxgetcontact')
//     .cookie(this.options)
//     .end().then(function(res){
//       var d = JSON.parse(res.text);
//       self.emit(WeChatClient.EVENTS.CONTACTS, d);
//       return d;
//     });
//   }
//
//   /**
//    * [keepalive description]
//    * @return {[type]} [description]
//    */
//   check(){
//     var self = this;
//     function lowercase(d){
//       var o = {};
//       for(var k in d) o[ k.toLowerCase() ] = d[k];
//       return o;
//     }
//     return new R()
//     .get('https://webpush.weixin.qq.com/cgi-bin/mmwebwx-bin/synccheck')
//     .cookie(this.options)
//     .query(Object.assign(lowercase(this.BaseRequest), {
//       synckey: this.SyncKey.List.map(function(item){
//         return [ item.Key, item.Val ].join('_')
//       }).join('|')
//     }))
//     .end().then(function(res){
//       var d = res.text.split('=');
//       if(d.length == 2){
//         var v = d[1];
//         v = v.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
//         return JSON.parse(v);
//       }
//     });
//   }
//
//   /**
//    * [send description]
//    * @param  {[type]} msg [description]
//    * @param  {[type]} to  [description]
//    * @return {[type]}     [description]
//    */
//   send(msg, to){
//     return new R()
//     .post(this.api + '/cgi-bin/mmwebwx-bin/webwxsendmsg')
//     .cookie(this.options)
//     .send({
//       Msg : {
//         Type        : 1,
//         Content     : msg,
//         FromUserName: this.User.UserName,
//         ToUserName  : to || this.User.UserName,
//         LocalID     : ~~new Date,
//         ClientMsgId : ~~new Date
//       },
//       BaseRequest: this.BaseRequest
//     })
//     .end().then(function(res){
//       return JSON.parse(res.text);
//     });
//   }
//   /**
//    * [sync description]
//    * @return {[type]} [description]
//    */
//   sync(){
//     var self = this;
//     return new R()
//     .post(this.api + '/cgi-bin/mmwebwx-bin/webwxsync')
//     .cookie(this.options)
//     .send({
//       SyncKey     : this.SyncKey,
//       BaseRequest : this.BaseRequest
//     })
//     .end().then(function(res){
//       var d = JSON.parse(res.text);
//       self.SyncKey = d.SyncKey; // sync
//       return d;
//     });
//   }
// };
// /**
//  * [EVENTS description]
//  * @type {Object}
//  */
// WeChatClient.EVENTS = {
//   READY     : 'ready',
//   CONTACTS  : 'contacts'
// };
// /**
//  * [VERIFY_FLAG description]
//  * @type {Object}
//  */
// WeChatClient.VERIFY_FLAG = {
//   USER: 0,
//   OFFICIAL: 24,
//   GUANFANG: 56
// };
// /**
//  * [MSG_TYPE description]
//  * @type {Object}
//  */
// WeChatClient.MSG_TYPE = {
//   TEXT: 1,
//   IMAGE: 3,
//   VOICE: 34,
//   VIDEO: 43,
//   MICRO_VIDEO: 62,
//   EMOTICON: 47,
//   APP: 49,
//   VOIP_MSG: 50,
//   VOIP_NOTIFY: 52,
//   VOIP_INVITE: 53,
//   LOCATION: 48,
//   STATUS_NOTIFY: 51,
//   SYSNOTICE: 9999,
//   POSSIBLE_FRIEND_MSG: 40,
//   VERIFY_MSG: 37,
//   SHARE_CARD: 42,
//   SYS     : 10000,
//   RECALLED: 10002,
// };
// /**
//  * [CONTACT_FLAG description]
//  * @type {Object}
//  */
// WeChatClient.CONTACT_FLAG = {
//   CONTACT: 1,
//   CHATCONTACT: 2,
//   SUBSCRIBE: 3,
//   CHATROOMCONTACT: 4,
//   BLACKLISTCONTACT: 8,
//   DOMAINCONTACT: 16,
//   HIDECONTACT: 32,
//   FAVOURCONTACT: 64,
//   SNSBLACKLISTCONTACT: 256,
//   NOTIFYCLOSECONTACT: 512,
//   TOPCONTACT: 2048,
// };
// /**
//  * [PROFILE_BITFLAG description]
//  * @type {Object}
//  */
// WeChatClient.PROFILE_BITFLAG = {
//   NOCHANGE: 0,
//   CHANGE: 190,
// };
// /**
//  * [STATUS_NOTIFY_CODE description]
//  * @type {Object}
//  */
// WeChatClient.STATUS_NOTIFY_CODE = {
//   READED: 1,
//   ENTER_SESSION: 2,
//   INITED: 3,
//   SYNC_CONV: 4,
//   QUIT_SESSION: 5,
//   MOMENTS: 9
// };
// /**
//  * [CHAT_ROOM_NOTIFY description]
//  * @type {Object}
//  */
// WeChatClient.CHAT_ROOM_NOTIFY = {
//   OPEN: 1,
//   CLOSE: 0,
// };
// /**
//  * [SEX description]
//  * @type {Object}
//  */
// WeChatClient.SEX = {
//   MALE: 1,
//   FEMALE: 2,
// };
// /**
//  * [exports description]
//  * @type {[type]}
//  */
// module.exports = WeChatClient;
// 'use strict';
// const EventEmitter  = require('events');
// const WeChat        = require('.');
// /**
//  * [exports description]
//  * @type {[type]}
//  */
// module.exports = class SuperClient extends EventEmitter {
//   constructor(appId){
//     super();
//     var self = this;
//     this.wx = new WeChat({ appId: appId });
//   }
//   uuid(){
//     return this.wx.getUUID();
//   }
//   qrcode(uuid){
//     console.log(this.wx.qrcode(uuid));
//     return uuid;
//   }
//   waitingForScan(uuid){
//     var self = this;
//     return new Promise(function(accept, reject){
//       (function wait(){
//         self.wx.status(uuid).then(function(status){
//           switch(parseInt(status.code, 10)){
//             case 200:
//               accept(qs.parse(url.parse(status.redirect_uri).query))
//               break;
//             case 201:
//               console.log('> scan qrcode success, waiting for login.');
//             default:
//               setTimeout(wait, 1000);
//               break;
//           }
//         }, reject);
//       })();
//     });
//   }
//   login(data){
//     return this.wx.login(data.uuid, data.ticket);
//   }
//   init(data){
//     var self = this;
//     this.client = new WeChat.Client(data);
//     this.client.on('ready', function(d){
//       self.emit('ready', d);
//     });
//     return this.client.init();
//   }
//   contacts(){
//     var self = this;
//     return this.client.contacts().then(function(contacts){
//       self.Contacts = contacts.MemberList;
//       self.emit('contacts', self.Contacts);
//     });
//   }
//   loop(){
//     var self = this;
//     (function loop(){
//       self.client.check().then(function(s){
//         switch(parseInt(s.retcode, 10)){
//           case 0:
//             break;
//           case 1100:
//             console.error('sign out', s.retcode);
//             break;
//           case 1101:
//             console.log('login to another device');
//             break;
//           default:
//             console.error('sync check failed', s.retcode);
//             break;
//         }
//         switch (parseInt(s.selector, 10)) {
//           case 0:
//             // nothing
//             break;
//           case 6:
//             self.emit('message:response', s);
//             break;
//           case 2:
//           case 7:
//             self.client.sync().then(function(d){
//               self.processMessage(d.AddMsgList)
//             });
//             break;
//           default:
//             console.error('unknow selector', s.selector);
//             break;
//         }
//         setTimeout(loop, 100);
//       });
//     })();
//   }
//   parseGroupChatMessage(msg){
//     msg.Content = msg.Content.replace(/^(@[a-zA-Z0-9]+):<br\/>/, function(_, sender){
//       msg.ActualSender = sender;
//       return '';
//     });
//     return msg;
//   }
//   getUserFromUserName(username){
//     if(!this.Contacts) return;
//     if(WeChat.SuperClient.isGroupChat(username)){
//       // return this.ChatSet.
//       return;
//     }
//     return this.Contacts.filter(function(contact){
//       return contact.UserName == username;
//     })[0];
//   }
//   processMessage(msgs){
//     var self = this;
//     msgs.forEach(function(msg){
//
//       msg = self.parseGroupChatMessage(msg);
//
//       var msgType = Object.keys(WeChat.Client.MSG_TYPE).filter(function(type){
//         return WeChat.Client.MSG_TYPE[ type ] == msg.MsgType;
//       })[0];
//
//       switch(parseInt(msg.MsgType, 10)){
//         case WeChat.Client.MSG_TYPE.TEXT:
//           self.emit('message:text', msg);
//           break;
//         case WeChat.Client.MSG_TYPE.STATUS_NOTIFY:
//           self.processStatusNotify(msg);
//           break;
//         default:
//           console.error('unknow message type', msg.MsgType);
//           break;
//       }
//
//     });
//   }
//   processStatusNotify(msg){
//     switch(parseInt(msg.StatusNotifyCode, 10)){
//       case WeChat.Client.STATUS_NOTIFY_CODE.SYNC_CONV:
//         console.log(msg.StatusNotifyUserName.split(','));
//         break;
//       case WeChat.Client.STATUS_NOTIFY_CODE.ENTER_SESSION:
//         this.emit('session:enter', msg);
//         break;
//       case WeChat.Client.STATUS_NOTIFY_CODE.QUIT_SESSION:
//         this.emit('session:quit', msg);
//         break;
//       case WeChat.Client.STATUS_NOTIFY_CODE.READED:
//         this.emit('message:readed', msg);
//         break;
//       case WeChat.Client.STATUS_NOTIFY_CODE.MOMENTS:
//         this.emit('moments', msg);
//         break;
//       default:
//         console.log(msg.StatusNotifyCode);
//         break;
//     }
//   }
//
//   isGroupChat(user) {
//     var name = user.UserName || user;
//     return name && /^@@|@chatroom$/.test(name);
//   }
//
// }
