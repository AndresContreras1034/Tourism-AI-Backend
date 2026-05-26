import { getProfileByUserId } from "../onboarding/profile.service.js";
import {
  getPlanById as getPlanFromService
} from "./plan.service.js";

console.log("🧭 [PLAN CONTROLLER] Inicializado");

// =====================================================
// 🧠 RECOMENDACIONES (FASTAPI ONLY)
// =====================================================
export const getRecommendations = async (req, res) => {
  try {
    console.log("🚀 [PLANS] Generando recomendaciones IA");

    const userId = req.user.id;

    // perfil usuario
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please complete onboarding.",
      });
    }

    // filtros para motor IA externo
    const filters = {
      tipo_viaje: profile.tipo_viaje,
      presupuesto: profile.presupuesto,
      compania: profile.compania,
      clima: profile.clima,
      duracion: profile.duracion,
    };

    // llamada FASTAPI
    const aiResponse = await getRecommendationsFromAI(filters);

    return res.status(200).json({
      success: true,
      message: "Recommendations generated successfully",
      data: aiResponse,
    });

  } catch (error) {
    console.error("❌ [PLANS ERROR]:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error generating recommendations",
      error: error.message,
    });
  }
};

// =====================================================
// 🚀 PLAN COMPLETO (ORCHESTRATOR + IA)
// =====================================================
export const getPlanByIdController = async (req, res) => {
  try {
    console.log("🧠 [PLANS] Generando plan completo");

    const userId = req.user.id;
    const planId = req.params.id;

    // 1. perfil usuario (validación base)
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // 2. ORCHESTRATOR (DeepSeek + FastAPI + seed)
    const plan = await getPlanFromService(planId, req.user);

    return res.status(200).json({
      success: true,
      message: "Plan generated successfully",
      data: plan,
    });

  } catch (error) {
    console.error("❌ [PLAN ERROR]:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error generating plan",
      error: error.message,
    });
  }
};