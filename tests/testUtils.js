const userStore = require('../src/models/userStore');
const donorStore = require('../src/models/donorStore');
const createApp = require('../src/app');

function resetStores() {
  userStore.reset();
  donorStore.reset();
}

function buildApp() {
  return createApp();
}

module.exports = { resetStores, buildApp };
