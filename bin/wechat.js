'use strict';
const net           = require('net');
const WeChat        = require('../');
const EventEmitter  = require('events');

const EOL = '\n';

class Client extends EventEmitter {
  constructor(socket){
    super();
    this.socket = socket;
  }
  send(message){
    this.socket.write((message || '') + EOL);
  }
}

var server = net.createServer(function(socket){
  var client = new Client(socket);
  client.send('========================');
  client.send("Welcome to WeChat Server");
  client.send('========================');

  var wx = new WeChat({
    appId: 'wx782c26e4c19acffb'
  });
  var _uuid = '';
  client.wx.getUUID().then(function(uuid){
    _uuid = uuid;
    client.send('QRCode: ' + client.wx.qrcode(uuid));
  });


});

server.listen(2121);
