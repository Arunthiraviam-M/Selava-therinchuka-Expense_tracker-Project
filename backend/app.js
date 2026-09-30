/**
 * app.js – Express application setup
 * Selava Therinchuka 💰
 */
const express       = require('express');
const helmet        = require('helmet');
const cors          = require('cors');
const compression   = require('compression');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');

const config            = require('./config/config');
const logger            = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const authRoutes      = require('./routes/auth.routes');
const expenseRoutes   = require('./routes/expense.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const budgetRoutes    = require('./routes/budget.routes');

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow any origin in development so the frontend works from any port or file://
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // In development, allow everything
    if (config.app.isDev) return callback(null, true);
    // In production, restrict to your frontend domain
    const allowed = [
      config.app.frontendUrl,
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:5501',
      'http://127.0.0.1:5501',
    ];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
app.use(morgan(config.app.isDev ? 'dev' : 'combined', {
  stream: { write: (msg) => logger.http(msg.trim()) }
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Selava Therinchuka API is running 💰', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/expenses',  expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets',   budgetRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
