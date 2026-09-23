const request = require('supertest');
const { buildApp } = require('./testUtils');

describe('Configuracion transversal de la app', () => {
  test('las respuestas incluyen Cache-Control: no-store', async () => {
    const res = await request(buildApp()).get('/health');
    expect(res.headers['cache-control']).toBe('no-store');
  });

  test('permite un origen configurado en CORS_ORIGIN', async () => {
    const original = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = 'https://app.reddona.org';
    const res = await request(buildApp())
      .get('/health')
      .set('Origin', 'https://app.reddona.org');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://app.reddona.org');
    process.env.CORS_ORIGIN = original;
  });

  test('bloquea un origen no incluido en CORS_ORIGIN', async () => {
    const original = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = 'https://app.reddona.org';
    const res = await request(buildApp())
      .get('/health')
      .set('Origin', 'https://sitio-no-permitido.com');
    expect(res.status).toBe(500);
    process.env.CORS_ORIGIN = original;
  });
});
