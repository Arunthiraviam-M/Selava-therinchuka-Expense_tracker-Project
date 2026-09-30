/**
 * budget.controller.js – Request handlers for budget management
 * Selava Therinchuka 💰
 */
const BudgetModel = require('../models/budget.model');
const DashboardService = require('../services/dashboard.service');
const { sendSuccess, sendError } = require('../utils/response');
const { getCurrentMonthYear } = require('../utils/helpers');
const { body, param, validationResult } = require('express-validator');

const BudgetController = {
  /**
   * GET /api/budgets?month=6&year=2025
   * Returns budgets with actual spending for the month
   */
  async list(req, res, next) {
    try {
      const { month, year } = getCurrentMonthYear();
      const reqMonth = parseInt(req.query.month, 10) || month;
      const reqYear = parseInt(req.query.year, 10) || year;

      const summary = await DashboardService.getBudgetSummary(req.user.id, reqMonth, reqYear);
      return sendSuccess(res, { budgets: summary });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/budgets
   * Body: { category, amount, month?, year? }
   * Upserts – creates or updates a budget for the given category/month.
   */
  async upsert(req, res, next) {
    try {
      const { month, year } = getCurrentMonthYear();
      const {
        category,
        amount,
        month: reqMonth = month,
        year: reqYear = year
      } = req.body;

      if (!category || !amount) {
        return sendError(res, 'Category and amount are required.', 400);
      }
      if (amount <= 0) {
        return sendError(res, 'Amount must be greater than 0.', 400);
      }

      const result = await BudgetModel.upsert(req.user.id, {
        category,
        amount,
        month: reqMonth,
        year: reqYear
      });

      return sendSuccess(res, { id: result.id }, 'Budget saved successfully.', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/budgets/:id
   * Body: { amount }
   */
  async update(req, res, next) {
    try {
      const id = Number(req.params.id);
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return sendError(res, 'Amount must be greater than 0.', 400);
      }

      const updated = await BudgetModel.update(id, req.user.id, amount);
      if (!updated) return sendError(res, 'Budget not found or access denied.', 404);

      return sendSuccess(res, null, 'Budget updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/budgets/:id
   */
  async remove(req, res, next) {
    try {
      const deleted = await BudgetModel.delete(Number(req.params.id), req.user.id);
      if (!deleted) return sendError(res, 'Budget not found or access denied.', 404);
      return sendSuccess(res, null, 'Budget deleted successfully.');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = BudgetController;
