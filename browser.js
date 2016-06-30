'use strict';
/**
 * [WeChat client sdk]
 * @param {[type]} config [description]
 * @param {[type]} ready  [description]
 * @docs http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 */
function WeChat(config){
  if(!(this instanceof WeChat)){
    return new WeChat(config, apis, done);
  }
  var defaults = {
    signType: 'sha1'
  };
  
  for(var key in config){
    defaults[ key ] = config[ key ];
  }
  this.config = defaults;
  return this;
};

/**
 * [function merge]
 * @param  {[type]} a [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
WeChat.merge = function(a, b){
  var obj = {}, key;
  for(key in a) obj[key] = a[key];
  for(key in b) obj[key] = b[key];
  return obj;
};
/**
 * [function copy]
 * @param  {[type]} src  [description]
 * @param  {[type]} maps [description]
 * @return {[type]}      [description]
 */
WeChat.copy = function(src, maps){
  var obj = {};
  for(var to in maps){
    var from = maps[to];
    obj[ to ] = String(src[ from ]);
  }
  return obj;
};
/**
 * [function log]
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
WeChat.prototype.log = function(msg){
  msg = [ '[WeChat]', msg ].join(': ');
  if(this.config.debug) alert(msg);
  else console.debug(msg);
  return this;
};

/**
 * [function ready]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
WeChat.prototype.ready = function(callback){
  var self = this;
  function done(){
    self.bridge = WeixinJSBridge;
    callback.call(self, self);
    return self;
  };
  if(typeof WeixinJSBridge == 'object'){
    return done();
  }
  if(document.addEventListener){
    document.addEventListener("WeixinJSBridgeReady", done, false);
  }else if(document.attachEvent){
    document.attachEvent("WeixinJSBridgeReady", done);
    document.attachEvent("onWeixinJSBridgeReady", done);
  }
  return this;
};

/**
 * [function init]
 * @param  {[type]}   apis     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
WeChat.prototype.init = function(apis, callback){
  return this.invoke('preVerifyJSAPI', {
    verifyJsApiList: apis
  }, callback);
};

/**
 * [function description]
 * @param  {[type]} event   [description]
 * @param  {[type]} handler [description]
 * @return {[type]}         [description]
 */
WeChat.prototype.on = function(event, handler){
  if(!this.bridge) return this.log('bridge is not defined');
  this.bridge.on(event, handler);
  return this;
};

/**
 * [function description]
 * @param  {[type]}   method   [description]
 * @param  {[type]}   args     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
WeChat.prototype.invoke = function(method, args, callback){
  if(!this.bridge) return this.log('bridge is not defined');
  var params = WeChat.copy(this.config, {
               appId : 'appId'      ,
         verifyAppId : 'appId'      ,
      verifySignType : 'signType'   ,
     verifyTimestamp : 'timestamp'  ,
      verifyNonceStr : 'noncestr'   ,
     verifySignature : 'signature'
  });
  this.bridge.invoke(method, WeChat.merge(params, args), callback);
  return this;
};

/**
 * [function network]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
WeChat.prototype.network = function(callback){
  return this.invoke('getNetworkType', null, function(result){
    callback(result.err_msg.match(/network_type:(\w+)/)[1]);
  });
};
/**
 * [function description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
WeChat.prototype.close = function(callback){
  return this.invoke('closeWindow', null, callback);
};

/**
 * [expose wechat]
 * @param  {[type]}
 * @return {[type]}
 */
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return WeChat;
  });
} else if (typeof module != 'undefined' && module.exports) {
  module.exports = WeChat;
} else {
  this.WeChat = WeChat;
}
