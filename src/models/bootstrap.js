const userStore = require('./userStore');

async function ensureAdminUser() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    return null;
  }
  if (userStore.findByEmail(email)) {
    return null;
  }
  return userStore.create({
    nombre: 'Administrador RedDona',
    email,
    password,
    role: 'admin',
  });
}

module.exports = { ensureAdminUser };
