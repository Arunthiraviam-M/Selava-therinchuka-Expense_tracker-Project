/**
 * auth.service.js – Business logic for authentication
 * Selava Therinchuka 💰
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const config = require('../config/config');
const logger = require('../utils/logger');

const AuthService = {
  /**
   * Register a new user.
   * @param {object} data - { name, email, password, age }
   * @returns {object} - { user, token }
   * @throws {Error} if email already exists
   */
  async register({ name, email, password, age }) {
    // Check duplicate email
    const exists = await UserModel.emailExists(email);
    if (exists) {
      const err = new Error('This email is already registered. Please sign in instead.');
      err.statusCode = 409;
      throw err;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // Persist user
    const { id } = await UserModel.create({ name, email, passwordHash, age });

    const user = { id, name, email, age: age || null };
    const token = AuthService.generateToken(user);

    logger.info(`New user registered: ${email} (id=${id})`);
    return { user, token };
  },

  /**
   * Authenticate a user with email + password.
   * @param {string} email
   * @param {string} password
   * @returns {object} - { user, token }
   * @throws {Error} on invalid credentials
   */
  async login(email, password) {
    const dbUser = await UserModel.findByEmail(email);

    // Generic message – never reveal whether the email exists
    if (!dbUser) {
  const err = new Error('No account found with this email. Please create an account first.');
  err.statusCode = 404;
  throw err;
}
const invalidErr = new Error('Incorrect password. Please try again.');
invalidErr.statusCode = 401;
    if (!dbUser.is_active) {
      const err = new Error('Your account has been deactivated. Please contact support.');
      err.statusCode = 403;
      throw err;
    }

    const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);
    if (!passwordMatch) throw invalidErr;

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, age: dbUser.age };
    const token = AuthService.generateToken(user);

    logger.info(`User logged in: ${email} (id=${dbUser.id})`);
    return { user, token };
  },

  /**
   * Retrieve the authenticated user's profile.
   * @param {number} userId
   * @returns {object}
   */
  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    return user;
  },

  /**
   * Update user profile fields.
   * @param {number} userId
   * @param {object} data - { name, age }
   * @returns {object} updated profile
   */
  async updateProfile(userId, { name, age }) {
    await UserModel.updateProfile(userId, { name, age });
    return AuthService.getProfile(userId);
  },

  /**
   * Change the user's password after verifying the current one.
   * @param {number} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(userId, currentPassword, newPassword) {
    const dbUser = await UserModel.findByEmail(
      (await UserModel.findById(userId)).email
    );

    const match = await bcrypt.compare(currentPassword, dbUser.password_hash);
    if (!match) {
      const err = new Error('Current password is incorrect.');
      err.statusCode = 400;
      throw err;
    }

    const newHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    await UserModel.updatePassword(userId, newHash);
    logger.info(`Password changed for user id=${userId}`);
  },

  /**
   * Generate a signed JWT for a user payload.
   * @param {object} user - { id, name, email }
   * @returns {string} JWT
   */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
};

module.exports = AuthService;
