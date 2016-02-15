Browser side
============

在页面 `html` 中引入 JS 文件:

```html
<script src="//cdn.rawgit.com/song940/wechat-lite/master/browser.js" ></script>
```

然后创建 `WeChat` 实例 

```javascript
var wx = new WeChat(/* signature */);

function onWeChatReady(){
  // ready
}

wx.ready(onWeChatReady);
```

初始化

```javascript
function onWeChatReady(){
  this.init([
    'menu:share:timeline',
    'menu:share:appmessage'
  ]);
}

```
