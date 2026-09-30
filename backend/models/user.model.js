/**
 * user.model.js – All database operations for the users table
 * Selava Therinchuka 💰
 * Uses parameterised queries exclusively – no string concatenation.
 */
const { query, queryOne } = require('../config/database');

const UserModel = {
  /**
   * Find a user by their email address.
   * @param {string} email
   * @returns {object|null}
   */
  async findByEmail(email) {
    return queryOne(
      `SELECT id, name, email, password_hash, age, is_active, created_at
       FROM users
       WHERE email = ? AND deleted_at IS NULL
       LIMIT 1`,
      [email]
    );
  },

  /**
   * Find a user by their primary key ID.
   * @param {number} id
   * @returns {object|null}
   */
  async findById(id) {
    return queryOne(
      `SELECT id, name, email, age, is_active, created_at, updated_at
       FROM users
       WHERE id = ? AND deleted_at IS NULL
       LIMIT 1`,
      [id]
    );
  },

  /**
   * Create a new user record.
   * @param {object} data - { name, email, passwordHash, age }
   * @returns {object} - { id }
   */
  async create({ name, email, passwordHash, age }) {
    const result = await query(
      `INSERT INTO users (name, email, password_hash, age)
       VALUES (?, ?, ?, ?)`,
      [name, email, passwordHash, age || null]
    );
    return { id: result.insertId };
  },

  /**
   * Update a user's profile fields.
   * @param {number} id
   * @param {object} data - { name, age }
   * @returns {boolean}
   */
  async updateProfile(id, { name, age }) {
    const result = await query(
      `UPDATE users SET name = ?, age = ? WHERE id = ? AND deleted_at IS NULL`,
      [name, age || null, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Update the user's password hash.
   * @param {number} id
   * @param {string} passwordHash
   * @returns {boolean}
   */
  async updatePassword(id, passwordHash) {
    const result = await query(
      `UPDATE users SET password_hash = ? WHERE id = ? AND deleted_at IS NULL`,
      [passwordHash, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Soft-delete a user account.
   * @param {number} id
   * @returns {boolean}
   */
  async softDelete(id) {
    const result = await query(
      `UPDATE users SET deleted_at = NOW(), is_active = 0 WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Check whether an email is already registered.
   * @param {string} email
   * @returns {boolean}
   */
  async emailExists(email) {
    const row = await queryOne(
      `SELECT 1 FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1`,
      [email]
    );
    return !!row;
  }
};

module.exports = UserModel;
