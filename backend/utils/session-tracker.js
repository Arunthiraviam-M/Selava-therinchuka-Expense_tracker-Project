/**
 * session-tracker.js – Record a session row whenever a user logs in
 * Selava Therinchuka 💰
 */
const crypto = require('crypto');
const { query } = require('../config/database');
const logger = require('./logger');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createSession(userId, token, ipAddress, userAgent, expiresInDays = 7) {
  try {
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, tokenHash, ipAddress, userAgent, expiresAt]
    );
  } catch (err) {
    logger.error(`Session tracking failed: ${err.message}`);
  }
}

async function deleteSession(token) {
  try {
    const tokenHash = hashToken(token);
    await query(`DELETE FROM user_sessions WHERE token_hash = ?`, [tokenHash]);
  } catch (err) {
    logger.error(`Session removal failed: ${err.message}`);
  }
}

module.exports = { createSession, deleteSession, hashToken };