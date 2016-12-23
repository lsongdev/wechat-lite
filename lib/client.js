const WeChat = require('.');

const { request, parseJS } = WeChat;

const API_LOGIN = 'https://login.weixin.qq.com';
const API_PUSH  = 'https://webpush.weixin.qq.com';

const MSG_TYPE = {
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

const STATUS_NOTIFY_CODE = {
  READED: 1,
  ENTER_SESSION: 2,
  INITED: 3,
  SYNC_CONV: 4,
  QUIT_SESSION: 5,
  MOMENTS: 9
};

const lowercase = d => Object.keys(d).reduce((o, k) => {
  o[k.toLowerCase()] = d[k];
  return o;
}, {});

const cookie = d =>
  Object.keys(d).reduce((s, k) => s + `${k}=${d[k]};`, '');

const BaseRequest = ({ wxuin, wxsid }) => ({
  Skey     : '' ,
  Uin      : wxuin,
  Sid      : wxsid,
  DeviceID : `e${wxsid}`
});

const uuid = appid => {
  return request(`${API_LOGIN}/jslogin`, {
    query: { appid },
  }).then(res => parseJS(res.text(), 'QRLogin').uuid)
};

const status = uuid => {
  return request(`${API_LOGIN}/cgi-bin/mmwebwx-bin/login`, {
    query: { uuid }
  }).then(res => parseJS(res.text()))
};

const login = url => {
  return request(url).then(({ headers }) => {
    const cookies = headers['set-cookie'];
    return (Array.isArray(cookies) ? cookies : [ cookies ])
    .filter(cookie => /wxuin|wxsid|webwx_data_ticket/.test(cookie))
    .map(cookie => cookie.split(';')[0].split('='))
    .reduce((data, [ key, value ]) => {
      data[ key ] = value;
      return data;
    }, {});
  });
};

const init = session =>  {
  return request(`${API_LOGIN}/cgi-bin/mmwebwx-bin/webwxinit`, {
    method: 'post',
    headers: { Cookie: cookie(session) },
    body: { BaseRequest: BaseRequest(session) },
  }).then(res => res.json())
};

const check = (session, synckey) => {
  const query = Object.assign(lowercase(BaseRequest(session)), {
    synckey: synckey.List.map(({ Key, Val }) => [ Key, Val ].join('_')).join('|')
  });
  query.r = ~new Date;
  query._ = +new Date;
  return request(`${API_PUSH}/cgi-bin/mmwebwx-bin/synccheck`, { 
    query,
    headers: { Cookie: cookie(session) },
  })
  .then(res => res.text())
  .then(text => {
    var d = text.split('=');
    if(d.length == 2){
      var v = d[1];
      v = v.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
      return JSON.parse(v);
    }
  });
};

const sync = (session, SyncKey) => {
  return request(`${API_LOGIN}/cgi-bin/mmwebwx-bin/webwxsync`, {
    method: 'post',
    headers: { Cookie: cookie(session) },
    body: {
      BaseRequest: BaseRequest(session), SyncKey
    }
  }).then(res => res.json())
};

const contacts = session => {
  return request(`${API_LOGIN}/cgi-bin/mmwebwx-bin/webwxgetcontact`, {
    headers: { Cookie: cookie(session) },
  }).then(res => res.json());
};
/**
 * send message to user
 * @param wechat
 * @param message
 * @param ToUserName
 */
const send = ({ session, User }, message) => {
  const Msg = Object.assign({
    Type: 1,
    Content: '',
    ToUserName: '',
    FromUserName: User.UserName,
    LocalID    : ~~new Date,
    ClientMsgId: ~~new Date,
  }, message);
  return request(`${API_LOGIN}/cgi-bin/mmwebwx-bin/webwxsendmsg`, {
    headers: { Cookie: cookie(session) },
    body: { 
      Msg,
      BaseRequest: BaseRequest(session)
    }
  }).then(res => res.json());
};

/*
  uuid --> print
    |
    V
  wait -> loop -> | input: uuid
    |             |
  login <---------|  input: login url
    |             | output: set-cookie(wxuin|wxsid|webwx_data_ticket)
    V
  init            |  input: 
    |             | output: { User, SyncKey }
    V
  check --------->|  input: { session, synckey }
    |             | output: { retcode, selector }
  sync <--------- |  input: { session, synckey }
                  | output: { SyncKey , AddMsgList }
*/
module.exports = ({ appId }) => {
  const wechat = new WeChat({ appId });
  uuid(appId)
  .then(uuid => {
    wechat.emit('qrcode', `${API_LOGIN}/qrcode/${uuid}`);
    return uuid;
  })
  .then(function next(uuid){
    status(uuid).then(st => {
      switch(st.code){
        case 200:
          wechat.emit('auth', st);
          break;
        case 201:
          wechat.emit('scan', st);
        case 408:
          // 未确认（显示二维码后30秒触发）
        default:
          next(uuid);
          break;
      }
    });
  });

  wechat.once('auth', ({ redirect_uri }) => {
    login(redirect_uri)
    .then(session => wechat.session = session)
    .then(init)
    .then(userData => {
      wechat.emit('login', userData);
      return Object.assign(wechat, userData);
    })
    .then(function next({ session, SyncKey }){
      return check(session, SyncKey).then(({ retcode, selector }) => {
        switch(parseInt(retcode, 10)){
          case 0:
            setTimeout(() => next(wechat), 200);
            wechat.emit('status', selector);
            break;
          case 1100:
            wechat.emit('logout');
            break;
          case 1101:
            wechat.emit('kickout');
            break;
          default:
            console.error('sync check failed', retcode);
            break;
        }
      });
    })
  });

  wechat.once('login', () => {
    contacts(wechat.session).then(({ MemberList }) => {
      Object.assign(wechat, { MemberList });
    });
  });

  wechat.on('status', selector => {
    switch (parseInt(selector, 10)) {
      case 0:
        // nothing
        break;
      case 6:
        // message response?
        break;
      case 2:
        wechat.emit('message:new');
        break;
      case 7:
        // session active
        break;
      default:
        console.error('unknow selector', selector);
        break;
    }
  });

  wechat.on('message:new', () => {
    const { session, SyncKey } = wechat;
    sync(session, SyncKey)
    .then(response => {
      Object.assign(wechat, response);
      return response;
    })
    .then(({ AddMsgList }) => {
      AddMsgList.forEach(msg => wechat.emit('message', msg));
    })
  });

  wechat.on('message', (message) => {
    switch(parseInt(message.MsgType, 10)){
      case MSG_TYPE.TEXT:
        wechat.emit('message:text', message);
        break;
      case MSG_TYPE.STATUS_NOTIFY:
        wechat.emit('message:notify', message);
        break;
    }
  });

  wechat.on('message:notify', notify => {
    switch(parseInt(notify.StatusNotifyCode, 10)){
      case STATUS_NOTIFY_CODE.SYNC_CONV:
        console.log(notify.StatusNotifyUserName.split(','));
        break;
      case STATUS_NOTIFY_CODE.ENTER_SESSION:
        wechat.emit('session:enter', notify);
        break;
      case STATUS_NOTIFY_CODE.QUIT_SESSION:
        wechat.emit('session:quit', notify);
        break;
      case STATUS_NOTIFY_CODE.READED:
        wechat.emit('message:readed', notify);
        break;
      case STATUS_NOTIFY_CODE.MOMENTS:
        wechat.emit('moments', notify);
        break;
      default:
        console.log('unknow status notify code', notify.StatusNotifyCode);
        break;
    }
  });

  wechat.send = (Content, ToUserName) => {
    return send(wechat, {
      ToUserName,
      Content
    });
  }
  return wechat;
};