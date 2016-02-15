WeChat Client
=============

+ 获取 UUID
+ 生成二维码
+ 等待客户端扫描
+ 获取登录凭证
+ 客户端初始化
+ 发送和接受消息
 
客户端接口依赖 [核心接口API](/lib/index.js), 所以需要创建API实例

```javascript
const WeChat = require('wechat-lite');

const wx = new WeChat({
  appId: 'wx-your-app-id'
});
```

## 获取 UUID

```js
wx.getUUID().then(function(uuid){
  console.log(uuid);
})
```

## 生成二维码

```js
console.log(wx.qrcode(uuid));
```

## 等待客户端扫描

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

## 获取登录凭证

```js
wx.login(url).then(function(info){
  console.log(login); // 用户登录凭证
})
```

## 客户端初始化

```js
const client = new WeChat.Client(login);

client.init(); // 初始化
```

## 发送和接受消息

```js
client.send('hi').then(function(){
  // 发送成功
});
```

