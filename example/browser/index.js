'use strict';
const http    = require('http');
const kelp    = require('kelp');
const body    = require('kelp-body');
const send    = require('kelp-send');
const route   = require('kelp-route');
const serve   = require('kelp-static');
const logger  = require('kelp-logger');
const WeChat  = require('../../');

var wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

const app = kelp();

app.use(logger);
app.use(send);
app.use(body);
app.use(serve(__dirname));

var _ticket;

wx.getToken()
.then((token) => token.access_token)
.then(wx.getTicket.bind(wx))
.then(function(ticket){
  _ticket = ticket.ticket;
});

app.use(route('/wechat', function(req, res){
  res.end(JSON.stringify(wx.genSignature(_ticket)(req.query.url)));
}));

var server = http.createServer(app).listen(4000);
