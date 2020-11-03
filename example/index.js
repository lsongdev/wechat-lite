const WeChat = require('..');

(async () => {

  const wechat = new WeChat({
    appid: 'wxfb9dc00461bcef17',
    secret: '21f48e4c7c68683b681ca81ba60d3190'
  });

  const { data: { openid: users } } = await wechat.user_list();
  console.log('users:', users);
  const user = await wechat.user_get(users[0]);
  console.log('user:', user);

})();
