'use strict';
const fs = require('fs');
const WeChat = require('../');

var wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

var access_token = 'zpg8NQgREgDp-H0S88XxNEqypF4uQusHmLfyM17zoNhoDLJMfm5CyCVP8MdSz3pBbHRyu6Pk1_qaNIxHLzUpUdTy_9e8UVo4mNogFKD5b_dFvI1pNPjVFVDTpWLr7iyXLJHgAJAVTR';

var filename = './maoyan-wechat-userlist.txt';

fs.readFile(filename, 'utf8', function(err, content){
  var lines = content.split('\n').filter(function(line){
    return !!line;
  });
  
  ;(function fn(offset){
    var list = lines.slice(offset, offset + 100);
    
    setTimeout(function(){
      wx.getUserBatch(access_token,  list).then(function(res){
        res.user_info_list.forEach(function(user){
          console.log(user.openid, user.unionid);
        });
      });
      if(offset<lines.length){
        fn(offset + 100);
      }
    }, 42);
  
  })(0);
  
});
