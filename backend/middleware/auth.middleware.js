/**
 * auth.middleware.js – JWT authentication middleware
 * Verifies the Bearer token and attaches the user to req.user
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { sendError } = require('../utils/response');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please sign in again.', 401);
    }
    return sendError(res, 'Invalid token.', 401);
  }
}

module.exports = { authenticate };
