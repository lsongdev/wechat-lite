const WeChat = require('../');

var wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

describe('share api', function() {

  var accessToken = '';

  it('get token', function(done){
    wx.getToken().then(function(res){
      accessToken = res.access_token;
      done();
    });
  })

  it('get ticket', function(done){
    wx.getTicket(accessToken).then(function(ticket){
      // ticket.ticket
      done();
    });
  })

});

describe('authorize', function() {
  //
  it('get authorize URL', function(){
    console.log(wx.getAuthorizeURL('http://m.maoyan.com', WeChat.SCOPE.USER, '123'));
  });

  it('get authorize token', function(done){
    wx.getAuthorizeToken('0110ed94df29a1c0adeda594cb6c6b2P').then(function(token){
      console.log(token);
      done();
    });
  });


  it('check authorize token', function(done){
    wx.checkAuthorizeToken('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9helrxSZIMnxh09P5ZLFPrCQcjoTatkojZGG1NpeqD_y1XY1KKiM18GFBkiTdAyuhkVyAuZmbNRwU63Obzaww9uw', 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw').then(function(res){
      console.log(res);
      done();
    })
  })

  it('refresh authorize token', function(){
    wx.refreshAuthorizeToken('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hqbjsSyi0EzWtHEEQOZIr0_x7AxWXvlw1utoLbRpH-xxOWaZHnmjL-Xui_sYw8HMasAyBdEfK5vranWl_jV8ifg').then(function(res){
      console.log(res);
    });
  })

  it('get user info', function(done){
    wx.getUser('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YjdQ6KKeyFLnxHuJ0BrhtfNq4PpcpYuYfQ15FBcRfZtegkUrkSTseD-jwSfLFJBgigKC9r1MSE-RwqqMspkMTzpeqqZtI9C8pebyfBaMd41Q', 'ogpecs6OTcdMJkCAgWv77bhztHLY', 'en').then(function(user){
      console.log(user);
      done()
    });
  })

});
