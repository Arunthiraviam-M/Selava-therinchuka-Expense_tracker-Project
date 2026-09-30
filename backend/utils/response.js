/**
 * response.js – Standardised API response helpers
 */

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {*}      data - Response data
 * @param {string} message - Optional message
 * @param {number} statusCode - HTTP status code (default 200)
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  const body = { success: true, message };
  if (data !== null) Object.assign(body, data);
  return res.status(statusCode).json(body);
}

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 400)
 * @param {*}      errors - Optional validation error details
 */
function sendError(res, message = 'An error occurred', statusCode = 400, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
