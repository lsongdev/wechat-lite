
'use strict';
const assert = require('assert');
const WeChat = require('../');

var client = new WeChat.Client({
  appId     : 'wx782c26e4c19acffb'
});

describe('wechat client', function() {
  
  var _uuid = '';
  
  it('get uuid', function(done) {
    client.uuid().then(function(uuid){
      assert.ok(uuid);
      _uuid = uuid;
      done();
    });
  });
  
  it('get qrcode', function(done) {
    assert.ok(client.qrcode(_uuid));
    done();
  });
  
});
