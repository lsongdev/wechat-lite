'use strict';
const assert = require('assert');
const WeChat = require('../');

var wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

describe('wechat api', function() {
  
  var openId = 'ogpecs31cnl2zcr7bkG9fdVyu1c8';
  
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
      assert.ok(user.openid);
      assert.ifError(user.errcode, user.errmsg);
      done();
    });
  });
  
  it('menu list', function(done) {
    wx.menu_list(wx.token).then(function(res){
      assert.ok(res.is_menu_open);
      assert.ok(res.selfmenu_info);
      assert.ifError(res.errcode, res.errmsg);
      done();
    });
  });
  
  it('set user remark', function(done) {
    wx.user_remark(wx.token, openId, 'remark').then(function(res){
      assert.ifError(res.errcode, res.errmsg);
      done();
    });
  });
  

});
