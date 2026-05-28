import { callDeepSeek } from "../ai.service.js";

async function safeCall(promise, fallback, label = "service") {
  try {
    return await promise;
  } catch (err) {
    console.error(`[ORCHESTRATOR] ${label} failed:`, err.message);
    return fallback;
  }
}

function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

// ─── Llamada única a DeepSeek para todo el plan ──────────────────────────────
// Un solo request en vez de 4 paralelos = menos tokens, menos latencia
const buildPlanWithAI = async (seed, user) => {
  const prompt = `Eres un experto en turismo en Colombia. Genera contenido para este plan turístico en JSON válido, sin markdown.

Destino: ${seed.location?.name || "Bogotá"}
Título: ${seed.title || "Plan personalizado"}

Responde SOLO con este JSON:
{"experience":{"summary":"string","insight":"string","description":"string","highlights":["string"]},"budget":{"estimated_total":0,"price_range":{"coffee":"string","meal":"string","snack":"string"}},"security":{"level":"low|medium|high","recommendation":"string","tips":["string"]},"optimal_day":{"date":"string","weather":{"condition":"string","temp_min":0,"temp_max":0,"precip_probability":0,"icon":"string"},"reason":"string"}}

Usa precios reales en COP. Sin null.`;

  const { content, tokens_used } = await callDeepSeek(
    [
      { role: "system", content: "Responde SOLO con JSON válido, sin markdown ni texto adicional." },
      { role: "user",   content: prompt },
    ],
    0.5
  );

  if (!content) return { data: null, tokens_used: 0 };

  try {
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
    return { data: parsed, tokens_used };
  } catch {
    console.error("[ORCHESTRATOR] JSON parse failed");
    return { data: null, tokens_used };
  }
};

// ─── Fallbacks ────────────────────────────────────────────────────────────────
const FALLBACK_EXPERIENCE = {
  summary:     "Explora este destino con una experiencia personalizada.",
  insight:     "Información local no disponible en este momento.",
  description: "Experiencia no disponible por ahora",
  highlights:  [],
};

const FALLBACK_BUDGET = {
  estimated_total: 0,
  price_range: { coffee: "N/A", meal: "N/A", snack: "N/A" },
};

const FALLBACK_SECURITY = {
  level:          "medium",
  recommendation: "Información de seguridad no disponible",
  tips:           [],
};

const FALLBACK_OPTIMAL_DAY = {
  date:   "Por definir",
  weather: { condition: "Desconocido", temp_min: 0, temp_max: 0, precip_probability: 0, icon: "❓" },
  reason: "No se pudo calcular el mejor día",
};

// ─── MAIN ORCHESTRATOR ────────────────────────────────────────────────────────
export async function buildFullPlan({ user, location, seed }) {
  if (!seed) throw new Error("Seed plan is required");

  const { data: ai, tokens_used } = await safeCall(
    withTimeout(buildPlanWithAI(seed, user)),
    { data: null, tokens_used: 0 },
    "deepseek-plan"
  );

  const experience = ai?.experience || FALLBACK_EXPERIENCE;
  const budget     = ai?.budget     || FALLBACK_BUDGET;
  const security   = ai?.security   || FALLBACK_SECURITY;
  const optimalDay = ai?.optimal_day || FALLBACK_OPTIMAL_DAY;

  const plan = {
    title: seed.title || "Plan personalizado",
    location: {
      name:        location?.name        || "Ubicación no disponible",
      coordinates: location?.coordinates || null,
    },
    score:      seed.score || null,
    ai_context: {
      summary:       experience.summary  || FALLBACK_EXPERIENCE.summary,
      local_insight: experience.insight  || FALLBACK_EXPERIENCE.insight,
    },
    transport:   seed.transport   || [],
    map_points:  seed.map_points  || [],
    experience,
    budget,
    optimal_day: optimalDay,
    security,
    meta: {
      generated_at: new Date().toISOString(),
      ai_enabled:   true,
      version:      "2.0.0",
    },
  };

  // tokens_used se retorna separado para que plan.service.js lo guarde en DB
  return { plan, tokens_used };
}