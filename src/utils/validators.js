const { body, validationResult } = require('express-validator');

const registerRules = [
  body('nombre').trim().isLength({ min: 2 }).withMessage('nombre debe tener al menos 2 caracteres'),
  body('email').trim().isEmail().withMessage('email invalido').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('password debe tener al menos 8 caracteres'),
];

const roleRules = [
  body('role').isIn(['admin', 'usuario']).withMessage('role invalido'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('email invalido').normalizeEmail(),
  body('password').notEmpty().withMessage('password es requerido'),
];

const donorRules = [
  body('nombre').trim().isLength({ min: 2 }).withMessage('nombre debe tener al menos 2 caracteres'),
  body('email').trim().isEmail().withMessage('email invalido').normalizeEmail(),
  body('telefono').trim().isLength({ min: 7 }).withMessage('telefono invalido'),
  body('tipoRecurso').trim().notEmpty().withMessage('tipoRecurso es requerido'),
  body('ubicacion').trim().notEmpty().withMessage('ubicacion es requerida'),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors.array() });
  }
  return next();
}

module.exports = { registerRules, loginRules, donorRules, roleRules, handleValidation };
