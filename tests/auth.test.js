const request = require('supertest');
const { resetStores, buildApp } = require('./testUtils');

describe('Autenticacion y roles', () => {
  let app;

  beforeEach(() => {
    resetStores();
    app = buildApp();
  });

  const validUser = {
    nombre: 'Empresa Donante Uno',
    email: 'donante1@example.com',
    password: 'ClaveSegura123',
  };

  test('POST /api/auth/register crea un usuario con rol usuario por defecto', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('usuario');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('POST /api/auth/register ignora un rol admin enviado por el cliente', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('usuario');
  });

  test('POST /api/auth/register rechaza datos invalidos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'A', email: 'no-es-email', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  test('POST /api/auth/register rechaza un email duplicado', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/login retorna un token con credenciales validas', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login rechaza credenciales invalidas (usuario inexistente)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@example.com', password: 'loquesea123' });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login rechaza password incorrecto', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'incorrecta123' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me requiere autenticacion', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me retorna el perfil del usuario autenticado', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const token = registerRes.body.token;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  test('GET /api/auth/me rechaza un token invalido', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/users solo es accesible para admin', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const token = registerRes.body.token;
    const res = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('flujo completo de administracion: bootstrap admin puede listar y promover usuarios', async () => {
    process.env.ADMIN_BOOTSTRAP_EMAIL = 'admin@reddona.org';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'AdminSeguro123';
    const { ensureAdminUser } = require('../src/models/bootstrap');
    await ensureAdminUser();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@reddona.org', password: 'AdminSeguro123' });
    expect(loginRes.status).toBe(200);
    const adminToken = loginRes.body.token;

    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const targetUserId = registerRes.body.user.id;

    const listRes = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.users.length).toBeGreaterThanOrEqual(2);

    const promoteRes = await request(app)
      .patch(`/api/auth/users/${targetUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });
    expect(promoteRes.status).toBe(200);
    expect(promoteRes.body.user.role).toBe('admin');
  });

  test('PATCH role rechaza un rol invalido', async () => {
    process.env.ADMIN_BOOTSTRAP_EMAIL = 'admin@reddona.org';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'AdminSeguro123';
    const { ensureAdminUser } = require('../src/models/bootstrap');
    await ensureAdminUser();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@reddona.org', password: 'AdminSeguro123' });
    const adminToken = loginRes.body.token;

    const registerRes = await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .patch(`/api/auth/users/${registerRes.body.user.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'super-admin' });
    expect(res.status).toBe(400);
  });

  test('PATCH role retorna 404 si el usuario no existe', async () => {
    process.env.ADMIN_BOOTSTRAP_EMAIL = 'admin@reddona.org';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'AdminSeguro123';
    const { ensureAdminUser } = require('../src/models/bootstrap');
    await ensureAdminUser();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@reddona.org', password: 'AdminSeguro123' });
    const adminToken = loginRes.body.token;

    const res = await request(app)
      .patch('/api/auth/users/id-inexistente/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });
    expect(res.status).toBe(404);
  });
});
