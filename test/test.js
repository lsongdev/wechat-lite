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
  
  // it('send template message', function(done) {
  //   var templateId = 'zVwzW_Sm7Ln8mrf2a74-3XgWbDMPYbXVcjEbf-aA75o';
  //   var data = {
  //     name: 'Lsong',
  //     content: 'test'
  //   };
  //
  //   wx.template_send(wx.token, openId, templateId, data, 'https://lsong.org').then(function(res){
  //     assert.ifError(res.errcode, res.errmsg);
  //     assert.ok(res.msgid)
  //     done();
  //   });
  // });
  //
  // it('send custom message', function(done) {
  //   wx.custom_send(wx.token, openId, 'text', { content: 'test' }).then(function(res){
  //     assert.ifError(res.errcode, res.errmsg);
  //     done();
  //   });
  // });
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
  it('set user remark', function(done) {
    wx.user_remark(wx.token, openId, 'remark').then(function(res){
      assert.ifError(res.errcode, res.errmsg);
      done();
    });
  });

});
