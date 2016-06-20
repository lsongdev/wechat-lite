const WeChat = require('../');

var api = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
}, function(done){
  this.token().then(function(token){
    done(token.access_token);
  });
});

api.ticket().then(function(ticket){
  console.log(ticket);
});
