/**
 * dashboard.service.js – Business logic for dashboard stats and analytics
 * Selava Therinchuka 💰
 */
const ExpenseModel = require('../models/expense.model');
const BudgetModel = require('../models/budget.model');
const { percentageChange, getCurrentMonthYear } = require('../utils/helpers');

const DashboardService = {
  /**
   * Compute all stat-card data for the overview dashboard.
   * @param {number} userId
   * @returns {object}
   */
  async getOverview(userId) {
    const { month, year } = getCurrentMonthYear();

    // Current month
    const monthTotal = await ExpenseModel.getMonthTotal(userId, year, month);
    const monthCount = await DashboardService._getMonthCount(userId, year, month);
    const maxExpenseRow = await ExpenseModel.getMaxExpense(userId, year, month);
    const categoryTotalsRows = await ExpenseModel.getCategoryTotals(userId, year, month);
    const dailyTotals = await ExpenseModel.getDailyTotals(userId, year, month);

    // Previous month (for trend)
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevTotal = await ExpenseModel.getMonthTotal(userId, prevYear, prevMonth);

    // Days elapsed this month (for daily average)
    const today = new Date();
    const daysElapsed = today.getDate();
    const dailyAverage = daysElapsed > 0 ? monthTotal / daysElapsed : 0;

    // Category totals map
    const categoryTotals = {};
    categoryTotalsRows.forEach(r => { categoryTotals[r.category] = Number(r.total); });

    return {
      monthTotal: Number(monthTotal),
      monthCount: Number(monthCount),
      maxExpense: maxExpenseRow ? Number(maxExpenseRow.amount) : 0,
      maxCategory: maxExpenseRow ? maxExpenseRow.category : null,
      dailyAverage: Math.round(dailyAverage),
      trendPercent: percentageChange(monthTotal, prevTotal),
      categoryTotals,
      dailyTotals
    };
  },

  /**
   * Get calendar data – active expense dates for a given month.
   * @param {number} userId
   * @param {number} year
   * @param {number} month
   * @returns {object} - { activeDates: string[], expenses: {} }
   */
  async getCalendarData(userId, year, month) {
    const rows = await ExpenseModel.getActiveDates(userId, year, month);
    const activeDates = rows.map(r => {
      const d = new Date(r.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    return { activeDates };
  },

  /**
   * Full analytics payload – monthly bar chart + category breakdown.
   * @param {number} userId
   * @returns {object}
   */
  async getAnalytics(userId) {
    const monthlyTotals = await ExpenseModel.getMonthlyTotals(userId, 6);
    const { month, year } = getCurrentMonthYear();
    const categoryTotals = await ExpenseModel.getCategoryTotals(userId, year, month);

    return {
      monthlyTotals: monthlyTotals.map(r => ({
        year: r.year,
        month: r.month,
        total: Number(r.total),
        count: Number(r.count)
      })),
      categoryBreakdown: categoryTotals.map(r => ({
        category: r.category,
        total: Number(r.total),
        count: Number(r.count)
      }))
    };
  },

  /**
   * Get budget vs actual spending for the current month.
   * @param {number} userId
   * @returns {Array}
   */
  async getBudgetSummary(userId) {
    const { month, year } = getCurrentMonthYear();
    const budgets = await BudgetModel.findByMonth(userId, month, year);
    const categoryTotals = await ExpenseModel.getCategoryTotals(userId, year, month);

    const spentMap = {};
    categoryTotals.forEach(r => { spentMap[r.category] = Number(r.total); });

    return budgets.map(b => ({
      id: b.id,
      category: b.category,
      budgeted: Number(b.amount),
      spent: spentMap[b.category] || 0,
      remaining: Math.max(Number(b.amount) - (spentMap[b.category] || 0), 0),
      percentUsed: Number(b.amount) > 0
        ? Math.min(Math.round(((spentMap[b.category] || 0) / Number(b.amount)) * 100), 100)
        : 0
    }));
  },

  // ─── Private helpers ───────────────────────────────────────────────────────

  async _getMonthCount(userId, year, month) {
    const { queryOne } = require('../config/database');
    const row = await queryOne(
      `SELECT COUNT(*) AS cnt FROM expenses
       WHERE user_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ? AND deleted_at IS NULL`,
      [userId, year, month]
    );
    return row ? Number(row.cnt) : 0;
  }
};

module.exports = DashboardService;
