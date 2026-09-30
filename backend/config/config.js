/**
 * config.js – Centralised application configuration
 * All values sourced from environment variables with safe defaults.
 */
require('dotenv').config();

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    isDev: (process.env.NODE_ENV || 'development') === 'development'
  },

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'selava_therinchuka_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'CHANGE_THIS_DEFAULT_SECRET_IN_PRODUCTION',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10
  },

  bcrypt: {
    saltRounds: 12
  }
};

module.exports = config;
