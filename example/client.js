const WeChat = require('..');

const client = WeChat.Client({
  appId: 'wx782c26e4c19acffb'
});

client.once('qrcode', url => {
  console.log('[WeChat]>', url);
});

client.on('scan', () => {
  console.log('[WeChat]> scan');
});

client.on('login', user => {
  console.log('[WeChat]> login success');
});

client.on('session:enter', () => {
  console.log('session:enter');
});

client.on('session:quit', () => {
  console.log('session:quit');
});

client.on('moments', () => {
  console.log('moments');
});

client.on('message:text', msg => {
  const [ from ] = (client.MemberList || []).filter(x => x.UserName === msg.FromUserName);
  console.log('[%s]>', from ? from.NickName : msg.FromUserName, msg.Content);
  client.send(msg.Content,  'filehelper');
});