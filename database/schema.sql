-- ============================================================
-- Selava Therinchuka 💰 – Database Schema
-- Database: selava_therinchuka_db
-- Engine: InnoDB | Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS selava_therinchuka_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE selava_therinchuka_db;

-- ─────────────────────────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)      NOT NULL,
  email         VARCHAR(255)      NOT NULL,
  password_hash VARCHAR(255)      NOT NULL,
  age           TINYINT UNSIGNED  DEFAULT NULL,
  is_active     TINYINT(1)        NOT NULL DEFAULT 1,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME          DEFAULT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_email (email),
  INDEX idx_users_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: expenses
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED      NOT NULL,
  amount        DECIMAL(12,2)     NOT NULL,
  description   VARCHAR(255)      NOT NULL,
  category      ENUM(
    'Food','Transport','Shopping','Entertainment',
    'Health','Education','Utilities','Other'
  )                               NOT NULL DEFAULT 'Other',
  payment_mode  ENUM('Cash','UPI','Card','Net Banking')
                                  NOT NULL DEFAULT 'Cash',
  expense_date  DATE              NOT NULL,
  notes         TEXT              DEFAULT NULL,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME          DEFAULT NULL,

  PRIMARY KEY (id),
  INDEX idx_expenses_user_id (user_id),
  INDEX idx_expenses_date (expense_date),
  INDEX idx_expenses_category (category),
  INDEX idx_expenses_user_date (user_id, expense_date),
  INDEX idx_expenses_deleted_at (deleted_at),
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: budgets
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED      NOT NULL,
  category      ENUM(
    'Food','Transport','Shopping','Entertainment',
    'Health','Education','Utilities','Other'
  )                               NOT NULL,
  amount        DECIMAL(12,2)     NOT NULL,
  month         TINYINT UNSIGNED  NOT NULL COMMENT '1-12',
  year          SMALLINT UNSIGNED NOT NULL,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_budget_user_cat_month (user_id, category, month, year),
  INDEX idx_budgets_user_id (user_id),
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: user_sessions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED      NOT NULL,
  token_hash    VARCHAR(255)      NOT NULL,
  ip_address    VARCHAR(45)       DEFAULT NULL,
  user_agent    TEXT              DEFAULT NULL,
  expires_at    DATETIME          NOT NULL,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_token_hash (token_hash),
  INDEX idx_sessions_expires_at (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: password_resets
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED      NOT NULL,
  token_hash    VARCHAR(255)      NOT NULL,
  expires_at    DATETIME          NOT NULL,
  used_at       DATETIME          DEFAULT NULL,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_pr_user_id (user_id),
  INDEX idx_pr_token_hash (token_hash),
  CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: activity_logs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED      DEFAULT NULL,
  action        VARCHAR(100)      NOT NULL,
  entity_type   VARCHAR(50)       DEFAULT NULL,
  entity_id     INT UNSIGNED      DEFAULT NULL,
  ip_address    VARCHAR(45)       DEFAULT NULL,
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_logs_user_id (user_id),
  INDEX idx_logs_created_at (created_at),
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────────────────────

-- Monthly summary view
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT
  e.user_id,
  YEAR(e.expense_date)  AS year,
  MONTH(e.expense_date) AS month,
  e.category,
  COUNT(*)              AS transaction_count,
  SUM(e.amount)         AS total_amount,
  AVG(e.amount)         AS avg_amount,
  MAX(e.amount)         AS max_amount
FROM expenses e
WHERE e.deleted_at IS NULL
GROUP BY e.user_id, YEAR(e.expense_date), MONTH(e.expense_date), e.category;

-- ─────────────────────────────────────────────────────────────
-- SEED: default budgets (optional – removed, set per user via API)
-- ─────────────────────────────────────────────────────────────
