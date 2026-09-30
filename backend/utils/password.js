/**
 * password.js – bcrypt hash / compare utilities
 * Selava Therinchuka 💰
 */
const bcrypt = require('bcryptjs');
const config = require('../config/config');

/**
 * Hash a plain-text password.
 * @param {string} plainText
 * @returns {Promise<string>} bcrypt hash
 */
async function hashPassword(plainText) {
  return bcrypt.hash(plainText, config.bcrypt.saltRounds);
}

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} plainText
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

module.exports = { hashPassword, comparePassword };
