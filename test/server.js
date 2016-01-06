var http   = require('http');
var wechat = require('../server');

http.createServer(wechat('token', function(req, res){
  // echo
  res.pipe(req);
})).listen(3000);
