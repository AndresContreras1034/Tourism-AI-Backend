// auth.controller.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import env from "../../config/env.js";
import { query } from "../../config/db.js";
import mfaService from "../mfa/mfa.service.js";

/* ======================================================
   🧾 REGISTER
====================================================== */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y password requeridos" });
    }

    const userExists = await query(`SELECT id FROM users WHERE email = $1`, [email]);

    if (userExists.rows.length > 0) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (email, password_hash, role, mfa_enabled, name)
       VALUES ($1, $2, 'client', false, $3)
       RETURNING id, email, role, name, mfa_enabled`,
      [email, passwordHash, name || null]
    );

    return res.status(201).json({ success: true, user: result.rows[0] });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   🔑 LOGIN (STEP 1 - MFA CHECK)
====================================================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 🔥 SI TIENE MFA → no loguea aún
    if (user.mfa_enabled) {
      const tempToken = jwt.sign(
        { id: user.id, stage: "mfa_pending" },
        env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      return res.json({
        success: true,
        requiresMFA: true,
        mfaEnabled: true,
        userId: user.id,
        tempToken,
      });
    }

    // 🔥 LOGIN DIRECTO (SIN MFA)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      success: true,
      requiresMFA: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfa_enabled: user.mfa_enabled,
        tokens: user.tokens,   // 👈 FIX
      },
      token,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   🔐 VERIFY MFA LOGIN
====================================================== */
export const verifyMfaLogin = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const isValid = await mfaService.verifyLoginToken(userId, token);

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid MFA code" });
    }

    const result = await query(
      `SELECT id, email, role, name, mfa_enabled, tokens   -- 👈 FIX
       FROM users
       WHERE id = $1`,
      [userId]
    );

    const user = result.rows[0];
      console.log("🔍 USER FROM DB:", user); // 👈 agrega aquí


    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, mfa: true },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({ success: true, user, token: jwtToken });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   👤 ME
====================================================== */
export const me = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT id, email, role, name, mfa_enabled, tokens   -- 👈 FIX
       FROM users WHERE id = $1`,
      [userId]
    );

    return res.json({ success: true, user: result.rows[0] });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};