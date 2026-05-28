import { buildTravelPrompt, buildChatPrompt } from "./prompt.builder.js";

console.log("AI SERVICE OK");

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

// ─── JSON parser robusto ──────────────────────────────────────────────────────
const safeJSONParse = (text) => {
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err) {
    console.error("❌ JSON parse failed:", err.message);
    return null;
  }
};

// ─── Llamada base a DeepSeek ──────────────────────────────────────────────────
const callDeepSeek = async (messages, temperature = 0.5) => {
  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "deepseek-chat", messages, temperature }),
    });

    const data = await response.json();

    // Devuelve contenido + tokens para poder guardarlos
    const content      = data?.choices?.[0]?.message?.content ?? null;
    const tokens_used  = data?.usage?.total_tokens            ?? 0;

    if (!content) console.error("❌ Empty response from DeepSeek");

    return { content, tokens_used };

  } catch (error) {
    console.error("❌ DeepSeek error:", error);
    return { content: null, tokens_used: 0 };
  }
};

export { callDeepSeek };

// ─── Chatbot ──────────────────────────────────────────────────────────────────
// buildChatPrompt ya tiene el system prompt incluido; lo mandamos como user msg
// para no duplicar instrucciones.
export const generateChatResponse = async (message) => {
  const prompt = buildChatPrompt(message);

  const { content } = await callDeepSeek([
    { role: "user", content: prompt },
  ]);

  return content || "No pude generar respuesta en este momento.";
};

// ─── Generador de planes ──────────────────────────────────────────────────────
// UN SOLO system prompt: "responde solo JSON".
// El schema completo ya está en buildTravelPrompt (prompt.builder.js).
export const generatePlans = async (profile) => {
  console.log("🧠 [AI PLANS] Generating...");

  const { content: raw, tokens_used } = await callDeepSeek(
    [
      {
        role: "system",
        content: "Responde SOLO con JSON válido, sin markdown ni texto adicional.",
      },
      {
        role: "user",
        content: buildTravelPrompt(profile),
      },
    ],
    0.7
  );

  if (!raw) {
    return { plans: [], tokens_used: 0, error: "No response from AI" };
  }

  const parsed = safeJSONParse(raw);

  if (!parsed?.plans) {
    console.warn("⚠️ Invalid JSON structure — fallback activado");
    return {
      plans: [
        {
          title:              "Plan temporal",
          description:        "La IA no devolvió datos válidos",
          estimatedPrice:     0,
          activities:         [],
          locationSuggestion: "N/A",
        },
      ],
      tokens_used,
      error: "Invalid AI response",
    };
  }

  console.log(`🟢 [AI PLANS OK] tokens: ${tokens_used}`);
  return { ...parsed, tokens_used };
};

// ─── Funciones de soporte para el orchestrator ────────────────────────────────
export const buildExperience = async (seed) => ({
  summary:     `Experiencia en ${seed?.location?.name || "destino turístico"}`,
  insight:     "Zona con alta actividad cultural y turística",
  description: "Experiencia generada por IA",
  highlights:  ["Cultura", "Gastronomía", "Historia"],
});

export const buildBudget = async () => ({
  estimated_total: 120000,
  price_range: {
    coffee: "5k - 10k COP",
    meal:   "20k - 50k COP",
    snack:  "3k - 8k COP",
  },
});

export const buildSecurity = async () => ({
  level:          "medium",
  recommendation: "Zona generalmente segura con precaución básica",
  tips: [
    "Evita calles solitarias de noche",
    "Usa transporte confiable",
    "Mantén objetos personales seguros",
  ],
});

export const buildOptimalDay = async () => ({
  date: "Sábado recomendado",
  weather: {
    condition:          "Parcialmente nublado",
    temp_min:           14,
    temp_max:           22,
    precip_probability: 20,
    icon:               "⛅",
  },
  reason: "Mejor clima y menor congestión turística",
});