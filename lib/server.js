'use strict';
const url    = require('url');
const crypto = require('crypto');
const xml2js = require('xml2js');
const js2xml = require('jstoxml');

/**
 * [WeChatServer description]
 * @param {[type]}   token    [description]
 * @param {Function} handler [description]
 */
function WeChatServer(token, handler){
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
   * [parse description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   * @docs http://mp.weixin.qq.com/wiki/17/f298879f8fb29ab98b2f2971d42552fd.html
   */
  function parse(data){
    var self = this;
    xml2js.parseString(data, function(err, result){
      var message = {};
      Object.keys(result.xml).forEach(function(key){
        message[ key ] = result.xml[ key ][0];
      });
      /**
       * [send description]
       * @param  {[type]} reply [description]
       * @return {[type]}       [description]
       */
       function send(reply){
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
         self.end(js2xml.toXML({ xml: reply }));
       };
      send(handler.call({ send: send }, null, message));
      
    });
  };
  /**
   * [function description]
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  return function request(req, res){
    var buffer = [];
    var query = url.parse(req.url, true).query;
    var signature = genSignature(token, query.timestamp, query.nonce);
    if(!(signature == query.signature)) return res.end('Invalidate signature');
    if(req.method == 'GET') return res.end(query.echostr);
    req
    .on('data', function(chunk){
      buffer.push(chunk);
    })
    .on('end', function(){
      parse.call(res, buffer.join(''));
    })
    .on('error', handler);
  };
};
/**
 * [exports description]
 * @type {[type]}
 */
module.exports = WeChatServer;
