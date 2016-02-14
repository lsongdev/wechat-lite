API
===

import [wechat-lite](https://npmjs.org/package/wechat-lite) first .

```js
const WeChat = require('wechat-lite');

const wx = new WeChat({
  appId     : 'wx-your-app-id',
  appSecret : 'xxxx'
});
```

get authorize url

```js
var url = wx.getAuthorizeURL('http://lsong.org/callback');
```

when user pass request, browser will redirect 

```js
var code = req.query[ 'code' ];
wx.getAuthorizeToken().then(function(token){
  console.log(token);
});
```

get user info

```js
wx.getUser(token.access_token, token.openid).then(function(user){
  console.log(user);
});
```
