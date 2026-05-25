// auth.routes.js

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

export default router;