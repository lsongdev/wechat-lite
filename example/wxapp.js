const MINA = require('../wxapp');

const devtools = new MINA();

(async () => {
  const ticket = await devtools.login(console.log);
  console.log(ticket);
})();
