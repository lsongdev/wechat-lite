const WeChat = require('../');

const client = new WeChat.Client(config.wechat);

client.uuid().then(function(uuid){
  console.log('>', client.qrcode(uuid));

  (function wait(){
  
    client.status(uuid).then(function(status){
      switch (status.code) {
        case 200:
          client.login(status.redirect_uri).then(function(info){
            console.log('> login success', info);
            client.init(info).then(function(){
              
            });
          });
          break;
        case 201:
          console.log('> scan success');
        default:
          wait();
          break;
      }
    });
  
  })();

});
