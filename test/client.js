const WeChat = require('../');

var client = new WeChat.SuperClient('wx782c26e4c19acffb');

client.on('ready', function(d){
  console.log('ready', d.ChatSet.split(',').filter(function(chat){
    return chat.startsWith('@');
  }));
})

client.on('session:enter', function(){
  console.log('ENTER_SESSION');
});

client.on('session:quit', function(){
  console.log('QUIT_SESSION');
});

client.on('message:readed', function(){
  console.log('READED');
});

client.on('message:text', function(msg){
  // console.log(client.getUserFromUserName(msg.FromUserName));
  // console.log(client.getUserFromUserName(msg.ToUserName));
  // console.log(client.getUserFromUserName(msg.ActualSender));
});

client.on('contacts', function(contacts){
  // console.log(contacts.map(function(contact){
  //     return contact.UserName;
  // }));
});

//
client.uuid()
// .then(client.qrcode.bind(client))
// .then(client.waitingForScan.bind(client))
// .then(client.login.bind(client))
.then(function(d){
  console.log(d);
  // return d;
  return { wxuin: '364349275',
  wxsid: 'oviRukv0lk1q7sFk',
  webwx_data_ticket: 'AQeBYLHOVvF2R5fg7y5mX0KC' };
})
.then(client.init.bind(client))
.then(client.contacts.bind(client))
.then(client.loop.bind(client))
.catch(function(err){
  console.log(err);
})
