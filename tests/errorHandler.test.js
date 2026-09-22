const { errorHandler } = require('../src/middleware/errorHandler');

describe('middleware/errorHandler', () => {
  test('usa el status y mensaje del error cuando estan definidos', () => {
    const err = new Error('Fallo especifico');
    err.status = 418;
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(418);
    expect(json).toHaveBeenCalledWith({ error: 'Fallo especifico' });
  });

  test('usa 500 y un mensaje por defecto cuando el error no los define', () => {
    const err = {};
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});
