const config = require('kelp-config');
const WeChat = require('../');

var wx = new WeChat({
  appId: 'wx87730701f3d95cc4',
  appSecret: 'fd519eaf105122523356f80e921f044b'
});

wx.jscode2session('wx87730701f3d95cc4', 'fd519eaf105122523356f80e921f044b', '011sRh1a1vRvFU1JzR0a1Moe1a1sRh1a').then(function(res){
  console.log(res);
})
