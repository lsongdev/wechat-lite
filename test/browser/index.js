'use strict';
const url     = require('url');
const http    = require('http');
const connect = require('connect');
const serveStatic = require('serve-static')
const WeChat  = require('../../');

var wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

const app = connect();

app.use(serveStatic(__dirname))

var _ticket;

wx.getToken()
.then(function(token){
  return token.access_token;
})
.then(wx.getTicket.bind(wx))
.then(function(ticket){
  _ticket = ticket.ticket;
});

app.use('/wechat', function(req, res){
  var u = url.parse(req.url, true);
  res.end(JSON.stringify(wx.genSignature(_ticket)(u.query['url'])));
});

var server = http.createServer(app).listen(4000);
