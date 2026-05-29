import { callDeepSeek } from "../ai/ai.service.js";
import { getRoute } from "../ai/ors.service.js";
import { getOptimalDay } from "../ai/weather.service.js";

// ======================================================
// 🧠 ENRICH SINGLE PLAN
// ======================================================
export const enrichPlan = async (plan) => {
  try {
    console.log("🧠 Enriching plan...");

    const { content: aiResponse } = await callDeepSeek([
      {
        role: "system",
        content: `
Eres un experto en turismo en Bogotá.
Tu tarea es enriquecer un plan turístico con información detallada.
Devuelve SOLO JSON válido, sin texto adicional, sin markdown, sin backticks.
        `,
      },
      {
        role: "user",
        content: `
Completa este plan turístico:

${JSON.stringify(plan)}

Devuelve exactamente este formato JSON:

{
  "ai_context": {
    "summary": "",
    "local_insight": ""
  },
  "location": {
    "name": "",
    "coordinates": { "lat": 0.0, "lng": 0.0 }
  },
  "map_points": [
    { "name": "", "description": "", "lat": 0.0, "lng": 0.0 },
    { "name": "", "description": "", "lat": 0.0, "lng": 0.0 },
    { "name": "", "description": "", "lat": 0.0, "lng": 0.0 }
  ],
  "transport": [
    { "key": "caminar",   "desc": "" },
    { "key": "uber",      "desc": "" },
    { "key": "bicicleta", "desc": "" },
    { "key": "bus",       "desc": "" }
  ],
  "experience": {
    "description": "",
    "highlights": []
  },
  "budget": {
    "estimated_total": 0,
    "price_range": {
      "coffee": "",
      "meal": "",
      "snack": ""
    }
  },
  "security": {
    "level": "low|medium|high",
    "recommendation": "",
    "tips": []
  }
}

Reglas:
- map_points: entre 2 y 5 puntos reales del plan en Bogotá con coordenadas exactas.
- location.coordinates: coordenadas del punto principal del plan.
- transport: 4 entradas fijas con keys exactos: caminar, uber, bicicleta, bus.
- desc de cada transporte: máximo 15 palabras, relevante y específico para este plan.
- security.level: solo "low", "medium" o "high".
- estimated_total: número entero en COP.
- Devuelve SOLO el JSON, sin explicaciones ni markdown.
        `,
      },
    ]);

    let parsed = {};

    try {
      const clean = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(clean);
    } catch (e) {
      console.warn("⚠️ Failed to parse AI response:", e.message);
      parsed = {};
    }

    // ======================================================
    // 🌤️ CLIMA REAL — Open-Meteo
    // ======================================================
    console.log("🌤️ Obteniendo día óptimo con clima real...");
    const optimalDay = await getOptimalDay();

    // ======================================================
    // 🗺️ ORS — Generar polilínea de ruta entre map_points
    // ======================================================
    let route = [];

    if (parsed.map_points?.length >= 2) {
      console.log("🗺️ Generando ruta ORS...");
      route = await getRoute(parsed.map_points);
    }

    return {
      ...plan,
      ...parsed,
      optimal_day: optimalDay, // ✅ reemplaza el de DeepSeek con datos reales
      route,
    };

  } catch (error) {
    console.error("❌ enrichPlan error:", error.message);
    return plan;
  }
};