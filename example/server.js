'use strict';
const http    = require('http');
const WeChat  = require('..');

const app = new WeChat.Server('token', function(err, message){
  if(err) return console.error(err);
  // console.log('Incoming', message);
  switch (message.MsgType) {
    case 'text':
      return message.Content;
      break;
    case 'link':
      return message.Url;
      break;
    case 'location':
      return message.Label;
      break;
    default:
      return message;
      break;
  }
});

http.createServer(app).listen(3000);