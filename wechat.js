var crypto = require('crypto');
var jstoxml = require('jstoxml');

var msgQueue = [];

var getFirst = function(arr){
	return arr[0];
};

var parseMsg = function(data){
	for(var key in data){
		data[key] = getFirst(data[key]);
	}
	return data;
};

var checkSignature = function(token, req, res, callback){
		req.verify = false;
		var nonce 	= req.query['nonce'];
		var echostr = req.query['echostr'];
		var signature = req.query['signature'];
		var timestamp = req.query['timestamp'];
		if(signature){
			var sha1 = crypto.createHash('sha1');
			var argArr = [ token, timestamp, nonce ].sort();
			var argHash = sha1.update(argArr.join(''));
			req.verify = argHash.digest('hex') == signature;
			if(req.verify){
				if(req.method == 'GET'){
					res.send(echostr);
				}else{
					callback();
				}
			}else{
				res.send(401);
			}
		}else{
			res.status(500).send('arguments not found.');
		}
};

var wechat = function(token, callback){
	return function(req, res){
		checkSignature(token, req, res, function(){
			var body = req.body;
			var data = req.body['xml'];
			res.reply = function(msg){
				var xml = jstoxml.toXML({ xml: msg });
				console.log(xml);
				res.send(xml);
			};
			var msg = parseMsg(data);
			var seed  = msg.CreateTime;
			if(!~msgQueue.indexOf(seed)){
				msgQueue.push(seed);
				req.msg = msg;
				callback(req, res);
			}
		});
	};
};

module.exports = wechat;
