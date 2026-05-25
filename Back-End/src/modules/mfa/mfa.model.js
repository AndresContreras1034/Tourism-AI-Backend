import pool from "../../config/db.js";

const TABLE_NAME = "user_mfa";

console.log("🧱 [MFA MODEL] Schema listo");

// =========================
// 📌 CREATE MFA RECORD
// =========================
export const createMfaRecord = async ({ userId, secret }) => {
  const result = await pool.query(
    `
    INSERT INTO ${TABLE_NAME} (user_id, secret, enabled, created_at, updated_at)
    VALUES ($1, $2, false, NOW(), NOW())
    RETURNING *;
    `,
    [userId, secret]
  );

  return result.rows[0];
};

// =========================
// 🔍 GET MFA BY USER
// =========================
export const getMfaByUserId = async (userId) => {
  const result = await pool.query(
    `
    SELECT * FROM ${TABLE_NAME}
    WHERE user_id = $1;
    `,
    [userId]
  );

  return result.rows[0] || null; // 🔥 FIX IMPORTANTE
};

// =========================
// 🔐 ENABLE MFA
// =========================
export const enableMfa = async (userId) => {
  const result = await pool.query(
    `
    UPDATE ${TABLE_NAME}
    SET enabled = true,
        updated_at = NOW()
    WHERE user_id = $1
    RETURNING *;
    `,
    [userId]
  );

  return result.rows[0];
};

// =========================
// ❌ DISABLE MFA
// =========================
export const disableMfa = async (userId) => {
  const result = await pool.query(
    `
    UPDATE ${TABLE_NAME}
    SET enabled = false,
        updated_at = NOW()
    WHERE user_id = $1
    RETURNING *;
    `,
    [userId]
  );

  return result.rows[0];
};

// =========================
// 🔑 UPDATE SECRET (SOLO)
// =========================
export const updateSecret = async (userId, secret) => {
  const result = await pool.query(
    `
    UPDATE ${TABLE_NAME}
    SET secret = $1,
        updated_at = NOW()
    WHERE user_id = $2
    RETURNING *;
    `,
    [secret, userId]
  );

  return result.rows[0];
};

// =========================
// 🔥 RESET COMPLETO MFA (RECOMENDADO)
// =========================
export const resetMfa = async (userId, secret) => {
  const result = await pool.query(
    `
    UPDATE ${TABLE_NAME}
    SET secret = $1,
        enabled = false,
        updated_at = NOW()
    WHERE user_id = $2
    RETURNING *;
    `,
    [secret, userId]
  );

  return result.rows[0];
};