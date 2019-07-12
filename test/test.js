var express = require('express');
var xmlParser = require('express-xml');
var wechat = require('../');

var app = express();

app.use(function(req, res, next){
	console.log("%s %s", req.method, req.url);
	next();
});

app.use(xmlParser);

app.use(wechat('token', function(req, res){
	console.log(req.msg);	
	//res.reply('hehe');
	//res.reply('text', 'hi');
	//res.reply('image', 'kDEwlMDh4a_LXggpuJfJzbJDmb4i7g1hxLiCXDAgCH0MEaTZeKLDfx7jimi0GTPN');
	//res.reply('voice', 'bvnweVYYmeTmvpOZ-CG7KHeZpzQH9bvFcS-8TV9xgwPZGCSTClv6K2ccvZEYCnwi');
	//res.reply('video', {
	//	title: 'video',
	//	description: 'this is a video',
	//	MediaId: 'DBVFRIj29LB2hxuYpc0R6VLyxwgyCHZPbRj_IIs6YaGhutyXUKtFSDcSCPeoqUYr'
	//});
	//res.reply('music', {
	//	title: '小苹果',
	//	description: '你是我的小呀小苹果',
	//	pic: 'kDEwlMDh4a_LXggpuJfJzbJDmb4i7g1hxLiCXDAgCH0MEaTZeKLDfx7jimi0GTPN',
	//	url: 'http://119.2.14.188:8085/F/3774FCD95DB93101CCB4B910ADC33FA3F586BACB/BEB3849722A693AC480EF1038C2D7E8AF0A38C80/txkj_url/yinyueshiting.baidu.com/data2/music/121859548/1201250291407038461128.mp3',
	//	hq_url: 'http://119.2.14.188:8085/F/3774FCD95DB93101CCB4B910ADC33FA3F586BACB/BEB3849722A693AC480EF1038C2D7E8AF0A38C80/txkj_url/yinyueshiting.baidu.com/data2/music/121859548/1201250291407038461128.mp3'
	//});
	res.reply('news', [
	//	{
	//		title: 'baidu',
	//		description: 'baidu sb!',
	//		pic: 'http://www.baidu.com/img/baidu_sylogo1.gif',
	//		url: 'http://baidu.com'
	//	},
		{
			title: 'sina',
			description: 'sexna',
			pic: 'http://i2.sinaimg.cn/dy/deco/2013/0329/logo/LOGO_2x.png',
			url: 'http://sina.com'
		}
	]);
}));


var server = app.listen(3001, function(){
	console.log("server is running at %s", server.address().port);
});
