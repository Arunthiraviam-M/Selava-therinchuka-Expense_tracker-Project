/**
 * expense.controller.js – Request handlers for expense CRUD
 * Selava Therinchuka 💰
 */
const ExpenseModel = require('../models/expense.model');
const { sendSuccess, sendError } = require('../utils/response');
const { logActivity } = require('../utils/activity-logger');

const ExpenseController = {
  /**
   * GET /api/expenses
   * Query params: category, payment_mode, startDate, endDate, search,
   *               sortBy, sortOrder, page, limit
   */
  async list(req, res, next) {
    try {
      const options = {
        category: req.query.category || null,
        payment_mode: req.query.payment_mode || null,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
        search: req.query.search || null,
        sortBy: req.query.sortBy || 'expense_date',
        sortOrder: req.query.sortOrder || 'DESC',
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 50
      };

      const { expenses, total } = await ExpenseModel.findAll(req.user.id, options);
      const totalPages = Math.ceil(total / options.limit);

      return sendSuccess(res, {
        expenses,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/expenses/:id
   */
  async getOne(req, res, next) {
    try {
      const expense = await ExpenseModel.findById(Number(req.params.id), req.user.id);
      if (!expense) return sendError(res, 'Expense not found.', 404);
      return sendSuccess(res, { expense });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/expenses
   */
  async create(req, res, next) {
    try {
      const { amount, description, category, payment_mode, expense_date, notes } = req.body;
      const { id } = await ExpenseModel.create(req.user.id, {
        amount, description, category, payment_mode, expense_date, notes
      });
      const expense = await ExpenseModel.findById(id, req.user.id);
      logActivity(req.user.id, 'EXPENSE_CREATE', 'expense', id, req.ip);
      return sendSuccess(res, { expense }, 'Expense added successfully.', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/expenses/:id
   */
  async update(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { amount, description, category, payment_mode, expense_date, notes } = req.body;

      const updated = await ExpenseModel.update(id, req.user.id, {
        amount, description, category, payment_mode, expense_date, notes
      });
      if (!updated) return sendError(res, 'Expense not found or access denied.', 404);

      const expense = await ExpenseModel.findById(id, req.user.id);
      logActivity(req.user.id, 'EXPENSE_UPDATE', 'expense', id, req.ip);
      return sendSuccess(res, { expense }, 'Expense updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/expenses/:id
   */
  async remove(req, res, next) {
    try {
      const id = Number(req.params.id);
      const deleted = await ExpenseModel.softDelete(id, req.user.id);
      if (!deleted) return sendError(res, 'Expense not found or access denied.', 404);
      logActivity(req.user.id, 'EXPENSE_DELETE', 'expense', id, req.ip);
      return sendSuccess(res, null, 'Expense deleted successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/expenses/by-date/:date
   * Returns all expenses for a specific day (calendar day-drawer)
   */
  async getByDate(req, res, next) {
    try {
      const expenses = await ExpenseModel.getByDate(req.user.id, req.params.date);
      return sendSuccess(res, { expenses });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ExpenseController;
