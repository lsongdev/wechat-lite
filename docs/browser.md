Browser side
============

```html
<script src="//cdn.rawgit.com/song940/wechat-lite/master/browser.js" ></script>
```

create `WeChat` instance

```javascript
var wx = new WeChat(/* signature */);

function onWeChatReady(){
  // ready
}

wx.ready(onWeChatReady);
```

Initialization

```javascript
function onWeChatReady(){
  this.init([
    'menu:share:timeline',
    'menu:share:appmessage'
  ]);
}
```
