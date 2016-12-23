'use strict';
const assert = require('assert');
const WeChat = require('../');
const config = require('kelp-config');

var api = new WeChat(config);

describe('wechat api', function() {

  // it('get token', async () => {
  //   const token = await api.token();
  //   assert.ok(token.access_token);
  //   assert.equal(token.expires_in, 7200);
  // });
  //
  it('get ticket ', async () => {
    const ticket = await api.ticket();
    assert.ok(ticket.ticket);
    assert.equal(ticket.expires_in, 7200);
    assert.equal(ticket.errcode, 0, ticket.errmsg);
  });

  it('get callback ip', async () => {
    const res = await api.callback_ip();
    assert.ok(res.ip_list);
    assert.ifError(res.errcode, res.errmsg);
  });

  it('get user', async () => {
    const user = await api.user(config.openId)
    assert.ok(user.openid);
    assert.ifError(user.errcode, user.errmsg);
  });

  it('set user remark', async () => {
    const res = await api.user_remark(config.openId, 'remark');
    assert.equal(res.errcode, 0, res.errmsg);
  });

  it('list users', async () => {
    const users = await api.users();
    assert.ok(users.total);
    assert.ok(users.count);
    assert.ok(users.data);
    assert.ok(users.next_openid);
    assert.ok(Array.isArray(users.data.openid));
  });

  it('fetch user info', async () => {
    const res = await api.users_info([ config.openId ]);
    assert.equal(res.user_info_list.length, 1);
  });

  it('send template message', async () => {
    const res = await api.template_send(config.templateId, {
      name:'测试商品',
      remark: '测试备注'
    }, 'https://lsong.org', config.openId)
    assert.ok(res.msgid);
    assert.equal(res.errcode, 0, res.errmsg);
  });

  it('menu list', async () => {
    const res = await api.menu_list();
    assert.ok(res.is_menu_open);
    assert.ifError(res.errcode, res.errmsg);
  });

  it('create qrcode', async () => {
    const res = await api.qr(WeChat.QR_SCENE, {
      scene: { scene_str: '123' }
    }, 604800);
    assert.ok(res.ticket);
    assert.ok(res.url);
    assert.equal(res.expire_seconds, 604800);
  });

  it('short url', async () => {
    const res = await api.short_url('https://github.com/song940/wechat-lite');
    assert.ok(res.short_url);
    assert.equal(res.errcode, 0, res.errmsg);
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
