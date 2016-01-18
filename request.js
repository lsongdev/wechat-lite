'use strict';
const url   = require('url');
const qs    = require('querystring');
const http  = require('http');
const https = require('https');
const debug = require('debug')('R');

class R {
  constructor(){
    this._query   = {};
    this._headers = {};
    this._method  = 'get';
  }
  static json(){
    return function(res){
      return JSON.parse(res.text);
    }
  }
  get(u){
    this._method = 'get';
    if(u) {
      this._url = url.parse(u);
      this._query = qs.parse(this._url.query);
    }
    return this;
  }
  post(u){
    this._method = 'post';
    if(u) {
      this._url = url.parse(u);
      this._query = qs.parse(this._url.query);
    }
    return this;
  }
  cookie(cookies){
    this._headers[ 'Cookie' ] = Object.keys(cookies).map(function(key){
      return [ key, cookies[ key ] ].join('=');
    }).join('; ');
    return this;
  }
  query(key, value){
    debug('query', key, value);
    if(value){
      this._query[ key ] = value;
    }else{
      for(var k in key) this._query[ k ] = key[ k ];
    }
    return this;
  }
  send(data){
    debug('send', data);
    this._method = 'post';
    this._data = data;
    return this;
  }
  header(key, value){
    debug('header', key, value);
    if(value){
      this._headers[ key ] = value;
    }else{
      for(var k in key) this._headers[ k ] = key[ k ];
    }
    return this;
  }
  end(callback){
    var self = this;
    var options = self._url;
    options.method = self._method;
    options.headers = this._headers;
    options.path = [ options.pathname, Object.keys(self._query).map(function(key){
      return [ key, self._query[ key ] ].join('=');
    }).join('&') ].join('?');
    if(this._data){
      var data = JSON.stringify(this._data);
      options.headers[ 'Content-Length' ] = data.length;
    }
    debug('end', options);
    var p = new Promise(function(accept, reject){
      var req = (options.protocol == 'https:' ? https : http).request(options, function(res){
        var buffer = [];
        res.on('error', reject).on('data', function(chunk){
          buffer.push(chunk);
        }).on('end', function(){
          accept({
            text       : buffer.join(''),
            headers    : res.headers,
            statusCode : res.statusCode
          });
        });
      });
      if(self._data) req.write(data);
      req.on('error', reject);
      req.end();
    });
    if(callback){
      p.then(function(res){
        callback(null, res);
      }, callback).catch(callback);
      return this;
    }
    return p;
  }
}

module.exports = R;
