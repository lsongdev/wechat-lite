const url    = require('url');
const crypto = require('crypto');
const xml2js = require('xml2js');
const js2xml = require('jstoxml');

module.exports = function WeChat(token, callback){
  /**
   * [genSignature description]
   * @param  {[type]} token     [description]
   * @param  {[type]} timestamp [description]
   * @param  {[type]} nonce     [description]
   * @return {[type]}           [description]
   */
  function genSignature(token, timestamp, nonce){
    return crypto
      .createHash('sha1')
      .update(([]).slice.call(arguments).sort().join(''))
      .digest('hex');
  }
  /**
   * [function description]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  return function(req, res){
    var query = url.parse(req.url, true).query;
    var signature = genSignature(token, query.timestamp, query.nonce);
    if(!(signature == query.signature)) return res.end('Invalidate signature');
    if(req.method == 'GET') return res.end(query.echostr);
    //
    var buffer = [];
    req.on('data', function(chunk){
      buffer.push(chunk);
    }).on('end', function(){
      xml2js.parseString(buffer.join(''), function(err, result){
        // http://mp.weixin.qq.com/wiki/17/f298879f8fb29ab98b2f2971d42552fd.html
        var message = {};
        Object.keys(result.xml).forEach(function(key){
          message[ key ] = result.xml[ key ][0];
        });
        var scope = {
          send: function(reply){
            if(!reply) return;
            if(typeof reply == 'string'){
              reply = {
                MsgType : 'text',
                Content : reply
              };
            }
            reply.FromUserName = message.ToUserName;
            reply.ToUserName   = message.FromUserName;
            reply.CreateTime   = +new Date;
            res.end(js2xml.toXML({ xml: reply }));
          }
        };
        //
        scope.send(callback.call(scope, null, message));
      });
    }).on('error', callback);
  };
};
