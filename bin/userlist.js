'use strict';
const WeChat = require('../');

var wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

var access_token = 'phd6hEWF_dggHgrNDV4g9sppWY-tdX_eZRKqT2_Vsm8kkw30XWKi2G5jdmEqZ4XpAAqfHmOksE1dt1PdcUXiz30GyxHDZ5CvuGJ_p0EL9GiuuRerdJygVHOD3_ZIXnn3WCZcAAACIF';
//
// var arr = [];
//
// ;(function fn(token, next){
//
//   wx.getUserList(token, next).then(function(list){
//     list.data.openid.forEach(function(openid){
//       arr.push(openid);
//       console.log(openid);
//     });
//     if(arr.length < list.total){
//       fn(token, list.next_openid);
//     }
//   });
//
// })(access_token);

//
