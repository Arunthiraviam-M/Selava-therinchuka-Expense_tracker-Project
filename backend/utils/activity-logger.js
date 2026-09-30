/**
 * activity-logger.js – Writes an entry into activity_logs on key user actions
 * Selava Therinchuka 💰
 */
const { query } = require('../config/database');
const logger = require('./logger');

/**
 * Record an activity log entry.
 * @param {number|null} userId
 * @param {string} action       e.g. 'REGISTER', 'LOGIN', 'EXPENSE_CREATE', 'EXPENSE_DELETE'
 * @param {string|null} entityType e.g. 'expense', 'user'
 * @param {number|null} entityId
 * @param {string|null} ipAddress
 */
async function logActivity(userId, action, entityType = null, entityId = null, ipAddress = null) {
  try {
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, action, entityType, entityId, ipAddress]
    );
  } catch (err) {
    logger.error(`Activity log failed: ${err.message}`);
  }
}

module.exports = { logActivity };