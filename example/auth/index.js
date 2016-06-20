'use strict';
const http    = require('http');
const kelp    = require('kelp');
const body    = require('kelp-body');
const send    = require('kelp-send');
const route   = require('kelp-route');
const logger  = require('kelp-logger');
const WeChat  = require('../../');

const wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

const app = kelp();

app.use(send);
app.use(body);
app.use(logger);

app.use(route('/callback', function(req, res){
  wx.auth_token(req.query['code'])
  .then(function(token){
    return wx.auth_user(token.access_token, token.openid);
  })
  .then(function(user){
    console.log(user);
    res.send(`<!doctype html>
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
}));

app.use(route('/', function(req, res){
  var url = wx.auth_url('http://m.maoyan.com/callback');
  res.send(`<!doctype html>
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
}));

const server = http.createServer(app).listen(4000);
