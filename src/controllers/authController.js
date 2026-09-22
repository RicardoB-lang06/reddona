const userStore = require('../models/userStore');
const { signToken } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const { nombre, email, password } = req.body;
    // El rol nunca se acepta desde la solicitud publica: todo registro abierto
    // se crea como 'usuario'. Solo un administrador puede promover cuentas
    // (ver updateUserRole), evitando escalacion de privilegios.
    const user = await userStore.create({ nombre, email, password, role: 'usuario' });
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return res.status(201).json({ user: userStore.toPublicUser(user), token });
  } catch (err) {
    if (err.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'El email ya esta registrado' });
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = userStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    const valid = await userStore.verifyPassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return res.json({ user: userStore.toPublicUser(user), token });
  } catch (err) {
    return next(err);
  }
}

function me(req, res) {
  const user = userStore.findById(req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  return res.json({ user: userStore.toPublicUser(user) });
}

function listUsers(req, res) {
  return res.json({ users: userStore.all() });
}

function updateUserRole(req, res) {
  const user = userStore.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  user.role = req.body.role;
  return res.json({ user: userStore.toPublicUser(user) });
}

module.exports = { register, login, me, listUsers, updateUserRole };
