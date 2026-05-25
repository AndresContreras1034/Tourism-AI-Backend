// profile routes
import express from "express";

import {
  saveProfile,
  getProfile,
} from "./profile.controller.js";

import { authMiddleware } from "../auth/auth.middleware.js";

console.log("👤 [PROFILE ROUTES] Inicializando rutas de onboarding");

const router = express.Router();

// =========================
// 💾 GUARDAR / ACTUALIZAR PERFIL
// =========================
router.post("/", authMiddleware, async (req, res, next) => {
  console.log("➡️ [ROUTE] POST /profile");

  saveProfile(req, res).catch(next);
});

// =========================
// 📥 OBTENER PERFIL
// =========================
router.get("/", authMiddleware, async (req, res, next) => {
  console.log("➡️ [ROUTE] GET /profile");

  getProfile(req, res).catch(next);
});

export default router;