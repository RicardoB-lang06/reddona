const { signToken, verifyToken } = require('../src/utils/jwt');

describe('utils/jwt', () => {
  test('signToken genera un token que verifyToken puede decodificar', () => {
    const token = signToken({ sub: 'user-1', role: 'usuario' });
    const decoded = verifyToken(token);
    expect(decoded.sub).toBe('user-1');
    expect(decoded.role).toBe('usuario');
  });

  test('verifyToken lanza un error con un token invalido', () => {
    expect(() => verifyToken('token-invalido')).toThrow();
  });
});
