import { query } from "../../config/db.js";

// =========================
// 🧱 TABLE SCHEMA
// =========================
export const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,

  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,

  role VARCHAR(20) DEFAULT 'user',

  -- 🔐 MFA FIELDS
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

console.log("🧱 [USER MODEL] Schema definido");

// =========================
// 🔍 GET USER BY ID
// =========================
export const getById = async (id) => {
  const result = await query(
    `SELECT id, name, email, role, mfa_enabled, mfa_secret
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

// =========================
// ✏️ UPDATE USER (GENÉRICO)
// =========================
export const update = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  Object.entries(data).forEach(([key, value]) => {
    fields.push(`${key} = $${index}`);
    values.push(value);
    index++;
  });

  values.push(id);

  const result = await query(
    `UPDATE users
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${index}
     RETURNING id, name, email, role, mfa_enabled`,
    values
  );

  return result.rows[0];
};

// =========================
// 📦 EXPORT DEFAULT (COMPATIBLE CON IMPORTS)
// =========================
export default {
  createUsersTable,
  getById,
  update,
};