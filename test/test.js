const WeChat = require('../');

var wx = new WeChat({
  appId     : '',
  appSecret : ''
});

wx.getToken().then(function(res){
  console.log(res);
});
