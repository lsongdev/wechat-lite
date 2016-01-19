
/**
 * [Client description]
 * @type {[type]}
 */
module.exports = class WeChatClient extends EventEmitter {
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
      self.ChatSet = d.ChatSet;
      self.emit(WeChatClient.EVENTS.READY, d);
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
      self.emit(WeChatClient.EVENTS.CONTACTS, d);
      return d;
    });
  }

  batchContacts(){

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


WeChatClient.EVENTS = {
  READY     : 'ready',
  CONTACTS  : 'contacts'
};

WeChatClient.VERIFY_FLAG = {
  USER: 0,
  OFFICIAL: 24,
  GUANFANG: 56
};

WeChatClient.MSG_TYPE = {
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

WeChatClient.CONTACT_FLAG = {
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

WeChatClient.PROFILE_BITFLAG = {
  NOCHANGE: 0,
  CHANGE: 190,
};

WeChatClient.STATUS_NOTIFY_CODE = {
  READED: 1,
  ENTER_SESSION: 2,
  INITED: 3,
  SYNC_CONV: 4,
  QUIT_SESSION: 5,
  MOMENTS: 9
};

WeChatClient.CHAT_ROOM_NOTIFY = {
  OPEN: 1,
  CLOSE: 0,
};

WeChatClient.SEX = {
  MALE: 1,
  FEMALE: 2,
};
