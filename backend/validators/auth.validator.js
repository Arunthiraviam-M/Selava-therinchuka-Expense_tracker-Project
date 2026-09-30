/**
 * auth.validator.js – Input validation rules for auth routes
 * Selava Therinchuka 💰
 * Uses express-validator. Call validate() as middleware before controllers.
 */
const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Middleware – collect validation errors and return 422 if any exist.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({ field: e.path, message: e.msg }));
    return sendError(res, 'Validation failed.', 422, formatted);
  }
  next();
}

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be 6–128 characters.'),

  body('age')
    .optional({ nullable: true })
    .isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120.')
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
];

const updateProfileRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('age')
    .optional({ nullable: true })
    .isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120.')
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 6, max: 128 }).withMessage('New password must be 6–128 characters.')
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules
};
