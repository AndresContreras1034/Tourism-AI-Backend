import express from "express";

import {
  getRecommendations,
  getPlanByIdController
} from "./plan.controller.js";

import { authMiddleware } from "../auth/auth.middleware.js";

const router = express.Router();

console.log("🧭 [PLAN ROUTES] Inicializando rutas de planes");

// =====================================================
// 🧠 RECOMENDACIONES IA (EXISTE YA)
// =====================================================
router.post(
  "/recommendations",
  authMiddleware,
  async (req, res, next) => {
    try {
      console.log("➡️ [ROUTE] POST /plans/recommendations");
      await getRecommendations(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// 🚀 PLAN COMPLETO (NUEVO - CRÍTICO)
// =====================================================
router.get(
  "/:id",
  authMiddleware,
  async (req, res, next) => {
    try {
      console.log("➡️ [ROUTE] GET /plans/:id");

      await getPlanByIdController(req, res);

    } catch (error) {
      next(error);
    }
  }
);

export default router;