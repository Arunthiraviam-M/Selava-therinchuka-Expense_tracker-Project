/**
 * error.middleware.js – Centralised error handler
 * Must be registered LAST in app.js
 */
const logger = require('../utils/logger');
const config = require('../config/config');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`);

  const response = { success: false, message };

  // Include stack trace in development only
  if (config.app.isDev) response.stack = err.stack;

  res.status(statusCode).json(response);
}

// 404 handler
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
}

module.exports = { errorHandler, notFound };
