import express from "express";
import { enrichPlan } from "./enrich.service.js";
import { getRecommendations } from "./recommendations.service.js";
import { authMiddleware } from "../auth/auth.middleware.js";

const router = express.Router();

// ======================================================
// 📋 ENRICH PLAN
// POST /enrich
// ======================================================
router.post("/enrich", async (req, res) => {
  try {
    const plan = req.body;
    const enriched = await enrichPlan(plan);

    res.json({
      success: true,
      data: enriched,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "enrichment failed",
    });
  }
});

// ======================================================
// 🧠 AI RECOMMENDATIONS (Python Ranking Engine)
// POST /enrich/recommendations
// ======================================================
router.post("/recommendations", authMiddleware, async (req, res) => {
  try {
    const profile = req.body;
    const userId = req.user?.id; // 🔥 viene del JWT

    if (!profile) {
      return res.status(400).json({
        success: false,
        error: "Profile is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const result = await getRecommendations(profile, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      data: result.data,
      remainingTokens: result.remainingTokens,
    });
  } catch (err) {
    console.error("❌ Recommendations error:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;