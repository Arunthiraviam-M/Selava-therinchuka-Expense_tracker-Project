/**
 * auth.controller.js – Request handlers for authentication
 * Selava Therinchuka 💰
 */
const AuthService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');
const { logActivity } = require('../utils/activity-logger');
const { createSession, deleteSession } = require('../utils/session-tracker');

const AuthController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password, age } = req.body;
      const { user, token } = await AuthService.register({ name, email, password, age });
      logActivity(user.id, 'REGISTER', 'user', user.id, req.ip);
      createSession(user.id, token, req.ip, req.headers['user-agent']);
      return sendSuccess(res, { user, token }, 'Account created successfully.', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      logActivity(user.id, 'LOGIN', 'user', user.id, req.ip);
      createSession(user.id, token, req.ip, req.headers['user-agent']);
      return sendSuccess(res, { user, token }, 'Login successful.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/profile
   * Protected route – requires valid JWT
   */
  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      return sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/auth/profile
   * Protected route
   */
  async updateProfile(req, res, next) {
    try {
      const { name, age } = req.body;
      const user = await AuthService.updateProfile(req.user.id, { name, age });
      return sendSuccess(res, { user }, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/auth/change-password
   * Protected route
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      return sendSuccess(res, null, 'Password changed successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/logout
   * Stateless JWT – just acknowledge on client; token expires naturally.
   * Protected route.
   */
  async logout(req, res) {
    logActivity(req.user.id, 'LOGOUT', 'user', req.user.id, req.ip);
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) deleteSession(token);
    logger.info(`User logged out: id=${req.user.id}`);
    return sendSuccess(res, null, 'Logged out successfully.');
  }
};

module.exports = AuthController;
