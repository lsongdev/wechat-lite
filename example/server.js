'use strict';
const url  = require('url');
const http = require('http');
const WeChat  = require('../');

var app = new WeChat.Server('token', function(err, message){
  // console.log(message);
  switch (message.MsgType) {
    case 'text':
      return message.Content; // text
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

// const server = http.createServer(WeChat.Server('token', function(err, message){
//   return message.Content;
// }));

// server.listen(3000);
