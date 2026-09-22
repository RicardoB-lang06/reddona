const donorStore = require('../src/models/donorStore');

describe('models/donorStore', () => {
  beforeEach(() => {
    donorStore.reset();
  });

  test('remove retorna false si el donante no existe', () => {
    expect(donorStore.remove('no-existe')).toBe(false);
  });

  test('update retorna null si el donante no existe', () => {
    expect(donorStore.update('no-existe', { nombre: 'X' })).toBeNull();
  });

  test('findByEmail no distingue mayusculas/minusculas', () => {
    donorStore.create({
      nombre: 'Donante',
      email: 'Donante@Example.com',
      telefono: '5512345678',
      tipoRecurso: 'Ropa',
      ubicacion: 'CDMX',
      ownerUserId: 'user-1',
    });
    expect(donorStore.findByEmail('donante@example.com')).toBeDefined();
  });

  test('remove elimina un donante existente', () => {
    const donor = donorStore.create({
      nombre: 'Donante',
      email: 'd2@example.com',
      telefono: '5512345678',
      tipoRecurso: 'Ropa',
      ubicacion: 'CDMX',
      ownerUserId: 'user-1',
    });
    expect(donorStore.remove(donor.id)).toBe(true);
    expect(donorStore.findById(donor.id)).toBeUndefined();
  });
});
