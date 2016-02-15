'use strict';
const url     = require('url');
const http    = require('http');
const connect = require('connect');
const WeChat  = require('../../');

const wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

const app = connect();

// simple logger
app.use(function(req, res, next){
  var start = new Date;
  next();
  console.log('-> %s %s %s %sms',
    req.method    ,
    req.url       ,
    res.statusCode,
    new Date - start);
});

app.use('/callback', function(req, res){
  var u = url.parse(req.url, true);

  wx.getAuthorizeToken(u.query['code'])
  .then(function(token){
    return wx.getUser(token.access_token, token.openid);
  })
  .then(function(user){
    res.end(`<!doctype html>
    <html>
    <head>
      <title>${user.nickname} @ WeChat</title>
      <meta name="viewport" content="width=device-width">
      <style>
        body{ text-align: center; }
        .avatar{ width: 200px; }
      </style>
    </head>
    <body>
      <img class="avatar" src="${user.headimgurl}" />
      <h2>${user.nickname}</h2>
      <p>${user.province} / ${user.country}</p>
    </body>
    </html>
    `);
  })
});

app.use('/', function(req, res){
  var url = wx.getAuthorizeURL('http://m.maoyan.com/callback');
  res.end(`<!doctype html>
  <html>
    <head>
    <title>WeChat</title>
    <style>
      body{ text-align: center; }
    </style>
    </head>
    <body>
      <h1>Scan QRCode on this below</h1>
      <img class="qr" src="http://api.lsong.org/qr?text=${encodeURIComponent(url)}" />
    </body>
  </html>`);
});

const server = http.createServer(app).listen(4000);
