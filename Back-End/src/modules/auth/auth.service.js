import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import { query } from "../../config/db.js";
import mfaService from "../mfa/mfa.service.js";

console.log("🔐 [AUTH SERVICE] Inicializado");

// =========================
// 🧾 REGISTER
// =========================
export const registerUser = async ({ email, password, name }) => {
  const userExists = await query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (userExists.rows.length > 0) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name`,
    [email, hashedPassword, name]
  );

  const user = result.rows[0];

  return {
    requiresMFA: true,
    userId: user.id,
    message: "MFA required after registration",
  };
};

// =========================
// 🔑 LOGIN (MFA OBLIGATORIO)
// =========================
export const loginUser = async ({ email, password }) => {
  console.log("🔑 [AUTH] Login iniciado");

  const result = await query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  console.log("🟢 [AUTH] Credenciales válidas");

  const tempToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      mfa_stage: "pending",
    },
    env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  return {
    requiresMFA: true,
    userId: user.id,
    tempToken,
    message: "MFA required",
  };
};

// =========================
// 🔐 VERIFY MFA LOGIN
// =========================
export const verifyMfaLogin = async ({ userId, token }) => {
  const isValid = await mfaService.verifyLoginToken(userId, token);

  if (!isValid) {
    throw new Error("Invalid MFA code");
  }

  // ✅ Incluye role para el JWT
  const result = await query(
    "SELECT id, email, name, role, tokens FROM users WHERE id = $1",
    [userId]
  );

  const user = result.rows[0];

  const jwtToken = jwt.sign(
    {
      id:           user.id,
      email:        user.email,
      role:         user.role,       // ✅ crítico para el admin middleware
      mfa_verified: true,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    user,
    token: jwtToken,
  };
};