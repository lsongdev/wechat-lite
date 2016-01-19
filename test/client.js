const WeChat = require('../');


describe('wechat client', function() {

  var wx = new WeChat({
    appId: 'wx782c26e4c19acffb'
  });

  var _uuid = '';

  it('get uuid', function(done){
    wx.getUUID().then(function(uuid){
      _uuid = uuid;
      done();
    })
  });

  it('qrcode', function(){
    console.log(wx.qrcode(_uuid));
  })

  var url = '';

  it('get qrcode scan status', function(done){
    this.timeout(1000 * 30);
    (function wait(){
      wx.status(_uuid).then(function(status){
        if(status.code == 200){
          url = status.redirect_uri;
          done();
        }else{
          wait();
        }
      });
    })()
  })

  var login = null;

  it('login', function(done){
    wx.login(url).then(function(info){
      login = info;
      done();
    })
  })


  var client = null;

  it('init wechat client', function(done){
    client = new WeChat.Client(login);
    client.init().then(function(d){
      // console.log(d);
      done();
    });
  })


  it('send message', function(done){
    client.send('hi').then(function(res){
      // console.log(res);
      done();
    });
  });

});

// const SuperClient = require('../super-client');
//
// var client = new SuperClient('wx782c26e4c19acffb');
//
// client.on('ready', function(d){
//   console.log('ready', d.ChatSet.split(',').filter(function(chat){
//     return chat.startsWith('@');
//   }));
// })
//
// client.on('session:enter', function(){
//   console.log('ENTER_SESSION');
// });
//
// client.on('session:quit', function(){
//   console.log('QUIT_SESSION');
// });
//
// client.on('message:readed', function(){
//   console.log('READED');
// });
//
// client.on('message:text', function(msg){
//   // console.log(client.getUserFromUserName(msg.FromUserName));
//   // console.log(client.getUserFromUserName(msg.ToUserName));
//   // console.log(client.getUserFromUserName(msg.ActualSender));
// });
//
// client.on('contacts', function(contacts){
//   // console.log(contacts.map(function(contact){
//   //     return contact.UserName;
//   // }));
// });
//
// //
// client.uuid()
// // .then(client.qrcode.bind(client))
// // .then(client.waitingForScan.bind(client))
// // .then(client.login.bind(client))
// .then(function(d){
//   console.log(d);
//   // return d;
//   return { wxuin: '364349275',
//   wxsid: 'oviRukv0lk1q7sFk',
//   webwx_data_ticket: 'AQeBYLHOVvF2R5fg7y5mX0KC' };
// })
// .then(client.init.bind(client))
// .then(client.contacts.bind(client))
// .then(client.loop.bind(client))
// .catch(function(err){
//   console.log(err);
// })
