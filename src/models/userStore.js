const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const VALID_ROLES = ['admin', 'usuario'];
const SALT_ROUNDS = 10;

let users = [];

function reset() {
  users = [];
}

function findByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

function findById(id) {
  return users.find((u) => u.id === id);
}

async function create({ nombre, email, password, role = 'usuario' }) {
  if (findByEmail(email)) {
    throw new Error('EMAIL_TAKEN');
  }
  if (!VALID_ROLES.includes(role)) {
    throw new Error('INVALID_ROLE');
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = {
    id: crypto.randomUUID(),
    nombre,
    email,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user; // eslint-disable-line no-unused-vars
  return publicUser;
}

function all() {
  return users.map(toPublicUser);
}

module.exports = {
  VALID_ROLES,
  reset,
  findByEmail,
  findById,
  create,
  verifyPassword,
  toPublicUser,
  all,
};
