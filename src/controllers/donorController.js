const donorStore = require('../models/donorStore');

function createDonor(req, res) {
  const { nombre, email, telefono, tipoRecurso, ubicacion } = req.body;

  if (donorStore.findByEmail(email)) {
    return res.status(409).json({ error: 'Ya existe una persona donante con ese email' });
  }

  const donor = donorStore.create({
    nombre,
    email,
    telefono,
    tipoRecurso,
    ubicacion,
    ownerUserId: req.user.sub,
  });
  return res.status(201).json({ donor });
}

function listDonors(req, res) {
  return res.json({ donors: donorStore.findAll() });
}

function getDonor(req, res) {
  const donor = donorStore.findById(req.params.id);
  if (!donor) {
    return res.status(404).json({ error: 'Persona donante no encontrada' });
  }
  return res.json({ donor });
}

function updateDonor(req, res) {
  const donor = donorStore.findById(req.params.id);
  if (!donor) {
    return res.status(404).json({ error: 'Persona donante no encontrada' });
  }

  const isOwner = donor.ownerUserId === req.user.sub;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'No tienes permisos para editar este registro' });
  }

  const { nombre, email, telefono, tipoRecurso, ubicacion } = req.body;
  const updated = donorStore.update(req.params.id, {
    ...(nombre !== undefined && { nombre }),
    ...(email !== undefined && { email }),
    ...(telefono !== undefined && { telefono }),
    ...(tipoRecurso !== undefined && { tipoRecurso }),
    ...(ubicacion !== undefined && { ubicacion }),
  });
  return res.json({ donor: updated });
}

function deleteDonor(req, res) {
  const donor = donorStore.findById(req.params.id);
  if (!donor) {
    return res.status(404).json({ error: 'Persona donante no encontrada' });
  }
  donorStore.remove(req.params.id);
  return res.status(204).send();
}

module.exports = { createDonor, listDonors, getDonor, updateDonor, deleteDonor };
