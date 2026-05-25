// modules/plans/plan.routes.js

import express from "express";

import {
  getRecommendations,
} from "./plan.controller.js";

import { authMiddleware } from "../auth/auth.middleware.js";

const router = express.Router();

console.log("🧭 [PLAN ROUTES] Inicializando rutas de planes");

// =====================================================
// 🧠 RECOMENDACIONES IA
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

export default router;