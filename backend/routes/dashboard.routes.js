/**
 * dashboard.routes.js – Dashboard and analytics route definitions
 * Selava Therinchuka 💰
 */
const express = require('express');
const router = express.Router();

const DashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All dashboard routes require authentication
router.use(authenticate);

router.get('/',          DashboardController.getOverview);
router.get('/calendar',  DashboardController.getCalendar);
router.get('/analytics', DashboardController.getAnalytics);

module.exports = router;
