'use strict';
const WeChat = require('../');
//
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
          console.log(status);
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
    this.timeout(1000 * 30);
    wx.login(url).then(function(info){
      login = info;
      done();
    }).catch(function(err){
      console.log(err);
    })
  })


  var client = null;

  it('init', function(done){
    this.timeout(1000 * 30);
    client = new WeChat.Client(login);
    client.init().then(function(){
      done();
    }).catch(done);
  })


  it('send message', function(done){
    this.timeout(1000 * 30);
    client.send('hi').then(function(){
      done();
    }).catch(done);
  });

});
