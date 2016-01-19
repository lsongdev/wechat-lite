const WeChat = require('.');
/**
 * [exports description]
 * @type {[type]}
 */
module.exports = class SuperClient extends EventEmitter {
  constructor(appId){
    super();
    var self = this;
    this.wx = new WeChat({ appId: appId });
  }
  uuid(){
    return this.wx.getUUID();
  }
  qrcode(uuid){
    console.log(this.wx.qrcode(uuid));
    return uuid;
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
              console.log('> scan qrcode success, waiting for login.');
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
    var self = this;
    this.client = new WeChat.Client(data);
    this.client.on('ready', function(d){
      self.emit('ready', d);
    });
    return this.client.init();
  }
  contacts(){
    var self = this;
    return this.client.contacts().then(function(contacts){
      self.Contacts = contacts.MemberList;
      self.emit('contacts', self.Contacts);
    });
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
          case 1101:
            console.log('login to another device');
            break;
          default:
            console.error('sync check failed', s.retcode);
            break;
        }
        switch (parseInt(s.selector, 10)) {
          case 0:
            // nothing
            break;
          case 6:
            self.emit('message:response', s);
            break;
          case 2:
          case 7:
            self.client.sync().then(function(d){
              self.processMessage(d.AddMsgList)
            });
            break;
          default:
            console.error('unknow selector', s.selector);
            break;
        }
        setTimeout(loop, 100);
      });
    })();
  }
  parseGroupChatMessage(msg){
    msg.Content = msg.Content.replace(/^(@[a-zA-Z0-9]+):<br\/>/, function(_, sender){
      msg.ActualSender = sender;
      return '';
    });
    return msg;
  }
  getUserFromUserName(username){
    if(!this.Contacts) return;
    if(WeChat.SuperClient.isGroupChat(username)){
      // return this.ChatSet.
      return;
    }
    return this.Contacts.filter(function(contact){
      return contact.UserName == username;
    })[0];
  }
  processMessage(msgs){
    var self = this;
    msgs.forEach(function(msg){

      msg = self.parseGroupChatMessage(msg);

      var msgType = Object.keys(WeChat.Client.MSG_TYPE).filter(function(type){
        return WeChat.Client.MSG_TYPE[ type ] == msg.MsgType;
      })[0];

      switch(parseInt(msg.MsgType, 10)){
        case WeChat.Client.MSG_TYPE.TEXT:
          self.emit('message:text', msg);
          break;
        case WeChat.Client.MSG_TYPE.STATUS_NOTIFY:
          self.processStatusNotify(msg);
          break;
        default:
          console.error('unknow message type', msg.MsgType);
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
        this.emit('session:enter', msg);
        break;
      case WeChat.Client.STATUS_NOTIFY_CODE.QUIT_SESSION:
        this.emit('session:quit', msg);
        break;
      case WeChat.Client.STATUS_NOTIFY_CODE.READED:
        this.emit('message:readed', msg);
        break;
      case WeChat.Client.STATUS_NOTIFY_CODE.MOMENTS:
        this.emit('moments', msg);
        break;
      default:
        console.log(msg.StatusNotifyCode);
        break;
    }
  }

  isGroupChat(user) {
    var name = user.UserName || user;
    return name && /^@@|@chatroom$/.test(name);
  }

}
