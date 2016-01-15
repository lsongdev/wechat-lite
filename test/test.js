const url    = require('url');
const qs     = require('querystring');
const WeChat = require('../');


var wx = new WeChat();

wx.getUUID().then(function(uuid){
  console.log( wx.qrcode(uuid) );
  (function loop(){
    wx.status(uuid).then(function(status){
      switch(parseInt(status.code)){
        case 200:
          var o = qs.parse(url.parse(status.redirect_uri).query);
          wx.getLoginInfo(o.ticket, o.uuid).then(function(o){
            wx.login(o.wxuin, o.wxsid, o.webwx_data_ticket).then(function(r){
              setInterval(function(){
                wx.keepalive(o.wxuin, o.wxsid, o.webwx_data_ticket, r.SyncKey)
              }, 3000);
              wx.getContacts(o.wxuin, o.wxsid, o.webwx_data_ticket).then(function(contacts){
                console.log(contacts);
              });
              wx.sendMessage(o.wxuin, o.wxsid, o.webwx_data_ticket, r.User.UserName, r.User.UserName, 'hi,send from wechat-lite').then(function(res){
                console.log(res);
              });
            });
          });
          break;
        case 201:
          console.log('scan');
        default:
          setTimeout(loop, 1000);
          break;
      }
    });
  })()
});
