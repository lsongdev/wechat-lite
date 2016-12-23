'use strict';
const http    = require('http');
const kelp    = require('kelp');
const body    = require('kelp-body');
const send    = require('kelp-send');
const route   = require('kelp-route');
const logger  = require('kelp-logger');
const config  = require('kelp-config');

const WeChat  = require('../../');

const wx = new WeChat(config);

const app = kelp();

app.use(send);
app.use(body);
app.use(logger);

app.use(route('/callback', function(req, res){
  // step2 get auth token by code
  const { code } = req.query;
  wx.auth_token(code).then(function(token){
    // step3 get user by token
    return wx.auth_user(token.access_token, token.openid);
  }).then(function(user){
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
  // step1
  var url = wx.auth_url(config.auth_safe_domain + '/callback', WeChat.AUTH_SCOPE.USER);
  console.log(url);
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
