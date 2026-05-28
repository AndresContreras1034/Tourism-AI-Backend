import axios from "axios";
import { buildFullPlan } from "../ai/orchestrator/plan.orchestrator.service.js";
import { query } from "../../config/db.js";

console.log("🧭 [PLAN SERVICE] Inicializado");

// =====================================================
// 🌐 CONFIG FASTAPI
// =====================================================
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

// =====================================================
// 🌐 FASTAPI CALL (SAFE)
// =====================================================
const getRecommendationsFromFastAPI = async (filters) => {
  try {
    console.log("🚀 [FASTAPI] Requesting recommendations");
    console.log("📦 [FASTAPI FILTERS]:", filters);

    const response = await axios.post(
      `${AI_SERVICE_URL}/recommendations`,
      filters,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      }
    );

    console.log("🟢 [FASTAPI RESPONSE RAW]:", response.data);

    return response.data || { transport: [], map_points: [], insights: [] };

  } catch (error) {
    console.error("❌ [FASTAPI ERROR]:", error.message);
    return { transport: [], map_points: [], insights: [] };
  }
};

// =====================================================
// 🧠 GET PLAN BY ID (ENTRYPOINT)
// =====================================================
export const getPlanById = async (id, user) => {
  try {
    console.log("🔥 =====================================");
    console.log("🧠 [PLAN SERVICE] START");
    console.log("🔥 =====================================");
    console.log("🧾 PLAN ID:", id);
    console.log("👤 USER:", user?.id);

    // =====================================================
    // 1. SEED BASE
    // =====================================================
    const seed = {
      id,
      title: "Plan generado",
      location: {
        name: "Bogotá",
        coordinates: { lat: 4.7110, lng: -74.0721 },
      },
      score: 4.5,
      transport: [],
      map_points: [],
    };

    console.log("🌱 SEED:", seed);

    // =====================================================
    // 2. FILTERS FOR FASTAPI
    // =====================================================
    const filters = {
      userId:   user?.id,
      location: seed.location.name,
      planId:   id,
    };

    // =====================================================
    // 3. FASTAPI CALL
    // =====================================================
    const recommendations = await getRecommendationsFromFastAPI(filters);
    console.log("📡 FASTAPI RESULT:", recommendations);

    // =====================================================
    // 4. ENRICH SEED
    // =====================================================
    const enrichedSeed = {
      ...seed,
      transport:  recommendations?.transport  || [],
      map_points: recommendations?.map_points || [],
      insights:   recommendations?.insights   || [],
    };

    console.log("🧩 ENRICHED SEED:", enrichedSeed);

    // =====================================================
    // 5. ORCHESTRATOR CALL
    // Retorna { plan, tokens_used } con tokens reales de DeepSeek
    // =====================================================
    let finalPlan;
    let tokens_used = 0;

    try {
      console.log("🧠 CALLING ORCHESTRATOR...");

      const result = await buildFullPlan({
        user,
        location: seed.location,
        seed:     enrichedSeed,
      });

      finalPlan   = result.plan;
      tokens_used = result.tokens_used ?? 0;

      console.log(`🟢 ORCHESTRATOR SUCCESS — tokens: ${tokens_used}`);

    } catch (err) {
      console.error("❌ ORCHESTRATOR CRASH:", err.message);
      throw err;
    }

    // =====================================================
    // 5.5 💾 PERSISTIR EN DB con tokens reales
    // =====================================================
    try {
      await query(
        `INSERT INTO plans
           (user_id, title, description, location_suggestion, source, tokens_used)
         VALUES ($1, $2, $3, $4, 'ai', $5)`,
        [
          user.id,
          finalPlan.title               ?? "Plan generado",
          finalPlan.ai_context?.summary ?? null,
          finalPlan.location?.name      ?? null,
          tokens_used,                        // ✅ tokens reales, no hardcodeado
        ]
      );
      console.log(`💾 [PLAN SERVICE] Plan persistido — user: ${user.id} | tokens: ${tokens_used}`);
    } catch (dbErr) {
      console.error("⚠️ [PLAN SERVICE] Error guardando en DB:", dbErr.message);
      // No rompemos el flujo: el usuario igual recibe su plan
    }

    // =====================================================
    // 6. RETURN FINAL
    // =====================================================
    console.log("🎯 FINAL PLAN READY");
    return finalPlan;

  } catch (error) {
    console.error("❌ [PLAN SERVICE FATAL ERROR]:", error.message);

    return {
      title:      "Error generando plan",
      location:   { name: "N/A", coordinates: null },
      ai_context: { summary: "No se pudo generar el plan en este momento.", local_insight: "" },
      transport:  [],
      map_points: [],
      experience: { description: "", highlights: [] },
      budget: {
        estimated_total: 0,
        price_range: { coffee: "N/A", meal: "N/A", snack: "N/A" },
      },
      optimal_day: null,
      security:    null,
    };
  }
};