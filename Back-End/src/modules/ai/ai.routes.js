import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { generatePlans, generateChatResponse } from "./ai.service.js";
import { enrichPlan } from "../recommendations/enrich.service.js";
import { getRecommendations } from "../recommendations/recommendations.service.js";

const router = express.Router();

console.log("🤖 [AI ROUTES] Inicializando rutas de IA");

// ======================================================
// ✈️ GENERAR PLANES
// ======================================================
router.post("/generate-plans", authMiddleware, async (req, res) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧠 [AI PLANS] Request recibido");
  console.log("👤 Headers auth OK");

  try {
    const profile = req.body;

    console.log("📦 [AI PLANS] Profile recibido:");
    console.log(profile);

    const result = await generatePlans(profile);

    console.log("🟢 [AI PLANS] Resultado generado correctamente");
    console.log(result);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("❌ [AI PLANS ERROR]", error);

    return res.status(500).json({
      success: false,
      message: "Error generating plans",
    });
  }
});

// ======================================================
// 💬 CHAT IA
// ======================================================
router.post("/chat", async (req, res) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💬 [AI CHAT] Request recibido");

  try {
    const { message } = req.body;

    console.log("📩 [AI CHAT] Mensaje del usuario:");
    console.log(message);

    if (!message || !message.trim()) {
      console.log("⚠️ [AI CHAT] Mensaje vacío");

      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await generateChatResponse(message);

    console.log("🟢 [AI CHAT] Respuesta generada:");
    console.log(response);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return res.status(200).json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error("❌ [AI CHAT ERROR]", error);

    return res.status(500).json({
      success: false,
      message: "Error in chat",
    });
  }
});

// ======================================================
// 📋 ENRICH PLAN (DeepSeek)
// POST /api/ai/enrich
// ======================================================
router.post("/enrich", async (req, res) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ [AI ENRICH] Request recibido");

  try {
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({
        success: false,
        error: "Plan is required",
      });
    }

    console.log("📦 [AI ENRICH] Plan recibido:", plan);

    const enriched = await enrichPlan(plan);

    console.log("🟢 [AI ENRICH] Plan enriquecido correctamente");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return res.json({
      success: true,
      data: enriched,
    });

  } catch (error) {
    console.error("❌ [AI ENRICH ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Enrichment failed",
    });
  }
});

// ======================================================
// 🧠 AI RECOMMENDATIONS (Python Ranking Engine)
// POST /api/ai/recommendations
// ======================================================
router.post("/recommendations", authMiddleware, async (req, res) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 [AI RECOMMENDATIONS] Request recibido");

  try {
    const profile = req.body;
    const userId = req.user?.id;

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

    console.log("📦 [AI RECOMMENDATIONS] Profile recibido:", profile);
    console.log("👤 [AI RECOMMENDATIONS] userId:", userId);

    const result = await getRecommendations(profile, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log("🟢 [AI RECOMMENDATIONS] Resultado generado correctamente");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return res.json({
      success: true,
      data: result.data,
      remainingTokens: result.remainingTokens,
    });

  } catch (err) {
    console.error("❌ [AI RECOMMENDATIONS ERROR]", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ======================================================
// 🧪 TEST
// ======================================================
router.get("/test", (req, res) => {
  console.log("🧪 [AI TEST] Endpoint ejecutado");

  return res.json({
    success: true,
    message: "AI module working correctly",
  });
});

export default router;