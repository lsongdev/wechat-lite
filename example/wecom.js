const WeCom = require('../wecom');

const wecom = new WeCom({
  corpid: 'wx154021007ed664e5',
  corpsecret: 'z-W9O0wpdoUlhyneavoCa210xKQRj7qNceDeR6eGk9o',
  agentid: 1,
});

(async () => {
  const fn = wecom.message.sendText('hello', { agentid: 1 }).touser('@all');
  const res = await fn(wecom);
  console.log(res);
})();