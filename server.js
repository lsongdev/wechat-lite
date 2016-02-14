const url    = require('url');
const crypto = require('crypto');
const xml2js = require('xml2js');
const js2xml = require('jstoxml');

module.exports = function WeChat(token, callback){
  function genSignature(token, timestamp, nonce){
    return crypto
      .createHash('sha1')
      .update(([]).slice.call(arguments).sort().join(''))
      .digest('hex');
  }

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
        //
        var message = {};
        Object.keys(result.xml).forEach(function(key){
          message[ key ] = result.xml[ key ][0];
        });
        //
        var scope = {
          send: function(reply){
            if(typeof reply == 'string'){
              reply = {
                MsgType : 'text',
                Content : reply
              };
            }
            if(reply){
              reply.FromUserName = message.ToUserName;
              reply.ToUserName   = message.FromUserName;
              reply.CreateTime   = +new Date;
              res.end(js2xml.toXML({ xml: reply }));
            }
          }
        };

        scope.send(callback.call(scope, null, message));
      });
    }).on('error', callback);
  };
};
