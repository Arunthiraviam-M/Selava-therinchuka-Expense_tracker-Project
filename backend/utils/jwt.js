/**
 * jwt.js – JWT sign / verify utilities
 * Selava Therinchuka 💰
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Sign a JWT payload.
 * @param {object} payload - Data to encode (e.g. { id, name, email })
 * @returns {string} signed token
 */
function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

/**
 * Decode a JWT without verifying the signature (useful for debugging only).
 * @param {string} token
 * @returns {object|null} decoded payload or null
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = { signToken, verifyToken, decodeToken };
