const WeChat = require('../');

var wx = new WeChat({
  appId     : 'wx779ea5a9af3d5d09',
  appSecret : 'ea6eea9459b57da58dbc673d1f52c4df'
});

wx.getUUID().then(function(uuid){
  console.log(uuid);
})
//
// wx.getToken().then(function(res){
//   wx.getTicket(res.access_token).then(function(ticket){
//     console.log(ticket);
//   });
// });
//
// wx.getAuthorizeToken();
//
// console.log(wx.getAuthorizeURL('http://m.maoyan.com', null, '123'));
// wx.getAuthorizeToken('01109fabd1e741a9aac7348668be11eb').then(function(token){
//   console.log(token);
// });


// wx.getUser('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hQ8CZHz2Yg7V2A8r-nphJjYjfy_k3GqtK3rTRk0J_XYHzNQnJQNnk51M4hkAoEsOkZ42gTRRXfsL-EBYzub6ROg', 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw').then(function(user){
//   console.log(user);
// });
//
// wx.checkAuthorizeToken('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hQ8CZHz2Yg7V2A8r-nphJjYjfy_k3GqtK3rTRk0J_XYHzNQnJQNnk51M4hkAoEsOkZ42gTRRXfsL-EBYzub6ROg', 'ogpecs5Ch6rAvgZCNVI7Tw9H15xw').then(function(res){
//   console.log(res);
// })
// wx.refreshAuthorizeToken('OezXcEiiBSKSxW0eoylIeHEMo4ABkin7cUio3wV6I9YIElMx8V2Ir26CzZxUls9hqbjsSyi0EzWtHEEQOZIr0_x7AxWXvlw1utoLbRpH-xxOWaZHnmjL-Xui_sYw8HMasAyBdEfK5vranWl_jV8ifg').then(function(res){
//   console.log(res);
// });
