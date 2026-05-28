import axios from "axios";
import { mapProfileToEngine } from "./recommendation.mapper.js";
import { query } from "../../config/db.js";

const PYTHON_AI_URL = process.env.PYTHON_AI_URL;

// ======================================================
// 💰 TOKENS HELPERS
// ======================================================
const getUserTokens = async (userId) => {
  const result = await query(
    "SELECT tokens FROM users WHERE id = $1",
    [userId]
  );
  return result.rows[0]?.tokens ?? 0;
};

const deductToken = async (userId) => {
  const result = await query(
    `UPDATE users
     SET tokens = tokens - 1
     WHERE id = $1 AND tokens > 0
     RETURNING tokens`,
    [userId]
  );
  return result.rows[0]?.tokens ?? null;
};

// ======================================================
// 💾 GUARDAR PLANES EN DB (después de respuesta Python)
// ======================================================
const savePlans = async (userId, recommendations, profile) => {
  try {
    const plans = recommendations || [];

    for (const plan of plans) {
      await query(
        `INSERT INTO plans (user_id, title, location_suggestion, source, tokens_used)
         VALUES ($1, $2, $3, 'ai', 0)`,
        [
          userId,
          plan.plan_turistico_bogota || `Plan ${profile.tipo_viaje || "turístico"}`,
          plan.plan_turistico_bogota || "Bogotá",
        ]
      );
    }

    console.log(`💾 [RECOMMENDATIONS] ${plans.length} planes guardados en DB — user:`, userId);
  } catch (dbErr) {
    console.error("⚠️ [RECOMMENDATIONS] Error guardando planes:", dbErr.message);
  }
};

// ======================================================
// 🚀 MAIN SERVICE
// ======================================================
export const getRecommendations = async (profile, userId) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📤 Payload NORMALIZADO:", profile);
    console.log("👤 USER ID:", userId);

    // ======================================================
    // 🔐 VALIDAR TOKENS
    // ======================================================
    const tokens = await getUserTokens(userId);

    console.log("💰 Tokens actuales:", tokens);

    if (tokens <= 0) {
      return {
        success: false,
        error: "No tienes tokens suficientes",
        remainingTokens: 0,
      };
    }

    // ======================================================
    // ➖ DESCONTAR TOKEN (1 token = 1 generación de 3 planes)
    // ======================================================
    const updatedTokens = await deductToken(userId);

    if (updatedTokens === null) {
      return {
        success: false,
        error: "No se pudo descontar el token",
      };
    }

    console.log("💸 Token descontado. Restantes:", updatedTokens);

    // ======================================================
    // 🧠 CALL PYTHON AI
    // ======================================================
    const payload = mapProfileToEngine(profile);

    const response = await axios.post(
      `${PYTHON_AI_URL}/recommendations`,
      payload
    );

    console.log("🟢 AI RESPONSE OK");

    const aiData = response.data;

    // ======================================================
    // 💾 PERSISTIR PLANES (con nombres reales de Python)
    // ======================================================
    const allPlans = [
      ...(aiData?.recommendations || []),
      ...(aiData?.bestMatch ? [aiData.bestMatch] : []),
    ];

    await savePlans(userId, allPlans, profile);

    return {
      success: true,
      data: aiData,
      remainingTokens: updatedTokens,
    };

  } catch (error) {
    console.error("❌ AI error:", error.message);

    return {
      success: false,
      error: "AI service unavailable",
    };
  } finally {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
};