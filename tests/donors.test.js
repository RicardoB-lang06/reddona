const request = require('supertest');
const { resetStores, buildApp } = require('./testUtils');

describe('Registro de personas donantes', () => {
  let app;
  let userToken;
  let adminToken;

  const donorPayload = {
    nombre: 'Panaderia El Trigal',
    email: 'contacto@eltrigal.com',
    telefono: '5512345678',
    tipoRecurso: 'Pan y repostería',
    ubicacion: 'CDMX, Mexico',
  };

  beforeEach(async () => {
    resetStores();
    app = buildApp();

    const userRes = await request(app).post('/api/auth/register').send({
      nombre: 'Usuario Normal',
      email: 'usuario@example.com',
      password: 'ClaveSegura123',
    });
    userToken = userRes.body.token;

    process.env.ADMIN_BOOTSTRAP_EMAIL = 'admin@reddona.org';
    process.env.ADMIN_BOOTSTRAP_PASSWORD = 'AdminSeguro123';
    const { ensureAdminUser } = require('../src/models/bootstrap');
    await ensureAdminUser();
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@reddona.org', password: 'AdminSeguro123' });
    adminToken = adminLogin.body.token;
  });

  test('POST /api/donors requiere autenticacion', async () => {
    const res = await request(app).post('/api/donors').send(donorPayload);
    expect(res.status).toBe(401);
  });

  test('POST /api/donors registra una persona donante', async () => {
    const res = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${userToken}`)
      .send(donorPayload);
    expect(res.status).toBe(201);
    expect(res.body.donor.nombre).toBe(donorPayload.nombre);
    expect(res.body.donor.ownerUserId).toBeDefined();
  });

  test('POST /api/donors rechaza datos invalidos', async () => {
    const res = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombre: 'A' });
    expect(res.status).toBe(400);
  });

  test('POST /api/donors rechaza un email de donante duplicado', async () => {
    await request(app).post('/api/donors').set('Authorization', `Bearer ${userToken}`).send(donorPayload);
    const res = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${userToken}`)
      .send(donorPayload);
    expect(res.status).toBe(409);
  });

  test('GET /api/donors lista las personas donantes registradas', async () => {
    await request(app).post('/api/donors').set('Authorization', `Bearer ${userToken}`).send(donorPayload);
    const res = await request(app).get('/api/donors').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.donors).toHaveLength(1);
  });

  test('GET /api/donors/:id retorna 404 si no existe', async () => {
    const res = await request(app)
      .get('/api/donors/no-existe')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  test('GET /api/donors/:id retorna la persona donante', async () => {
    const createRes = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${userToken}`)
      .send(donorPayload);
    const id = createRes.body.donor.id;
    const res = await request(app).get(`/api/donors/${id}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.donor.id).toBe(id);
  });

  test('PUT /api/donors/:id permite al dueño actualizar su registro', async () => {
    const createRes = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${userToken}`)
      .send(donorPayload);
    const id = createRes.body.donor.id;
    const res = await request(app)
      .put(`/api/donors/${id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...donorPayload, ubicacion: 'Guadalajara, Mexico' });
    expect(res.status).toBe(200);
    expect(res.body.donor.ubicacion).toBe('Guadalajara, Mexico');
  });

  test('PUT /api/donors/:id retorna 404 si el donante no existe', async () => {
    const res = await request(app)
      .put('/api/donors/no-existe')
      .set('Authorization', `Bearer ${userToken}`)
      .send(donorPayload);
    expect(res.status).toBe(404);
  });

  test('PUT /api/donors/:id prohibe editar el registro de otro usuario', async () => {
    const createRes = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${userToken}`)
      .send(donorPayload);
    const id = createRes.body.donor.id;

    const otherUserRes = await request(app).post('/api/auth/register').send({
      nombre: 'Otro Usuario',
      email: 'otro@example.com',
      password: 'ClaveSegura123',
    });
    const otherToken = otherUserRes.body.token;

    const res = await request(app)
      .put(`/api/donors/${id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ ...donorPayload, ubicacion: 'Otro lugar' });
    expect(res.status).toBe(403);
  });

  test('un admin puede editar el registro de cualquier usuario', async () => {
    const createRes = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${userToken}`)
      .send(donorPayload);
    const id = createRes.body.donor.id;

    const res = await request(app)
      .put(`/api/donors/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...donorPayload, ubicacion: 'Editado por admin' });
    expect(res.status).toBe(200);
    expect(res.body.donor.ubicacion).toBe('Editado por admin');
  });

  test('DELETE /api/donors/:id es exclusivo de administradores', async () => {
    const createRes = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${userToken}`)
      .send(donorPayload);
    const id = createRes.body.donor.id;

    const forbidden = await request(app)
      .delete(`/api/donors/${id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(forbidden.status).toBe(403);

    const allowed = await request(app)
      .delete(`/api/donors/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(allowed.status).toBe(204);
  });

  test('DELETE /api/donors/:id retorna 404 si no existe', async () => {
    const res = await request(app)
      .delete('/api/donors/no-existe')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
