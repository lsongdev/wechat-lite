'use strict';
const assert = require('assert');
const WeChat = require('../');

var wx = new WeChat({
  appId     : 'wxfb9dc00461bcef17',
  appSecret : '21f48e4c7c68683b681ca81ba60d3190'
});

describe('wechat api', function() {
  
  var openId = 'ozwcHuC792LGHpQ0dYFlYoA2Uh_c';
  
  before(function(done){
    wx.getToken().then(function(token){
      wx.token = token.access_token;
      assert.ok(wx.token);
      // console.log(wx.token);
      done();
    });
  });
  
  it('get ticket ', function(done) {
    wx.getTicket(wx.token).then(function(ticket){
      assert.ifError(ticket.errcode, ticket.errmsg);
      done();
    });
  });
  
  it('get callback ip', function(done) {
    wx.getCallbackIP(wx.token).then(function(res){
      assert.ok(res.ip_list)
      assert.ifError(res.errcode, res.errmsg);
      done()
    });
  });
  
  it('get user', function(done) {
    wx.getUser(wx.token, openId).then(function(user){
      // console.log(user);
      assert.ok(user.openid);
      assert.ifError(user.errcode, user.errmsg);
      done();
    });
  });
  
  it('send template message', function(done) {
    var templateId = 'zVwzW_Sm7Ln8mrf2a74-3XgWbDMPYbXVcjEbf-aA75o';
    var data = {
      name: 'Lsong',
      content: 'test'
    };
  
    wx.template_send(wx.token, openId, templateId, data, 'https://lsong.org').then(function(res){
      assert.ifError(res.errcode, res.errmsg);
      assert.ok(res.msgid)
      done();
    });
  });
  
  it('send custom message', function(done) {
    wx.custom_send(wx.token, openId, 'text', { content: 'test' }).then(function(res){
      assert.ifError(res.errcode, res.errmsg);
      done();
    });
  });
  //
  // it('menu list', function(done) {
  //   wx.menu_list(wx.token).then(function(res){
  //     assert.ok(res.is_menu_open);
  //     assert.ok(res.selfmenu_info);
  //     assert.ifError(res.errcode, res.errmsg);
  //     done();
  //   });
  // });
  //
  // it('set user remark', function(done) {
  //   wx.user_remark(wx.token, openId, 'remark').then(function(res){
  //     assert.ifError(res.errcode, res.errmsg);
  //     done();
  //   });
  // });
  
  

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
