const userStore = require('../src/models/userStore');
const { ensureAdminUser } = require('../src/models/bootstrap');

describe('models/bootstrap', () => {
  const originalEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const originalPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  beforeEach(() => {
    userStore.reset();
  });

  afterAll(() => {
    process.env.ADMIN_BOOTSTRAP_EMAIL = originalEmail;
    process.env.ADMIN_BOOTSTRAP_PASSWORD = originalPassword;
  });

  test('no crea admin si faltan las variables de entorno', async () => {
    delete process.env.ADMIN_BOOTSTRAP_EMAIL;
    delete process.env.ADMIN_BOOTSTRAP_PASSWORD;
    const result = await ensureAdminUser();
    expect(result).toBeNull();
  });

  test('no crea un admin duplicado si ya existe', async () => {
    process.env.ADMIN_BOOTSTRAP_EMAIL = 'admin@reddona.org';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'AdminSeguro123';
    await ensureAdminUser();
    const second = await ensureAdminUser();
    expect(second).toBeNull();
  });
});
