const createApp = require('./app');
const { ensureAdminUser } = require('./models/bootstrap');
const { port } = require('./config/env');

async function start() {
  await ensureAdminUser();
  const app = createApp();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`RedDona API escuchando en el puerto ${port}`);
  });
}

start();
