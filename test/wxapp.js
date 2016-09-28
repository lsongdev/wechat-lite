const assert = require('assert');
const config = require('kelp-config');
const WeChat = require('../');

const wx = new WeChat(config);

describe('wxapp', function() {
  
  it('jscode2session', function(done) {
    
    wx.jscode2session(
      config.appId,
      config.appSecret,
      "031DqdI72rIhME0KWiJ72m1fI72DqdIP"
    ).then(function(res) {
      // console.log(res);
      assert.equal(res.errcode, 40029);
      done();
      // { session_key: 'oLAvmhHwezWH3Owydxu2EA==',
      // expires_in: 2592000,
      // openid: 'oAVP50F3q1DdeR6S6VKfp2GlxY40' }
    });
    
  });
  
  it('wxopen_template_send', function(done) {
    
    wx.wxopen_template_send(
      config.openId, // openId
      '1e60145c56aa234690f7b3bc0ab140a0', // formId
      'ZfBzzxZglGXrozh7erVXJ-OixRmDM6UiHkMGO76hFEI', // templateId
      {
        keyword1: 'keyword1',
        keyword2: 'keyword2',
        keyword3: 'keyword3'
      }
    ).then(function(res){
      // console.log(res);
      assert.equal(res.errcode, 41028);
      done();
    });
    
  });
});
