/**
 * budget.model.js – All database operations for the budgets table
 * Selava Therinchuka 💰
 */
const { query, queryOne } = require('../config/database');

const BudgetModel = {
  /**
   * Get all budgets for a user in a given month/year.
   * @param {number} userId
   * @param {number} month
   * @param {number} year
   * @returns {Array}
   */
  async findByMonth(userId, month, year) {
    return query(
      `SELECT id, category, amount, month, year, created_at, updated_at
       FROM budgets
       WHERE user_id = ? AND month = ? AND year = ?
       ORDER BY category ASC`,
      [userId, month, year]
    );
  },

  /**
   * Get a single budget for a category in a given month/year.
   * @param {number} userId
   * @param {string} category
   * @param {number} month
   * @param {number} year
   * @returns {object|null}
   */
  async findOne(userId, category, month, year) {
    return queryOne(
      `SELECT id, category, amount, month, year
       FROM budgets
       WHERE user_id = ? AND category = ? AND month = ? AND year = ?
       LIMIT 1`,
      [userId, category, month, year]
    );
  },

  /**
   * Create a new budget entry.
   * @param {number} userId
   * @param {object} data - { category, amount, month, year }
   * @returns {object} - { id }
   */
  async create(userId, { category, amount, month, year }) {
    const result = await query(
      `INSERT INTO budgets (user_id, category, amount, month, year)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, category, amount, month, year]
    );
    return { id: result.insertId };
  },

  /**
   * Update a budget amount by ID – scoped to user.
   * @param {number} id
   * @param {number} userId
   * @param {number} amount
   * @returns {boolean}
   */
  async update(id, userId, amount) {
    const result = await query(
      `UPDATE budgets SET amount = ? WHERE id = ? AND user_id = ?`,
      [amount, id, userId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Upsert (insert or update) a budget for a category/month/year.
   * @param {number} userId
   * @param {object} data - { category, amount, month, year }
   * @returns {object} - { id }
   */
  async upsert(userId, { category, amount, month, year }) {
    const result = await query(
      `INSERT INTO budgets (user_id, category, amount, month, year)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [userId, category, amount, month, year]
    );
    return { id: result.insertId || result.affectedRows };
  },

  /**
   * Delete a budget entry by ID – scoped to user.
   * @param {number} id
   * @param {number} userId
   * @returns {boolean}
   */
  async delete(id, userId) {
    const result = await query(
      `DELETE FROM budgets WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = BudgetModel;
