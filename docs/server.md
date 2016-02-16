Server Handler
==============

The following shows a simple usage:

```javascript
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

Here are just as return message (echo) sent by the user,

if you need to return other type messages can return a `JS Object`

```javascript
function handleMessage(err, message){
  return {
    ...
  };
}
```

## Async Sending Message

```javascript
function handleMessage(err, message){
  setTimeout(() => {
    this.send('async');
  }, 1000);
}
```
