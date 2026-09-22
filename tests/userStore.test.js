const userStore = require('../src/models/userStore');

describe('models/userStore', () => {
  beforeEach(() => {
    userStore.reset();
  });

  test('create rechaza un rol invalido', async () => {
    await expect(
      userStore.create({ nombre: 'X', email: 'x@example.com', password: 'clave1234', role: 'root' }),
    ).rejects.toThrow('INVALID_ROLE');
  });

  test('create rechaza un email duplicado', async () => {
    await userStore.create({ nombre: 'X', email: 'dup@example.com', password: 'clave1234' });
    await expect(
      userStore.create({ nombre: 'Y', email: 'dup@example.com', password: 'clave1234' }),
    ).rejects.toThrow('EMAIL_TAKEN');
  });

  test('findByEmail no distingue mayusculas/minusculas', async () => {
    await userStore.create({ nombre: 'X', email: 'Mayus@Example.com', password: 'clave1234' });
    expect(userStore.findByEmail('mayus@example.com')).toBeDefined();
  });

  test('verifyPassword retorna false para password incorrecto', async () => {
    const user = await userStore.create({ nombre: 'X', email: 'v@example.com', password: 'clave1234' });
    const valid = await userStore.verifyPassword(user, 'incorrecta');
    expect(valid).toBe(false);
  });

  test('all retorna usuarios sin passwordHash', async () => {
    await userStore.create({ nombre: 'X', email: 'a@example.com', password: 'clave1234' });
    const all = userStore.all();
    expect(all[0].passwordHash).toBeUndefined();
  });

  test('findById retorna undefined si no existe', () => {
    expect(userStore.findById('no-existe')).toBeUndefined();
  });
});
