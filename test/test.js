const WeChat = require('../');

var client = new WeChat.SuperClient('wx782c26e4c19acffb');

client.uuid()
.then(client.qrcode.bind(client))
.then(client.waitingForScan.bind(client))
.then(client.login.bind(client))
.then(client.init.bind(client))
.then(client.contacts.bind(client))
.then(client.loop.bind(client))
