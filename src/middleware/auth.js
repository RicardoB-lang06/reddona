const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token de autenticacion requerido' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esta accion' });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
