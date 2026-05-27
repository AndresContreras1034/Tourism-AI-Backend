import express from "express";

import {
  register,
  login,
  me,
  verifyMfaLogin,
} from "./auth.controller.js";

import { authMiddleware } from "./auth.middleware.js";

console.log("🔐 [AUTH ROUTES] Inicializando rutas de autenticación");

const router = express.Router();

/* ======================================================
   🧾 REGISTER
====================================================== */
router.post("/register", async (req, res, next) => {
  console.log("➡️ [ROUTE] POST /auth/register");
  try {
    await register(req, res);
  } catch (err) {
    next(err);
  }
});

/* ======================================================
   🔑 LOGIN (STEP 1 MFA OR DIRECT LOGIN)
====================================================== */
router.post("/login", async (req, res, next) => {
  console.log("➡️ [ROUTE] POST /auth/login");
  try {
    await login(req, res);
  } catch (err) {
    next(err);
  }
});

/* ======================================================
   🔐 VERIFY MFA LOGIN (STEP 2)
====================================================== */
router.post("/verify-mfa", async (req, res, next) => {
  console.log("➡️ [ROUTE] POST /auth/verify-mfa");
  try {
    await verifyMfaLogin(req, res);
  } catch (err) {
    next(err);
  }
});

/* ======================================================
   👤 ME (AUTH REQUIRED)
====================================================== */
router.get("/me", authMiddleware, async (req, res, next) => {
  console.log("➡️ [ROUTE] GET /auth/me");
  try {
    await me(req, res);
  } catch (err) {
    next(err);
  }
});

/* ======================================================
   ⚠️ DEV ONLY — login sin MFA para testing
====================================================== */
if (process.env.NODE_ENV !== "production") {
  router.post("/dev-login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const bcrypt     = await import("bcryptjs");
      const jwt        = await import("jsonwebtoken");
      const { query }  = await import("../../config/db.js");
      const env        = await import("../../config/env.js");

      const result = await query(
        "SELECT id, email, name, role, tokens, password_hash FROM users WHERE email = $1",
        [email]
      );

      if (!result.rows[0]) {
        return res.status(404).json({ success: false, error: "Usuario no encontrado" });
      }

      const user = result.rows[0];

      const isMatch = await bcrypt.default.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ success: false, error: "Contraseña incorrecta" });
      }

      const token = jwt.default.sign(
        { id: user.id, email: user.email, role: user.role, mfa_verified: true },
        env.default.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({ success: true, token, user });

    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
}

export default router;