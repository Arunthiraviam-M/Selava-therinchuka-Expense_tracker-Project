/**
 * expense.model.js – All database operations for the expenses table
 * Selava Therinchuka 💰
 */
const { query, queryOne } = require('../config/database');

const ExpenseModel = {
  /**
   * Retrieve all expenses for a user with optional filters, sorting, and pagination.
   * @param {number} userId
   * @param {object} options
   * @returns {{ expenses: Array, total: number }}
   */
  async findAll(userId, options = {}) {
    const {
      category = null,
      payment_mode = null,
      startDate = null,
      endDate = null,
      search = null,
      sortBy = 'expense_date',
      sortOrder = 'DESC',
      page = 1,
      limit = 500
    } = options;

    // Whitelist sortable columns to prevent SQL injection
    const allowedSort = ['expense_date', 'amount', 'category', 'created_at'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'expense_date';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions = ['e.user_id = ?', 'e.deleted_at IS NULL'];
    const params = [userId];

    if (category) { conditions.push('e.category = ?'); params.push(category); }
    if (payment_mode) { conditions.push('e.payment_mode = ?'); params.push(payment_mode); }
    if (startDate) { conditions.push('e.expense_date >= ?'); params.push(startDate); }
    if (endDate) { conditions.push('e.expense_date <= ?'); params.push(endDate); }
    if (search) { conditions.push('e.description LIKE ?'); params.push(`%${search}%`); }

    const where = conditions.join(' AND ');

    // Count query (no LIMIT)
    const countRow = await queryOne(
      `SELECT COUNT(*) AS total FROM expenses e WHERE ${where}`,
      params
    );
    const total = countRow ? countRow.total : 0;

    // Data query
    const offset = (Math.max(1, page) - 1) * limit;
    const expenses = await query(
      `SELECT id, amount, description, category, payment_mode, expense_date, notes, created_at
       FROM expenses e
       WHERE ${where}
       ORDER BY ${safeSort} ${safeOrder}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return { expenses, total };
  },

  /**
   * Find a single expense by ID, scoped to a user.
   * @param {number} id
   * @param {number} userId
   * @returns {object|null}
   */
  async findById(id, userId) {
    return queryOne(
      `SELECT id, amount, description, category, payment_mode, expense_date, notes, created_at, updated_at
       FROM expenses
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [id, userId]
    );
  },

  /**
   * Create a new expense.
   * @param {number} userId
   * @param {object} data
   * @returns {object} - { id }
   */
  async create(userId, { amount, description, category, payment_mode, expense_date, notes }) {
    const result = await query(
      `INSERT INTO expenses (user_id, amount, description, category, payment_mode, expense_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, amount, description, category, payment_mode || 'Cash', expense_date, notes || null]
    );
    return { id: result.insertId };
  },

  /**
   * Update an expense – only if it belongs to the user.
   * @param {number} id
   * @param {number} userId
   * @param {object} data
   * @returns {boolean}
   */
  async update(id, userId, { amount, description, category, payment_mode, expense_date, notes }) {
    const result = await query(
      `UPDATE expenses
       SET amount = ?, description = ?, category = ?, payment_mode = ?, expense_date = ?, notes = ?
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [amount, description, category, payment_mode || 'Cash', expense_date, notes || null, id, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Soft-delete an expense.
   * @param {number} id
   * @param {number} userId
   * @returns {boolean}
   */
  async softDelete(id, userId) {
    const result = await query(
      `UPDATE expenses SET deleted_at = NOW()
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Get total spending for a user in a given month.
   * @param {number} userId
   * @param {number} year
   * @param {number} month
   * @returns {number}
   */
  async getMonthTotal(userId, year, month) {
    const row = await queryOne(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ? AND deleted_at IS NULL`,
      [userId, year, month]
    );
    return row ? Number(row.total) : 0;
  },

  /**
   * Get per-category totals for a specific month.
   * @param {number} userId
   * @param {number} year
   * @param {number} month
   * @returns {Array}
   */
  async getCategoryTotals(userId, year, month) {
    return query(
      `SELECT category, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
       FROM expenses
       WHERE user_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ? AND deleted_at IS NULL
       GROUP BY category
       ORDER BY total DESC`,
      [userId, year, month]
    );
  },

  /**
   * Get daily totals for a specific month (for trend chart).
   * @param {number} userId
   * @param {number} year
   * @param {number} month
   * @returns {Array}
   */
  async getDailyTotals(userId, year, month) {
    return query(
      `SELECT DAY(expense_date) AS day, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ? AND deleted_at IS NULL
       GROUP BY DAY(expense_date)
       ORDER BY day ASC`,
      [userId, year, month]
    );
  },

  /**
   * Get monthly totals for the past N months (for bar chart).
   * @param {number} userId
   * @param {number} months - number of past months
   * @returns {Array}
   */
  async getMonthlyTotals(userId, months = 6) {
    return query(
      `SELECT YEAR(expense_date) AS year, MONTH(expense_date) AS month,
              COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
       FROM expenses
       WHERE user_id = ?
         AND deleted_at IS NULL
         AND expense_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY YEAR(expense_date), MONTH(expense_date)
       ORDER BY year ASC, month ASC`,
      [userId, months]
    );
  },

  /**
   * Get all expenses for a specific date (calendar day drawer).
   * @param {number} userId
   * @param {string} date - 'YYYY-MM-DD'
   * @returns {Array}
   */
  async getByDate(userId, date) {
    return query(
      `SELECT id, amount, description, category, payment_mode, notes
       FROM expenses
       WHERE user_id = ? AND expense_date = ? AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [userId, date]
    );
  },

  /**
   * Get dates that have expenses in a given month (for calendar dots).
   * @param {number} userId
   * @param {number} year
   * @param {number} month
   * @returns {Array<string>}
   */
  async getActiveDates(userId, year, month) {
    return query(
      `SELECT DISTINCT expense_date AS date
       FROM expenses
       WHERE user_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ? AND deleted_at IS NULL
       ORDER BY expense_date ASC`,
      [userId, year, month]
    );
  },

  /**
   * Get the highest single-transaction expense for a user in the current month.
   * @param {number} userId
   * @param {number} year
   * @param {number} month
   * @returns {object|null}
   */
  async getMaxExpense(userId, year, month) {
    return queryOne(
      `SELECT amount, category
       FROM expenses
       WHERE user_id = ? AND YEAR(expense_date) = ? AND MONTH(expense_date) = ? AND deleted_at IS NULL
       ORDER BY amount DESC
       LIMIT 1`,
      [userId, year, month]
    );
  }
};

module.exports = ExpenseModel;
