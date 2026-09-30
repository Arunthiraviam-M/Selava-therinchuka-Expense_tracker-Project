/**
 * server.js – Entry point
 * Selava Therinchuka 💰
 * Starts the HTTP server and tests the DB connection.
 */
require('dotenv').config();

const app = require('./app');
const config = require('./config/config');
const { testConnection } = require('./config/database');
const logger = require('./utils/logger');

const PORT = config.app.port;

async function startServer() {
  // 1. Verify database is reachable before accepting traffic
  await testConnection();

  // 2. Start listening
  app.listen(PORT, () => {
    logger.info(`────────────────────────────────────────`);
    logger.info(`  Selava Therinchuka 💰 – Backend`);
    logger.info(`  Environment : ${config.app.env}`);
    logger.info(`  Server      : http://localhost:${PORT}`);
    logger.info(`  API Base    : http://localhost:${PORT}/api`);
    logger.info(`────────────────────────────────────────`);
  });
}

// Unhandled promise rejections – log and exit cleanly
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

// SIGTERM from Docker / Render / PM2
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

startServer();
