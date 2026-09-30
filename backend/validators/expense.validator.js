/**
 * expense.validator.js – Input validation rules for expense routes
 * Selava Therinchuka 💰
 */
const { body, query, param, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const VALID_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Utilities', 'Other'];
const VALID_PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Net Banking'];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({ field: e.path, message: e.msg }));
    return sendError(res, 'Validation failed.', 422, formatted);
  }
  next();
}

const createExpenseRules = [
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ min: 0.01, max: 9999999.99 }).withMessage('Amount must be between 0.01 and 9,999,999.99.'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ min: 1, max: 255 }).withMessage('Description must be 1–255 characters.'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.')
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`),

  body('expense_date')
    .notEmpty().withMessage('Expense date is required.')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Date must be in YYYY-MM-DD format.'),

  body('payment_mode')
    .optional()
    .isIn(VALID_PAYMENT_MODES).withMessage(`Payment mode must be one of: ${VALID_PAYMENT_MODES.join(', ')}.`),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters.')
];

const updateExpenseRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid expense ID.'),

  ...createExpenseRules
];

const listExpenseRules = [
  query('category')
    .optional()
    .isIn(VALID_CATEGORIES).withMessage('Invalid category filter.'),

  query('payment_mode')
    .optional()
    .isIn(VALID_PAYMENT_MODES).withMessage('Invalid payment mode filter.'),

  query('startDate')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('startDate must be YYYY-MM-DD.'),

  query('endDate')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('endDate must be YYYY-MM-DD.'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500.'),

  query('sortBy')
    .optional()
    .isIn(['expense_date', 'amount', 'category', 'created_at']).withMessage('Invalid sortBy value.'),

  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('sortOrder must be ASC or DESC.')
];

const expenseIdRule = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid expense ID.')
];

module.exports = {
  validate,
  createExpenseRules,
  updateExpenseRules,
  listExpenseRules,
  expenseIdRule
};
