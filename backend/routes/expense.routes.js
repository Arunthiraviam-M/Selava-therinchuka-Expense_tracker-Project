/**
 * expense.routes.js – Expense CRUD route definitions
 * Selava Therinchuka 💰
 */
const express = require('express');
const router = express.Router();

const ExpenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  validate,
  createExpenseRules,
  updateExpenseRules,
  listExpenseRules,
  expenseIdRule
} = require('../validators/expense.validator');

// All expense routes require authentication
router.use(authenticate);

router.get('/',               listExpenseRules, validate, ExpenseController.list);
router.get('/by-date/:date',  ExpenseController.getByDate);
router.get('/:id',            expenseIdRule,    validate, ExpenseController.getOne);
router.post('/',              createExpenseRules, validate, ExpenseController.create);
router.put('/:id',            updateExpenseRules, validate, ExpenseController.update);
router.delete('/:id',         expenseIdRule,    validate, ExpenseController.remove);

module.exports = router;
