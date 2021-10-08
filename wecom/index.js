const assert = require('assert');
const EventEmitter = require('events');
const Token = require('./token');
const Message = require('./message');

class WeCom extends EventEmitter {
  constructor(options) {
    super();
    Object.assign(this, options);
  }
  static install(name, service) {
    this.prototype[name] = service;
    return this;
  }
  invoke(service, params) {
    return service.apply(this, params)(this);
  }
  requestToken = async () => {
    const { corpid, corpsecret } = this;
    const token = await Token.token(corpid, corpsecret)(this);
    assert.equal(token.errcode, 0, token.errmsg);
    return token;
  }
}

WeCom.install('message', Message);


module.exports = WeCom;