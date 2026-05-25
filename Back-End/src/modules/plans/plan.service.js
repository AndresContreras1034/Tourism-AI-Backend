// modules/plans/plan.service.js

import axios from "axios";

console.log("🧭 [PLAN SERVICE] Inicializado");

// =====================================================
// 🌐 URL DEL AI SERVICE (FASTAPI)
// =====================================================
const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";


// =====================================================
// 🧠 OBTENER RECOMENDACIONES DESDE FASTAPI
// =====================================================
export const getRecommendationsFromAI = async (filters) => {
  try {
    console.log("🚀 [PLAN SERVICE] Consultando AI Service");

    console.log("📦 [PLAN SERVICE] Filters:", filters);

    // =====================================================
    // 🤖 REQUEST A FASTAPI
    // =====================================================
    const response = await axios.post(
      `${AI_SERVICE_URL}/recommendations`,
      filters,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🟢 [PLAN SERVICE] Respuesta recibida del AI Service");

    return response.data;

  } catch (error) {
    console.error(
      "❌ [PLAN SERVICE ERROR]:",
      error.response?.data || error.message
    );

    throw new Error("Error communicating with AI Service");
  }
};