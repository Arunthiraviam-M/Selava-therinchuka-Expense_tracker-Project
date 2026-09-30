/**
 * budget.routes.js – Budget management route definitions
 * Selava Therinchuka 💰
 */
const express = require('express');
const router = express.Router();

const BudgetController = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All budget routes require authentication
router.use(authenticate);

router.get('/',      BudgetController.list);
router.post('/',     BudgetController.upsert);
router.put('/:id',   BudgetController.update);
router.delete('/:id', BudgetController.remove);

module.exports = router;
