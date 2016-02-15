'use strict';
const url  = require('url');
const http = require('http');
const WeChat  = require('../');

var app = new WeChat.Server('token', function(err, message){
  return message.Content;
});

http.createServer(app).listen(3000);

// const server = http.createServer(WeChat.Server('token', function(err, message){
//   return message.Content;
// }));

// server.listen(3000);
