/**
 * [Wechat client sdk]
 * @param {[type]} config [description]
 * @param {[type]} ready  [description]
 * @docs http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 */
function Wechat(config, ready){

  if(!(this instanceof Wechat)){
    return new Wechat(config).ready(ready);
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

Wechat.filter = function(src, fields){
  var obj = {};
  for(var i in fields){
    var key = fields[ i ];
    obj[key] = src[key];
  }
  return obj;
};

Wechat.merge = function(a, b){
  var obj = {}, key;
  for(key in a) obj[key] = a[key];
  for(key in b) obj[key] = b[key];
  return obj;
};

Wechat.copy = function(src, maps){
  var obj = {};
  for(var to in maps){
    var from = maps[to];
    obj[ to ] = String(src[ from ]);
  }
  return obj;
};

Wechat.prototype.network = function(callback){
  this.invoke('getNetworkType', null, function(result){
    callback(result.err_msg.match(/network_type:(\w+)/)[1]);
  });
};

Wechat.prototype.close = function(callback){
  this.invoke('closeWindow', null, callback);
};

Wechat.prototype.share = function(channel, shareData, callback){
  var that = this;
  if(!!~channel.indexOf(',')){
    channel = channel.split(',');
    for(var i in channel){
      this.to(channel[i], callback);
    }
    return this;
  }
  var apiMap = {
    timeline   : {
      api   : 'shareTimeline'       ,
      event : 'menu:share:timeline' ,
      format: function(data){
        return {
          title   : data.title  ,
          img_url : data.icon   ,
          desc    : data.desc || data.title,
          link    : data.link || location.href
        };
      }
    },
    message : {
      api   : 'sendAppMessage',
      event : 'menu:share:appmessage',
      format: function(data){
        return {
          title   : data.title  ,
          desc    : data.desc   ,
          img_url : data.icon   ,
          data_url: data.data   ,
          type    : data.type || 'link',
          link    : data.link || location.href
        };
      }
    }
  };
  this.on(apiMap[ channel ].event, function(){
    that.invoke(
      apiMap[ channel ].api,
      apiMap[ channel ].format(shareData),
      callback
    );
  })
};

Wechat.prototype.enable = function(apis, callback){
  var that = this;
  this.invoke('preVerifyJSAPI', {
    verifyJsApiList: apis
  }, callback);
};

Wechat.prototype.invoke = function(method, args, callback){
  var params = Wechat.copy(this.config, {
               appId : 'appId'      ,
         verifyAppId : 'appId'      ,
      verifySignType : 'signType'   ,
     verifyTimestamp : 'timestamp'  ,
      verifyNonceStr : 'noncestr'   ,
     verifySignature : 'signature'
  });
  this.bridge.invoke(method, Wechat.merge(params, args), callback);
};

Wechat.prototype.on = function(event, handler){
  this.bridge.on(event, handler);
};

Wechat.prototype.ready = function(callback){
  var that = this;
  var done = function(){
    that.bridge = WeixinJSBridge;
    that.enable(that.config.apis, function(err){
      callback.apply(that, that);
    });
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
};
/**
 * [expose wechat]
 * @param  {[type]}
 * @return {[type]}
 */
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return Wechat;
  });
} else if (typeof module != 'undefined' && module.exports) {
  module.exports = Wechat;
} else {
  this.Wechat = Wechat;
}
