'use strict';
const assert = require('assert');
const WeChat = require('../');
const config = require('kelp-config');

var api = new WeChat(config);

describe('wechat api', function() {

  it('get token', function(done) {
    api.token().then(function(res){
      console.log(res);
      assert.ok(res.access_token)
      assert.ok(res.expires_in)
      done();
    });
  });
  //
  it('get ticket ', function(done) {
    api.ticket().then(function(ticket){
      // console.log(ticket);
      assert.ifError(ticket.errcode, ticket.errmsg);
      done();
    });
  });

  it('get callback ip', function(done) {
    api.callback_ip().then(function(res){
      assert.ok(res.ip_list)
      assert.ifError(res.errcode, res.errmsg);
      done()
    });
  });

  it('get user', function(done) {
    api.user(config.openId).then(function(user){
      // console.log(user);
      assert.ok(user.openid);
      assert.ifError(user.errcode, user.errmsg);
      done();
    });
  });

  it('set user remark', function(done) {
    api.user_remark(config.openId, 'remark').then(function(res){
      // console.log(res);
      assert.ifError(res.errcode, res.errmsg);
      done();
    });
  });

  it('list users', function(done) {
    api.users().then(function(res){
      // console.log(res);
      assert.ok(res.total);
      assert.ok(res.count);
      assert.ok(res.data);
      assert.ok(res.next_openid);
      done()
    });
  });

  it('fetch user info', function(done) {
    api.users_info([ config.openId ]).then(function(res){
      assert.equal(res.user_info_list.length, 1);
      done();
    });
  });

  it('send template message', function(done) {
    api.template_send(config.templateId, {
      name:'测试商品',
      remark: '测试备注'
    }, 'https://lsong.org', config.openId).then(function(res){
      // console.log(res);
      assert.ifError(res.errcode, res.errmsg);
      assert.ok(res.msgid)
      done();
    });
  });
  //
  // it('send custom message', function(done) {
  //   api.custom_send(openId, 'text', { content: 'test' }).then(function(res){
  //     console.log(res);
  //     assert.ifError(res.errcode, res.errmsg);
  //     done();
  //   });
  // });
  //
  it('menu list', function(done) {
    api.menu_list().then(function(res){
      // console.log(res);
      assert.ok(res.is_menu_open);
      assert.ifError(res.errcode, res.errmsg);
      done();
    });
  });

  it('create qrcode', function(done) {
    api.qr(WeChat.QR_SCENE, {
      scene: { scene_str: '123' }
    }, 604800).then(function(res){
      // console.log(res);
      assert.ok(res.ticket);
      assert.ok(res.url);
      assert.equal(res.expire_seconds, 604800);
      done();
    });
  });

  it('short url', function(done) {
    api.short_url('https://github.com/song940/wechat-lite').then(function(res){
      // console.log(res);
      assert.ok(res.short_url);
      assert.ifError(res.errcode, res.errmsg);
      done();
    });
  });


});

describe('authorize', function() {
  //
  it('get authorize URL', function(){
    console.log(wx.getAuthorizeURL('http://m.maoyan.com/redirect/piaofang?_v_=yes', WeChat.SCOPE.BASE, '123'));
  });

  it('get authorize token', function(done){
    wx.getAuthorizeToken('0019f65a8630c62582db44d7a5eeb8ec').then(function(token){
      console.log(token);
      done();
    });
  });


  it('check authorize token', function(done){
    wx.checkAuthorizeToken('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9helrxSZIMnxh09P5ZLFPrCQcjoTatkojZGG1NpeqD_y1XY1KKiM18GFBkiTdAyuhkVyAuZmbNRwU63Obzaww9uw', 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw').then(function(res){
      console.log(res);
      done();
    })
  })

  it('refresh authorize token', function(){
    wx.refreshAuthorizeToken('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hqbjsSyi0EzWtHEEQOZIr0_x7AxWXvlw1utoLbRpH-xxOWaZHnmjL-Xui_sYw8HMasAyBdEfK5vranWl_jV8ifg').then(function(res){
      console.log(res);
    });
  })

  it('get user info', function(done){
    wx.getUser('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hUV2tBTOFOKIqvkVETJJ3awXTWIWMIOvNt8Km6ntD-5i_M3KlGOjDzx13cGStNbn__w-Du8hZxOngLVRK6iAIww', 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw', 'en').then(function(user){
      console.log(user);
      done()
    });
  })

});

// auth.on('error', function(err){
//   console.error(err);
// });

// auth.getToken().then(function(token){
//   console.log(token.access_token);
// });

// //
// describe('should be ok', function() {

//   assert.equal(auth.checkSignature('token', 1, 'xxx', '369e1a9cba84ca172e7abfc9de031d96f64862af', 'ok'), 'o');

// });
