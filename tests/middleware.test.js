const request = require('supertest');
const { resetStores, buildApp } = require('./testUtils');

describe('Middleware y rutas generales', () => {
  let app;

  beforeEach(() => {
    resetStores();
    app = buildApp();
  });

  test('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('ruta desconocida retorna 404', async () => {
    const res = await request(app).get('/ruta-que-no-existe');
    expect(res.status).toBe(404);
  });

  test('rechaza autorizacion sin esquema Bearer', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'token-sin-esquema');
    expect(res.status).toBe(401);
  });

  test('rechaza autorizacion con esquema distinto de Bearer', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Basic abc123');
    expect(res.status).toBe(401);
  });
});
