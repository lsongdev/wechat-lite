# wechat-lite

![travis-ci](https://travis-ci.org/song940/wechat-lite.svg) 
[![Circle CI](https://circleci.com/gh/song940/wechat-lite.svg)](https://circleci.com/gh/song940/wechat-lite)

[WeChat](https://wx.qq.com/) API for nodejs .

[![NPM](https://nodei.co/npm/wechat-lite.png?downloads=true&stars=true)](https://nodei.co/npm/wechat-lite/)

## Installation

	npm install wechat-lite --save

## Documentation

This project offers developers many interfaces, Currently provided:
本项目包含了很多微信开发相关的接口，当前提供：

+ [WeChat Core API](./docs/api.md) low-level core apis, signature, token, login and more .
	- 微信核心接口，包含：服务签名、扫码登陆、H5登陆、公众号消息推送等功能。
+ [WeChat Browser SDK](./docs/browser.md) call web/client apis in  wechat mobile client .
	- 微信客户端 Webview 容器桥协议，与官方 API 相比实现更加纯净简单。
+ [WeChat Message Handler](./docs/server.md) handle and respond message from official-account followers .
	- 微信公众号服务端，用于接收用户与公众号的交互。
+ [WeChat Client](./docs/client.md) use the official non-public interface, like [WeChat Web Client](https://wx.qq.com) send and receive messages .
	- 微信客户端的非官方实现，分析了微信网页客户端的接口实现。可以做微信聊天机器人。
+ [WeChat MiniProgram](./docs/wxapp.md) developer tools login, preview, upload and more .
	- 微信小程序开发者工具，反编译了微信小程序开发者工具，重新实现了小程序的扫码登陆、数据打包、预览、发布上传等功能。

see [docs](/docs) .

## Licence

The MIT License (MIT)
Copyright © 2014 Lsong

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
