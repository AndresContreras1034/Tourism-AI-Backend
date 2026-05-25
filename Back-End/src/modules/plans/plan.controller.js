// modules/plans/plan.controller.js

import { getProfileByUserId } from "../onboarding/profile.service.js";
import { getRecommendationsFromAI } from "./plan.service.js";

console.log("🧭 [PLAN CONTROLLER] Inicializado");

// =====================================================
// 🧠 RECOMENDACIONES REALES DESDE FASTAPI
// =====================================================
export const getRecommendations = async (req, res) => {
  try {
    console.log("🚀 [PLANS] Generando recomendaciones IA");

    const userId = req.user.id;

    console.log("👤 [PLANS] Usuario:", userId);

    // =====================================================
    // 📥 OBTENER PERFIL DEL USUARIO
    // =====================================================
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      console.warn("⚠️ [PLANS] Usuario sin perfil");

      return res.status(404).json({
        success: false,
        message: "Profile not found. Please complete onboarding.",
      });
    }

    console.log("🧠 [PLANS] Perfil encontrado");

    // =====================================================
    // 🧠 MAPEAR PERFIL → FILTROS MOTOR PYTHON
    // =====================================================
    const filters = {
      tipo_viaje: profile.tipo_viaje,
      presupuesto: profile.presupuesto,
      compania: profile.compania,
      clima: profile.clima,
      duracion: profile.duracion,
    };

    console.log("📦 [PLANS] Filtros enviados:", filters);

    // =====================================================
    // 🤖 LLAMAR AI SERVICE (FASTAPI)
    // =====================================================
    const aiResponse = await getRecommendationsFromAI(filters);

    console.log("🟢 [PLANS] Recomendaciones generadas");

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