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
    console.log(wx.getAuthorizeURL('http://m.maoyan.com/redirect/piaofang?_v_=yes', WeChat.SCOPE.BASE, '123'));
  });

  it('get authorize token', function(done){
    wx.getAuthorizeToken('0019f65a8630c62582db44d7a5eeb8ec').then(function(token){
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
    wx.getUser('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hUV2tBTOFOKIqvkVETJJ3awXTWIWMIOvNt8Km6ntD-5i_M3KlGOjDzx13cGStNbn__w-Du8hZxOngLVRK6iAIww', 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw', 'en').then(function(user){
      console.log(user);
      done()
    });
  })

});

// auth.on('error', function(err){
//   console.error(err);
// });

// auth.getToken().then(function(token){
//   console.log(token.access_token);
// });

// //
// describe('should be ok', function() {

//   assert.equal(auth.checkSignature('token', 1, 'xxx', '369e1a9cba84ca172e7abfc9de031d96f64862af', 'ok'), 'o');

// });
