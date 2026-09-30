/**
 * database.js – MySQL connection pool
 * Uses mysql2 with promise support for async/await.
 */
const mysql = require('mysql2/promise');
const config = require('./config');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  connectionLimit: config.db.connectionLimit,
  waitForConnections: config.db.waitForConnections,
  queueLimit: config.db.queueLimit,
  charset: 'utf8mb4',
  timezone: '+00:00',
  decimalNumbers: true
});

/**
 * Test database connection on startup
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    logger.info(`Database connected → ${config.db.host}:${config.db.port}/${config.db.name}`);
    connection.release();
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Execute a parameterised query – NEVER concatenate SQL strings directly.
 * @param {string} sql  - Parameterised SQL
 * @param {Array}  params - Bound parameters
 * @returns {Array} rows
 */
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Execute a query and return a single row or null.
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

module.exports = { pool, query, queryOne, testConnection };
