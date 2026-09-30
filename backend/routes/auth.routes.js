/**
 * auth.routes.js – Authentication route definitions
 * Selava Therinchuka 💰
 */
const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  validate,
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules
} = require('../validators/auth.validator');

// Public routes
router.post('/register', registerRules, validate, AuthController.register);
router.post('/login',    loginRules,    validate, AuthController.login);

// Protected routes (JWT required)
router.get('/profile',           authenticate, AuthController.getProfile);
router.put('/profile',           authenticate, updateProfileRules, validate, AuthController.updateProfile);
router.put('/change-password',   authenticate, changePasswordRules, validate, AuthController.changePassword);
router.post('/logout',           authenticate, AuthController.logout);

module.exports = router;
