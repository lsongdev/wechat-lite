# wechat-lite

[WeChat]() API for nodejs .

[![NPM](https://nodei.co/npm/wechat-lite.png?downloads=true&stars=true)](https://nodei.co/npm/wechat-lite/)


## Installation

	npm install wechat-lite

## Usage

	var express = require('express');
  	var wechat = require('wechat-lite');
	
	var app = express();
	
	app.use('/wechat', wechat('token', function(req, res){
		var ToUserName = req.msg['ToUserName'];
  		var FromUserName = req.msg['FromUserName'];
  		req.msg['ToUserName'] = FromUserName;
  		req.msg['FromUserName'] = ToUserName;
  		res.reply(req.msg);
	}));

## Licence

The MIT License (MIT)
Copyright © 2014 Lsong

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	  