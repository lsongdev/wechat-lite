// var express = require('express');
// var xmlParser = require('express-xml');
// var wechat = require('../');
//
// var app = express();
//
// app.use(function(req, res, next){
// 	console.log("%s %s", req.method, req.url);
// 	next();
// });
//
// app.use(xmlParser);
//
// app.use(wechat('token', function(req, res){
// 	console.log(req.msg);
// 	//res.reply('hehe');
// 	//res.reply('text', 'hi');
// 	//res.reply('image', 'kDEwlMDh4a_LXggpuJfJzbJDmb4i7g1hxLiCXDAgCH0MEaTZeKLDfx7jimi0GTPN');
// 	//res.reply('voice', 'bvnweVYYmeTmvpOZ-CG7KHeZpzQH9bvFcS-8TV9xgwPZGCSTClv6K2ccvZEYCnwi');
// 	//res.reply('video', {
// 	//	title: 'video',
// 	//	description: 'this is a video',
// 	//	MediaId: 'DBVFRIj29LB2hxuYpc0R6VLyxwgyCHZPbRj_IIs6YaGhutyXUKtFSDcSCPeoqUYr'
// 	//});
// 	//res.reply('music', {
// 	//	title: '小苹果',
// 	//	description: '你是我的小呀小苹果',
// 	//	pic: 'kDEwlMDh4a_LXggpuJfJzbJDmb4i7g1hxLiCXDAgCH0MEaTZeKLDfx7jimi0GTPN',
// 	//	url: 'http://119.2.14.188:8085/F/3774FCD95DB93101CCB4B910ADC33FA3F586BACB/BEB3849722A693AC480EF1038C2D7E8AF0A38C80/txkj_url/yinyueshiting.baidu.com/data2/music/121859548/1201250291407038461128.mp3',
// 	//	hq_url: 'http://119.2.14.188:8085/F/3774FCD95DB93101CCB4B910ADC33FA3F586BACB/BEB3849722A693AC480EF1038C2D7E8AF0A38C80/txkj_url/yinyueshiting.baidu.com/data2/music/121859548/1201250291407038461128.mp3'
// 	//});
// 	res.reply('news', [
// 	//	{
// 	//		title: 'baidu',
// 	//		description: 'baidu sb!',
// 	//		pic: 'http://www.baidu.com/img/baidu_sylogo1.gif',
// 	//		url: 'http://baidu.com'
// 	//	},
// 		{
// 			title: 'sina',
// 			description: 'sexna',
// 			pic: 'http://i2.sinaimg.cn/dy/deco/2013/0329/logo/LOGO_2x.png',
// 			url: 'http://sina.com'
// 		}
// 	]);
// }));
//
//
// var server = app.listen(3001, function(){
// 	console.log("server is running at %s", server.address().port);
// });
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

// let auth = new WechatAuth('wx4a744663c8031c70', 'd4f69849391b8452c78a60607bd63da7');
let auth = new WechatAuth('wx779ea5a9af3d5d09', 'ea6eea9459b57da58dbc673d1f52c4df');
// let auth = new WechatAuth('wx98831d7cee9dc881', '34c487c0f12bdf000fab9f836215ada6');
// let auth = new WechatAuth(
//   'wx3828798966eb822d',
//   '02668be0c63d2f3fd9ccaf7d0f69e71a'
// );
//
// auth.on('error', function(err){
//   console.error(err);
// });
//
// auth.getToken().then(function(token){
//   console.log(token.access_token);
// });
//
// //
// describe('should be ok', function() {
//
//   assert.equal(auth.checkSignature('token', 1, 'xxx', '369e1a9cba84ca172e7abfc9de031d96f64862af', 'ok'), 'o');
//
// });
//
// console.log( auth.getAuthorizeURL('http://m.maoyan.com/dev?_v_=yes', 'snsapi_base', '123')  );
// auth.getAuthorizeToken('01161a4bc07c84e50283a800f8da6e06');
// OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hpWHzwBaJnLwA3e_xINJ8-JGk1r6s_1Dbc3492_7TfTsM7K5Iv3G_kC0x5cPESCo7zmQRePC7-QHuUS_7A3fLvw
auth.getUser('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hz0iAtSnPmlCJDGPGWErzZ1Ar8eQ5HnTtIcEj4zhu0NJvithvAHXY5-xLcO4gDitZPJ-3SiIIOABGX_-3xH9FkA', 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw', 'en');
