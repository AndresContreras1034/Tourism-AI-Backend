import {
  buildExperience,
  buildBudget,
  buildSecurity,
  buildOptimalDay
} from "../ai.service.js";

/**
 * Util: safe wrapper para evitar que un fallo de IA rompa todo el plan
 */
async function safeCall(promise, fallback, label = "service") {
  try {
    return await promise;
  } catch (err) {
    console.error(`[ORCHESTRATOR] ${label} failed:`, err.message);
    return fallback;
  }
}

/**
 * Util: ejecuta con timeout (evita requests colgados)
 */
function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

/**
 * MAIN ORCHESTRATOR
 * @param {Object} params
 */
export async function buildFullPlan({ user, location, seed }) {
  if (!seed) throw new Error("Seed plan is required");

  // 🔥 CONTEXTO BASE
  const base = {
    title: seed.title || "Plan personalizado",
    location: {
      name: location?.name || "Ubicación no disponible",
      coordinates: location?.coordinates || null,
    },
    score: seed.score || null,
  };

  // ⚡ IA PARALLEL
  const [
    experience,
    budget,
    security,
    optimalDay,
  ] = await Promise.all([
    safeCall(
      withTimeout(buildExperience(seed, user)),
      {
        description: "Experiencia no disponible por ahora",
        highlights: [],
        summary: "",
        insight: "",
      },
      "experience"
    ),

    safeCall(
      withTimeout(buildBudget(seed, user)),
      {
        estimated_total: 0,
        price_range: {
          coffee: "N/A",
          meal: "N/A",
          snack: "N/A",
        },
      },
      "budget"
    ),

    safeCall(
      withTimeout(buildSecurity(location)),
      {
        level: "medium",
        recommendation: "Información de seguridad no disponible",
        tips: [],
      },
      "security"
    ),

    safeCall(
      withTimeout(buildOptimalDay(location, seed)),
      {
        date: "Por definir",
        weather: {
          condition: "Desconocido",
          temp_min: 0,
          temp_max: 0,
          precip_probability: 0,
          icon: "❓",
        },
        reason: "No se pudo calcular el mejor día",
      },
      "optimalDay"
    ),
  ]);

  // 🗺️ TRANSPORTE
  const transport = seed.transport || [];

  // 📍 MAP POINTS
  const map_points = seed.map_points || [];

  // 🤖 CONTEXTO IA UNIFICADO
  const ai_context = {
    summary:
      experience.summary ||
      "Explora este destino con una experiencia personalizada.",

    local_insight:
      experience.insight ||
      "Información local no disponible en este momento.",
  };

  // 🧱 PLAN FINAL
  const plan = {
    ...base,

    ai_context,

    transport,
    map_points,

    experience,
    budget,
    optimal_day: optimalDay,
    security,

    meta: {
      generated_at: new Date().toISOString(),
      ai_enabled: true,
      version: "1.0.0",
    },
  };

  return plan;
}