Server Handler
==============

用于处理来自公众号和订阅号的请求, 并根据用户发送的消息作出响应。

开发者需要在微信公众平台配置一个 HTTP 服务接口, 和一个用于验证服务身份的 `Token` .

下面演示了一个非常简单的用法:

```
const http   = require('http');
const WeChat = require('wechat-lite');

function handleMessage(err, message){
  return message.Content;
}

const app = new WeChat.Server('my token', handleMessage);

const server = http.createServer(app);

server.listen(3000, function(err){
  console.log('server is running at %s', server.address().port);
})
```

其中 `handleMessage` 函数用于接收和处理用户发送给公众号的消息, 

这里仅仅原样返回了用户发送的消息(echo), 如果需要返回复杂的消息可以 `return` 一个 `JS Object` 

```
function handleMessage(err, message){
  return {
    ...
  };
}
```

## Async Sending Message

```
function handleMessage(err, message){
  setTimeout(() => {
    this.send('async');
  }, 1000);
}
```

这里需要注意的是: 根据[微信官方文档](http://mp.weixin.qq.com/wiki/7/c478375fae59150b26def82ec061f43b.html)显示 *异步发送时间不要超过 `5s`*



