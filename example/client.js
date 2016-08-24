const WeChat = require('../');
const config = require('kelp-config');

const client = new WeChat.Client({
  appId: 'wx782c26e4c19acffb'
});

client.on('scan', function(){
  console.log('scan success');
});

client.on('login', function(){
  console.log('login success');
});

client
.uuid()
.then(client.printQrcode.bind(client))
.then(client.wait       .bind(client))
.then(client.login      .bind(client))
.then(client.init       .bind(client))
.then(function(info){
  console.log(info);
})
