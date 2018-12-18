'use strict';
const assert = require('assert');
const WeChat = require('../');
const config = require('kelp-config');

var api = new WeChat(config);

describe('wechat api', function() {

  it('get token', async () => {
    const token = await api.token();
    assert.ok(token.access_token);
    assert.equal(token.expires_in, 7200);
  });
  
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
    const res = await api.qrcode(WeChat.QR_SCENE, {
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