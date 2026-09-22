const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { registerRules, loginRules, roleRules, handleValidation } = require('../utils/validators');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesion, intenta mas tarde' },
});

router.post('/register', registerRules, handleValidation, authController.register);
router.post('/login', loginLimiter, loginRules, handleValidation, authController.login);
router.get('/me', authenticate, authController.me);

// Rutas de administracion: solo el rol 'admin' puede listar usuarios y
// cambiar roles (ej. promover a un usuario a administrador).
router.get('/users', authenticate, authorize('admin'), authController.listUsers);
router.patch(
  '/users/:id/role',
  authenticate,
  authorize('admin'),
  roleRules,
  handleValidation,
  authController.updateUserRole,
);

module.exports = router;
