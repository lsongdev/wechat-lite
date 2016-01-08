'use strict';
const assert     = require('assert');
const WechatAuth = require('../');

function describe(msg, callback){
  try{
    console.log(msg);
    callback();
  }catch(e){
    console.error(e);
  };
}

//let auth = new WechatAuth('wx4a744663c8031c70', 'd4f69849391b8452c78a60607bd63da7');
// let auth = new WechatAuth('wx779ea5a9af3d5d09', 'ea6eea9459b57da58dbc673d1f52c4df');
// let auth = new WechatAuth('wx98831d7cee9dc881', '34c487c0f12bdf000fab9f836215ada6');
let auth = new WechatAuth('wx3828798966eb822d', '02668be0c63d2f3fd9ccaf7d0f69e71a');

auth.on('error', function(err){
  console.error(err);
});
//
auth.getToken().then(function(token){
  console.log(token);
  // auth.getCallbackIP(token.access_token).then(function(ips){
  //   console.log(ips);
  // });
});

// describe('should be ok', function() {
//
//   assert.equal(auth.checkSignature('token', 1, 'xxx', '369e1a9cba84ca172e7abfc9de031d96f64862af', 'ok'), 'o');
//
// });
