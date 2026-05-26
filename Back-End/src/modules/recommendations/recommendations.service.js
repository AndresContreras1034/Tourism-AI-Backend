import axios from "axios";
import { mapProfileToEngine } from "./recommendation.mapper.js";
import { query } from "../../config/db.js";

const PYTHON_AI_URL = "http://localhost:8000";

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
    `
    UPDATE users
    SET tokens = tokens - 1
    WHERE id = $1 AND tokens > 0
    RETURNING tokens
    `,
    [userId]
  );

  return result.rows[0]?.tokens ?? null;
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
    // ➖ DESCONTAR TOKEN
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

    return {
      success: true,
      data: response.data,
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


