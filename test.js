
var express = require('express');
var xmlParser = require('express-xml');
var wechat = require('./wechat');

var app = express();

app.use(function(req, res, next){
	console.log("%s %s", req.method, req.url);
	next();
});

app.use(xmlParser);

app.use(wechat('token', function(req, res){
	console.log(req.msg);
	var msg = req.msg;
	switch(msg.MsgType){
		case 'text':
			var ToUserName = msg['ToUserName'];
			msg['ToUserName'] = msg['FromUserName'];
			msg['FromUserName'] = ToUserName;
			res.reply(msg);
			break;
		case 'image':
			res.reply({
				ToUserName: msg['FromUserName'],
				FromUserName: msg['ToUserName'],
				CreateTime: +new Date,
				MsgType: 'image',
				Image: { MediaId: msg['MediaId'] }
			});
			break;
		case 'voice':
			res.reply({
				ToUserName: msg['FromUserName'],
				FromUserName: msg['ToUserName'],
				CreateTime: +new Date,
				MsgType: 'voice',
				Voice: { MediaId: msg['MediaId'] }
			});
			break;
		case 'video':
			res.reply({
				ToUserName: msg['FromUserName'],
				FromUserName: msg['ToUserName'],
				CreateTime: +new Date,
				MsgType: 'video',
				Video: { 
					MediaId: msg['MediaId'],
					Title: '',
					Description: ''
				}
			});
			break;	
		case 'location':
			console.log(msg['Location_X']);
			console.log(msg['Location_Y']);
			console.log(msg['Scale']);
			console.log(msg['Label']);
			break;	
		case 'event':
			var ev = msg['Event'];
			switch(ev){
				case 'subscribe':
					res.reply({
						ToUserName: msg['FromUserName'],
						FromUserName: msg['ToUserName'],
						CreateTime: +new Date,
						MsgType: 'text',
						Content: 'Welcome join us !'
					});
					break;
				case 'unsubscribe':
					console.log('bye');
					break;
			}
			break;
	}
}));


app.listen(3001);
