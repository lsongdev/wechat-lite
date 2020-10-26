const { debuglog } = require('util');
const EventEmitter = require('events');

const User = require('./lib/user');
const Menu = require('./lib/menu');
const Open = require('./lib/open');
const Token = require('./lib/token');
const Media = require('./lib/media');
const OAuth = require('./lib/oauth');
const Custom = require('./lib/custom');
const QRCode = require('./lib/qrcode');
const Material = require('./lib/material');
const Template = require('./lib/template');

const { API_CORE, getJSON, OPEN_WEIXIN, postJSON } = require('./lib/core');

const Client = require('./client');
const Server = require('./server');

const debug = debuglog('wechat-lite');

class WeChat extends EventEmitter {
  constructor(config) {
    super();
    Object.assign(this, config);
  }
  token() {
    return token(this);
  }
  async requestToken() {
    const { appid, secret, cache = {} } = this;
    const { access_token, created_at, expires_in } = cache;
    if (access_token && Date.now() - created_at < expires_in)
      return access_token;
    this.cache = await Token.token({ appid, secret });
    debug('request access token', this.cache);
    this.cache.created_at = Date.now();
    return this.cache.access_token;
  }
  async user_list(next_openid = '') {
    const token = await this.requestToken();
    return User.list(token, next_openid);
  }
  async user_get(openid, lang = 'zh-CN') {
    const token = await this.requestToken();
    return User.info(token, openid, lang);
  }
  async user_remark(openid, remark) {
    const token = await this.requestToken();
    return User.remark(token, openid, remark);
  }
  async menu_create(menu) {
    const token = await this.requestToken();
    return Menu.create(token, menu);
  }
  async menu_delete() {
    const token = await this.requestToken();
    return Menu.del(token);
  }
  async menu_get() {
    const token = await this.requestToken();
    return Menu.get(token);
  }
  async menu_conditional_add(menu) {
    const token = await this.requestToken();
    return Menu.addconditional(token, menu);
  }
  async menu_conditional_del() {
    const token = await this.requestToken();
    return Menu.delconditional(token);
  }
  async menu_trymatch(user_id) {
    const token = await this.requestToken();
    return Menu.trymatch(token, user_id);
  }
  async custom_add(user) {
    const token = await this.requestToken();
    return Custom.add(token, user);
  }
  async custom_del(kf_accouunt) {
    const token = await this.requestToken();
    return Custom.del(token, kf_accouunt);
  }
  async custom_list() {
    const token = await this.requestToken();
    return Custom.list(token);
  }
  async custom_avatar(account, filename) {
    const token = await this.requestToken();
    return Custom.avatar(token, account, filename)
  }
  async custom_send(message) {
    const token = await this.requestToken();
    return Custom.send(token, message);
  }
  async media_get(media_id) {
    const token = await this.requestToken();
    return Media.get(token, media_id);
  }
  async media_upload(filename, type) {
    const token = await this.requestToken();
    return Media.upload(token, filename, type);
  }
  async oauth2_authorize(callbackURL, scope, state) {
    const { appid } = this;
    return OAuth.authorize(appid, callbackURL, scope, state);
  }
  async oauth2_access_token(code, type = 'authorization_code') {
    return OAuth.access_token(this, code, type);
  }
  async oauth2_refresh_token(token, type = 'refresh_token') {
    const { appid } = this;
    return OAuth.refresh_token(appid, token, type);
  }
  async material_add(articles) {
    const token = await this.requestToken();
    return Material.add(token, articles);
  }
  async material_del(media_id) {
    const token = await this.requestToken();
    return Material.del_material(token, media_id);
  }
  async template_send(template_id, data, url, touser) {
    const token = await this.requestToken();
    return Template.send(token, template_id, data, url, touser);
  }
  async qrcode(info, options) {
    const token = await this.requestToken();
    return QRCode.create(token, info, options);
  }
  /**
   * @docs https://developers.weixin.qq.com/doc/offiaccount/Account_Management/URL_Shortener.html
   * @param {*} long_url
   * @param {*} action
   */
  async short_url(long_url, action = 'long2short') {
    const token = await this.requestToken();
    return postJSON(`${API_CORE}/shorturl?access_token=${token}`, {
      long_url, action
    });
  }
  /**
   * @docs https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_the_WeChat_server_IP_address.html
   */
  async callback_ip() {
    const token = await this.requestToken();
    return getJSON(`${API_CORE}/getcallbackip?access_token=${token}`)
  }
  /**
   * @docs https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_the_WeChat_server_IP_address.html
   */
  async get_api_domain_ip() {
    const token = await this.requestToken();
    return getJSON(`${API_CORE}/get_api_domain_ip?access_token=${token}`)
  }
  async network_check() {
    const token = await this.requestToken();
    return getJSON(`${API_CORE}/callback/check?access_token=${token}`)
  }
  async qrconnect(options, callback) {
    const { appid } = this;
    const uuid = await Open.qrconnect(appid, options);
    const qrcode = `${OPEN_WEIXIN}/connect/qrcode/${uuid}`;
    let lastState = 0;
    callback({ state: lastState, qrcode });
    return (async function loop() {
      const { wx_errcode: state, wx_code: code } = await Open.polling(uuid);
      if (state !== 666) setTimeout(loop, 200);
      if (state !== lastState) {
        lastState = state;
        callback({ state, code });
      }
    })();
  }
};

WeChat.Client = Client;
WeChat.Server = Server;

module.exports = WeChat;
