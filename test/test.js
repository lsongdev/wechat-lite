'use strict';
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
