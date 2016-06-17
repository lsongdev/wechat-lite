const WeChat = require('../');

var api = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

// api
// .token()
// .then((x) => x.access_token)
// .then(api.ticket())
// .then(function(ticket){
//   console.log(ticket);
// })

api
.token()
