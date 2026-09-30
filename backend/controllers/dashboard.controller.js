/**
 * dashboard.controller.js – Request handlers for dashboard and analytics
 * Selava Therinchuka 💰
 */
const DashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

const DashboardController = {
  /**
   * GET /api/dashboard
   * Full overview: stat cards, category totals, daily totals
   */
  async getOverview(req, res, next) {
    try {
      const data = await DashboardService.getOverview(req.user.id);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/dashboard/calendar?year=2025&month=6
   * Returns dates that have expenses for the calendar component
   */
  async getCalendar(req, res, next) {
    try {
      const now = new Date();
      const year = parseInt(req.query.year, 10) || now.getFullYear();
      const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
      const data = await DashboardService.getCalendarData(req.user.id, year, month);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/dashboard/analytics
   * Monthly bar chart + all-time category donut data
   */
  async getAnalytics(req, res, next) {
    try {
      const data = await DashboardService.getAnalytics(req.user.id);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = DashboardController;
