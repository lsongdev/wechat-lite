'use strict';
const http    = require('http');
const WeChat  = require('..');

const app = new WeChat.Server('token', function(err, message){
  if(err) return console.error(err);
  // console.log('Incoming', message);
  switch (message.MsgType) {
    case 'text':
      return message.Content;
    case 'link':
      return message.Url;
    case 'location':
      return message.Label;
    case 'event':
      if(message.Event === 'subscribe'){
        return "Hello, welcome to my wechat channel";
      }
      break;
    case 'image':
      return message.PicUrl;
    default:
      return message;
  }
});

http.createServer(app).listen(3000);