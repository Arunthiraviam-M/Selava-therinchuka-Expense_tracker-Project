/**
 * helpers.js – Shared utility functions
 */

/**
 * Get the first and last day of a given month
 * @param {number} year
 * @param {number} month - 1-based (1 = January)
 * @returns {{ startDate: string, endDate: string }}
 */
function getMonthRange(year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  return { startDate, endDate };
}

/**
 * Calculate percentage change between two values
 * @param {number} current
 * @param {number} previous
 * @returns {number} rounded percentage
 */
function percentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Sanitise a string – strip tags, trim whitespace
 * @param {string} str
 * @returns {string}
 */
function sanitiseString(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Get current month and year
 * @returns {{ month: number, year: number }}
 */
function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

module.exports = { getMonthRange, percentageChange, sanitiseString, getCurrentMonthYear };
