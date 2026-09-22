const crypto = require('crypto');

let donors = [];

function reset() {
  donors = [];
}

function create({ nombre, email, telefono, tipoRecurso, ubicacion, ownerUserId }) {
  const donor = {
    id: crypto.randomUUID(),
    nombre,
    email,
    telefono,
    tipoRecurso,
    ubicacion,
    ownerUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  donors.push(donor);
  return donor;
}

function findAll() {
  return [...donors];
}

function findById(id) {
  return donors.find((d) => d.id === id);
}

function findByEmail(email) {
  return donors.find((d) => d.email.toLowerCase() === String(email).toLowerCase());
}

function update(id, changes) {
  const donor = findById(id);
  if (!donor) return null;
  Object.assign(donor, changes, { updatedAt: new Date().toISOString() });
  return donor;
}

function remove(id) {
  const index = donors.findIndex((d) => d.id === id);
  if (index === -1) return false;
  donors.splice(index, 1);
  return true;
}

module.exports = {
  reset,
  create,
  findAll,
  findById,
  findByEmail,
  update,
  remove,
};
