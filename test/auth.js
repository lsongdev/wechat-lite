'use strict';
const WechatAuth = require('../auth');


//let auth = new WechatAuth('wx4a744663c8031c70', 'd4f69849391b8452c78a60607bd63da7');
// let auth = new WechatAuth('wx779ea5a9af3d5d09', 'ea6eea9459b57da58dbc673d1f52c4df');
let auth = new WechatAuth('wx98831d7cee9dc881', '34c487c0f12bdf000fab9f836215ada6');

auth.on('error', function(err){
  console.error(err);
});

for (var i = 0; i < 120; i++) {
  setTimeout(function refresh(){
    auth.getToken().then(function(token){
      var currentTime = new Date;
      var expire = token.expires_in;
      (function repeat(){
        auth.getTicket(token.access_token).then(function(ticket){
          setTimeout(repeat, 10 * 1000);
        }, function(err){
          console.log('实际：%s, 预期：%s, Token: %s, Error: %s',
            (new Date - currentTime) / 1000,
            expire,
            JSON.stringify(token),
            err
          );
          setTimeout(refresh, 0);
        });
      })();

    });
  }, i * 60 * 1000);
}
