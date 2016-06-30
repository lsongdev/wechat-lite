WeChat Client
=============

+ Get UUID
+ Generate QRCode
+ Waiting for scan
+ Get login info
+ Client Initialization
+ Send and receive messages

Client interface depend [WeChat Core API](/lib/index.js), you need to create an instance of `WeChat`

```javascript
const WeChat = require('wechat-lite');

const wx = new WeChat({
  appId: 'wx-your-app-id'
});
```

## Get UUID

```js
wx.uuid().then(function(uuid){
  console.log(uuid);
})
```

## Generate QRCode

```js
console.log(wx.qrcode(uuid));
```

## Waiting for scan

```js
(function wait(){
  wx.status(uuid).then(function(status){
    if(status.code == 200){
      console.log(status.redirect_uri); //登录URL
    }else{
      wait();
    }
  });
})()
```

## Get login info

```js
wx.login(url).then(function(info){
  console.log(info); // login info
})
```

## Client Initialization

```js
const client = new WeChat.Client(login);

client.init().then(function(){
  // success
});
```

## Send and receive messages

```js
client.send('hi').then(function(){
  // success
});
```
