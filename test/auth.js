'use strict';
const WechatAuth = require('../auth');


// let auth = new WechatAuth('wx4a744663c8031c70', 'd4f69849391b8452c78a60607bd63da7');
let auth = new WechatAuth('wx98831d7cee9dc881', '34c487c0f12bdf000fab9f836215ada6');

auth.on('error', function(err){
  console.error(err);
});

auth.getToken().then(function(token){
  auth.getTicket(token.access_token).then(function(ticket){
    console.log( auth.genSignature(ticket.ticket)('xxx') );
  });
});
