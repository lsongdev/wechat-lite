var http = require('http');
var WeChat = require('../../');

function serve(file){
  var fs = require('fs');
  return function(req, res){
    var path = req.url;
    if(path == '/') path = '/index.html';
    path = __dirname + path;
    if(fs.existsSync(path)){
      fs.createReadStream(path).pipe(res);
      return true;
    }else{
      return false;
    }
  }
}

var s = serve(__dirname);

var wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

var _ticket;

wx.getToken()
.then(function(token){
  return token.access_token;
})
.then(wx.getTicket.bind(wx))
.then(function(ticket){
  _ticket = ticket.ticket;

});

var server = http.createServer(function(req, res){
  if(!s(req, res)){
    console.log(_ticket)
    var body = wx.genSignature(_ticket)(req.url.split('?url=')[1]);
    res.write(JSON.stringify(body));
    res.end();
  }
}).listen(3000);
