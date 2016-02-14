const url  = require('url');
const http = require('http');
const wechat  = require('../server');

const server = http.createServer(wechat('token', function(err, message){
  return message.Content;
}));

server.listen(3000);
