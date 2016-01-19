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


  it('get authorize URL', function(){
    wx.getAuthorizeURL('http://m.maoyan.com', null, '123')
  });

  it('get authorize token', function(done){
    wx.getAuthorizeToken('01109fabd1e741a9aac7348668be11eb').then(function(token){
      // console.log(token);
      done();
    });
  });


  it('check authorize token', function(done){
    wx.checkAuthorizeToken('OezaXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hqbjsSyi0EzWtHEEQOZIr0-cZoXmYc08_IH02VUnWQtjXQLxCm01lTUJ5nkvvjHUErttPRCivMRnNJRYf3JYfnw', 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw').then(function(res){
      // console.log(res);
      done();
    })
  })

  it('refresh authorize token', function(){
    wx.refreshAuthorizeToken('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hqbjsSyi0EzWtHEEQOZIr0_x7AxWXvlw1utoLbRpH-xxOWaZHnmjL-Xui_sYw8HMasAyBdEfK5vranWl_jV8ifg').then(function(res){
      console.log(res);
    });
  })

  it('get user info', function(){
    wx.getUser('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hqbjsSyi0EzWtHEEQOZIr0-cZoXmYc08_IH02VUnWQtjXQLxCm01lTUJ5nkvvjHUErttPRCivMRnNJRYf3JYfnw', 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw', 'en').then(function(user){
      // console.log(user);
    });
  })

});
