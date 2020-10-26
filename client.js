const xml2js = require('xml2js');
const EventEmitter = require('events');
const { stringify } = require('querystring');
const { get, readStream, postJSON, getJSON } = require('./lib/core');

const API_LOGIN = 'https://login.weixin.qq.com';
const API_PUSH = 'https://webpush.weixin.qq.com';

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
  SYS: 10000,
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

const parseJS = (code, scope) => {
  const window = {};
  if (scope) window[scope] = {};
  eval(code);
  return scope ? window[scope] : window;
};

const lowercase = d => Object.keys(d).reduce((o, k) => {
  o[k.toLowerCase()] = d[k];
  return o;
}, {});

const cookie = d =>
  Object.keys(d).reduce((s, k) => s + `${k}=${d[k]};`, '');

const BaseRequest = ({ wxuin: Uin, wxsid: Sid, Skey = '' }) => ({
  Skey, Uin, Sid,
  DeviceID: `e${Sid}`
});

const uuid = appid =>
  get(`${API_LOGIN}/jslogin?appid=${appid}`)
    .then(readStream)
    .then(res => res.toString())
    .then(code => parseJS(code, 'QRLogin').uuid);

const status = uuid =>
  get(`${API_LOGIN}/cgi-bin/mmwebwx-bin/login?uuid=${uuid}`)
    .then(readStream)
    .then(res => res.toString())
    .then(code => parseJS(code));

const login = url =>
  get(url).then(async res => {
    const { headers } = res;
    const cookies = headers['set-cookie'];
    const xml = await readStream(res);
    const { error } = await xml2js.parseStringPromise(xml);
    const err = new Error(error.message[0]);
    err.code = error.ret[0];
    if (!cookies) throw err;
    return (Array.isArray(cookies) ? cookies : [cookies])
      .filter(cookie => /wxuin|wxsid|webwx_data_ticket/.test(cookie))
      .map(cookie => cookie.split(';')[0].split('='))
      .reduce((data, [key, value]) => {
        data[key] = value;
        return data;
      }, {});
  });

const init = session => {
  const headers = {
    Cookie: cookie(session)
  };
  const body = {
    BaseRequest: BaseRequest(session)
  };
  return postJSON(`${API_LOGIN}/cgi-bin/mmwebwx-bin/webwxinit`, body, headers);
};

const check = (session, synckey) => {
  const query = Object.assign(lowercase(BaseRequest(session)), {
    synckey: synckey.List.map(({ Key, Val }) => [Key, Val].join('_')).join('|')
  });
  query.r = ~new Date;
  query._ = +new Date;
  const headers = {
    Cookie: cookie(session)
  };
  const qs = stringify(query);
  return get(`${API_PUSH}/cgi-bin/mmwebwx-bin/synccheck?${qs}`, headers)
    .then(readStream)
    .then(res => res.toString())
    .then(text => {
      if (!text) console.log('check output: >%s<', text);
      const d = text.split('=');
      if (d.length == 2) {
        var v = d[1];
        v = v.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
        return JSON.parse(v);
      }
    });
};

const sync = (session, SyncKey) =>
  postJSON(`${API_LOGIN}/cgi-bin/mmwebwx-bin/webwxsync`, {
    BaseRequest: BaseRequest(session), SyncKey
  }, {
    Cookie: cookie(session)
  });

const contacts = session =>
  getJSON(`${API_LOGIN}/cgi-bin/mmwebwx-bin/webwxgetcontact`, {
    Cookie: cookie(session)
  });

/**
 * send message to user
 * @param wechat
 * @param message
 * @param ToUserName
 */
const send = ({ session, User }, message) => {
  const id = Date.now() + '' + (Math.random() * 1e4 | 0);
  const { UserName: FromUserName } = User;
  const Msg = Object.assign({
    Type: 1,
    Content: '',
    ToUserName: '',
    FromUserName,
    LocalID: id,
    ClientMsgId: id,
  }, message);
  // console.log('send message:', Msg, session);
  return postJSON(`${API_LOGIN}/cgi-bin/mmwebwx-bin/webwxsendmsg`, {
    Msg,
    Scene: 0,
    BaseRequest: BaseRequest(session)
  }, {
    Cookie: cookie(session)
  });
};

class WeChatClient extends EventEmitter {
  constructor(ctx) {
    super();
    Object.assign(this, ctx);
  }

  send(Content, ToUserName) {
    return send(this, { ToUserName, Content });
  }
}

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
  const wechat = new WeChatClient({ appId });
  wechat.login = async () => {
    const _uuid = await uuid(appId);
    wechat.emit('qrcode', `${API_LOGIN}/qrcode/${_uuid}`);
    var _status;
    while (_status = await status(_uuid)) {
      switch (_status.code) {
        case 200:
          wechat.emit('auth', _status);
          break;
        case 201:
          wechat.emit('scan', _status);
        case 408:
        // 未确认（显示二维码后30秒触发）
        default:
          break;
      }
    }
  };
  wechat.once('auth', ({ redirect_uri }) => {
    console.log(redirect_uri);
    login(redirect_uri)
      .then(session => wechat.session = session)
      .then(init)
      .then(userData => {
        wechat.session.Skey = userData.SKey;
        wechat.emit('login', userData);
        return Object.assign(wechat, userData);
      })
      .then(function next({ session, SyncKey }) {
        return check(session, SyncKey).then(res => {
          if (!res) console.error('check not response', res);
          const { retcode = 0, selector } = res || {};
          console.log(retcode, selector);
          switch (parseInt(retcode, 10)) {
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
      wechat.emit('contacts', wechat.MemberList);
    });
  });

  wechat.on('status', selector => {
    console.log('selector', selector);
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
        console.error('unknown selector', selector);
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
      .then(({ AddMsgList }) => AddMsgList.forEach(msg => wechat.emit('message', msg)))
  });

  wechat.on('message', (message) => {
    switch (parseInt(message.MsgType, 10)) {
      case MSG_TYPE.TEXT:
        wechat.emit('message:text', message);
        break;
      case MSG_TYPE.STATUS_NOTIFY:
        wechat.emit('message:notify', message);
        break;
      default:
        console.error('unknow message type', message.MsgType);
        break;
    }
  });

  wechat.on('message:notify', notify => {
    switch (parseInt(notify.StatusNotifyCode, 10)) {
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
  return wechat;
};
