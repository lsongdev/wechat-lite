'use strict';
const http    = require('http');
const kelp    = require('kelp');
const body    = require('kelp-body');
const send    = require('kelp-send');
const route   = require('kelp-route');
const serve   = require('kelp-static');
const logger  = require('kelp-logger');
const WeChat  = require('../../');
const config  = require('../../package');

var wx = new WeChat(config.wechat);

const app = kelp();

app.use(logger);
app.use(send);
app.use(body);
app.use(serve(__dirname));

app.use(route('/wechat', function(req, res){
  wx.ticket().then(function(ticket){
    // console.log(ticket);
    res.end(JSON.stringify(wx.genSignature(ticket.ticket)(req.query.url)));
  })
}));

var server = http.createServer(app).listen(4000);
