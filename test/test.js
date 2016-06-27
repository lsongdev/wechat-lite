'use strict';
const assert = require('assert');
const WeChat = require('../');
const config = require('../package');

var api = new WeChat(config.wechat);

describe('wechat api', function() {
  
  var openId = 'ozwcHuC792LGHpQ0dYFlYoA2Uh_c';
  // var openId = 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw';
  
  it('get token', function(done) {
    api.token().then(function(res){
      // console.log(res);
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
    api.user(openId).then(function(user){
      // console.log(user);
      assert.ok(user.openid);
      assert.ifError(user.errcode, user.errmsg);
      done();
    });
  });
  
  it('set user remark', function(done) {
    api.user_remark(openId, 'remark').then(function(res){
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
    api.users_info([ openId ]).then(function(res){
      assert.equal(res.user_info_list.length, 1);
      done();
    });
  });
  
  it('send template message', function(done) {
    // var templateId = 'h0DIYYP_eFCLUZCxoQ1pxeGxXDxXV6Pv-IL8KJwBBYY';
    var templateId = 'iR3pX6CgJe4n1jPTwyIxxjpeJiSqfmBIuqmRoShFo4E';
  
    api.template_send(templateId, {
      name:'测试商品',
      remark: '测试备注'
    }, 'https://lsong.org', openId).then(function(res){
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
